"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { addMinutes, parse } from "date-fns";

async function getAuthClinic() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado", clinicId: null, userId: null, supabase: null };

  const { data: member } = await supabase
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) return { error: "Clínica não vinculada", clinicId: null, userId: null, supabase: null };

  return { error: null, clinicId: member.clinic_id, role: member.role, userId: user.id, supabase };
}

// ----------------------------------------------------
// 1. CRIAR AGENDAMENTO MANUAL / ENCAIXE PELA RECEPÇÃO
// ----------------------------------------------------
export async function createManualAppointmentAction(rawData: {
  patientId: string;
  professionalId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMin?: number;
  notes?: string;
  isWalkIn?: boolean;
}) {
  const { error: authError, clinicId, userId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const { patientId, professionalId, serviceId, date, time, durationMin = 50, notes, isWalkIn = false } = rawData;

  const startDateTime = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  const endDateTime = addMinutes(startDateTime, durationMin);

  const startIso = startDateTime.toISOString();
  const endIso = endDateTime.toISOString();
  const tstzrangeString = `[${startIso},${endIso})`;

  const { data: appt, error: apptError } = await supabase
    .from("appointments")
    .insert({
      clinic_id: clinicId,
      professional_id: professionalId,
      patient_id: patientId,
      service_id: serviceId,
      period: tstzrangeString,
      status: "scheduled",
      notes: notes || (isWalkIn ? "Encaixe manual pela recepção" : null),
      is_walk_in: isWalkIn,
    })
    .select("id")
    .single();

  if (apptError) {
    if (apptError.code === "23P01" || apptError.message?.includes("exclude")) {
      return { error: "Conflito: Este profissional já possui outro atendimento neste mesmo horário." };
    }
    return { error: "Não foi possível criar o agendamento." };
  }

  // Registrar auditoria
  await supabase.from("appointment_status_log").insert({
    clinic_id: clinicId,
    appointment_id: appt.id,
    new_status: "scheduled",
    changed_by: userId,
    reason: isWalkIn ? "Encaixe manual realizado pela recepção" : "Agendamento manual pela recepção",
  });

  revalidatePath("/agenda");
  return { success: true };
}

// ----------------------------------------------------
// 2. ATUALIZAR STATUS DO AGENDAMENTO (Confirmar, Check-in, Concluir, Cancelar)
// ----------------------------------------------------
export async function updateAppointmentStatusAction(rawData: {
  appointmentId: string;
  newStatus:
    | "scheduled"
    | "confirmed"
    | "checked_in"
    | "in_progress"
    | "done"
    | "no_show"
    | "cancelled"
    | "rescheduled";
  reason?: string;
}) {
  const { error: authError, clinicId, userId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const { appointmentId, newStatus, reason } = rawData;

  // Buscar status atual
  const { data: currentAppt } = await supabase
    .from("appointments")
    .select("status")
    .eq("id", appointmentId)
    .eq("clinic_id", clinicId)
    .single();

  if (!currentAppt) {
    return { error: "Agendamento não encontrado." };
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .eq("clinic_id", clinicId);

  if (updateError) {
    return { error: "Erro ao atualizar status." };
  }

  // Registrar log de auditoria
  await supabase.from("appointment_status_log").insert({
    clinic_id: clinicId,
    appointment_id: appointmentId,
    old_status: currentAppt.status,
    new_status: newStatus,
    changed_by: userId,
    reason: reason || null,
  });

  revalidatePath("/agenda");
  return { success: true };
}

// ----------------------------------------------------
// 3. ALTERAR REGRA DO SLOT (BLOQUEAR OU LIBERAR HORÁRIO MANUALMENTE)
// ----------------------------------------------------
export async function toggleSlotOverrideAction(rawData: {
  professionalId: string;
  startsAt: string; // ISO string
  status: "free" | "reserved" | "blocked";
}) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const { professionalId, startsAt, status } = rawData;

  const { error } = await supabase
    .from("slot_overrides")
    .upsert({
      clinic_id: clinicId,
      professional_id: professionalId,
      starts_at: startsAt,
      status: status,
    });

  if (error) {
    return { error: "Erro ao modificar horário." };
  }

  revalidatePath("/agenda");
  return { success: true };
}
