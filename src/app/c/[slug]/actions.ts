"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailableSlotsForDate } from "@/lib/schedule/availability";
import { publicBookingSchema } from "@/lib/validations/public-booking";
import { headers } from "next/headers";
import { addMinutes, parse } from "date-fns";

// ----------------------------------------------------
// 1. BUSCAR HORÁRIOS DISPONÍVEIS (PÚBLICO)
// ----------------------------------------------------
export async function getPublicSlotsAction(params: {
  clinicId: string;
  professionalId: string;
  date: string;
  durationMin?: number;
}) {
  try {
    const slots = await getAvailableSlotsForDate(
      params.clinicId,
      params.professionalId,
      params.date,
      params.durationMin || 50
    );
    return { data: slots, error: null };
  } catch (err: any) {
    console.error("Erro ao buscar slots:", err);
    return { data: [], error: "Falha ao carregar horários disponíveis." };
  }
}

// ----------------------------------------------------
// 2. CRIAR AGENDAMENTO DO PACIENTE VIA QR CODE / LINK
// ----------------------------------------------------
export async function createPublicAppointmentAction(rawData: any) {
  const parsed = publicBookingSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos." };
  }

  const {
    clinicId,
    professionalId,
    serviceId,
    date,
    time,
    durationMin,
    fullName,
    phone,
    cpf,
    email,
    notes,
    lgpdConsent,
  } = parsed.data;

  const supabase = createAdminClient();

  // Capturar IP para registro do consentimento LGPD
  const headerList = headers();
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0] ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";

  try {
    // 1. Verificar se o paciente já existe na clínica (pelo CPF ou pelo Telefone)
    let patientId: string | null = null;

    if (cpf) {
      const { data: existingByCpf } = await supabase
        .from("patients")
        .select("id")
        .eq("clinic_id", clinicId)
        .eq("cpf", cpf)
        .maybeSingle();

      if (existingByCpf) {
        patientId = existingByCpf.id;
      }
    }

    if (!patientId) {
      const { data: existingByPhone } = await supabase
        .from("patients")
        .select("id")
        .eq("clinic_id", clinicId)
        .eq("phone", phone)
        .maybeSingle();

      if (existingByPhone) {
        patientId = existingByPhone.id;
      }
    }

    // 2. Se não existir, cadastrar o paciente automaticamente
    if (!patientId) {
      // Obter o segmento padrão da clínica
      const { data: defaultSeg } = await supabase
        .from("patient_segments")
        .select("id")
        .eq("clinic_id", clinicId)
        .eq("is_default", true)
        .maybeSingle();

      const { data: newPatient, error: patientErr } = await supabase
        .from("patients")
        .insert({
          clinic_id: clinicId,
          full_name: fullName,
          phone: phone,
          cpf: cpf || null,
          email: email || null,
          segment_id: defaultSeg?.id || null,
          lgpd_consent_at: new Date().toISOString(),
          lgpd_consent_ip: clientIp,
          active: true,
        })
        .select("id")
        .single();

      if (patientErr || !newPatient) {
        console.error("Erro ao cadastrar paciente:", patientErr);
        return { error: "Não foi possível registrar seus dados. Tente novamente." };
      }

      patientId = newPatient.id;

      // Criar prontuário em branco
      await supabase.from("medical_records").insert({
        clinic_id: clinicId,
        patient_id: patientId,
      });
    }

    // 3. Montar o range de horário para o agendamento no PostgreSQL
    const startDateTime = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
    const endDateTime = addMinutes(startDateTime, durationMin);

    const startIso = startDateTime.toISOString();
    const endIso = endDateTime.toISOString();
    const tstzrangeString = `[${startIso},${endIso})`;

    // 4. Inserir o agendamento
    const { data: appointment, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        clinic_id: clinicId,
        professional_id: professionalId,
        patient_id: patientId,
        service_id: serviceId,
        period: tstzrangeString,
        status: "scheduled",
        notes: notes ? `Auto-agendamento via link: ${notes}` : "Auto-agendamento via link público / QR Code",
        is_walk_in: false,
      })
      .select("id")
      .single();

    if (apptErr) {
      console.error("Erro ao inserir consulta:", apptErr);
      if (apptErr.code === "23P01" || apptErr.message?.includes("exclude")) {
        return { error: "Desculpe! Este horário acabou de ser reservado. Por favor, escolha outro horário." };
      }
      return { error: "Não foi possível confirmar o agendamento. Tente outro horário." };
    }

    // 5. Registrar no log de auditoria de status da consulta
    await supabase.from("appointment_status_log").insert({
      clinic_id: clinicId,
      appointment_id: appointment.id,
      new_status: "scheduled",
      reason: "Agendamento realizado pelo paciente via link público",
    });

    return {
      success: true,
      appointmentId: appointment.id,
      patientId,
    };
  } catch (err: any) {
    console.error("Exceção ao agendar:", err);
    return { error: "Ocorreu um erro interno. Tente novamente mais tarde." };
  }
}

// ----------------------------------------------------
// 3. BUSCAR HISTÓRICO DE AGENDAMENTOS DO PACIENTE (ÁREA DO PACIENTE)
// ----------------------------------------------------
export async function getPatientAppointmentsAction(params: {
  clinicId: string;
  phone: string;
  cpf?: string;
}) {
  const supabase = createAdminClient();
  const cleanPhone = params.phone.replace(/\D/g, "");
  const cleanCpf = params.cpf ? params.cpf.replace(/\D/g, "") : null;

  try {
    // Localizar paciente
    let query = supabase
      .from("patients")
      .select("id, full_name, phone, segment_id, patient_segments(name)")
      .eq("clinic_id", params.clinicId);

    if (cleanCpf) {
      query = query.eq("cpf", cleanCpf);
    } else {
      query = query.eq("phone", cleanPhone);
    }

    const { data: patient } = await query.maybeSingle();

    if (!patient) {
      return { data: null, error: "Nenhum paciente encontrado com esses dados." };
    }

    // Buscar consultas do paciente
    const { data: appointments } = await supabase
      .from("appointments")
      .select(`
        id,
        period,
        status,
        notes,
        services ( name, duration_min ),
        professionals ( name, specialty, color )
      `)
      .eq("patient_id", patient.id)
      .order("created_at", { ascending: false });

    // Buscar pacotes ativos do paciente
    const { data: packages } = await supabase
      .from("patient_packages")
      .select(`
        id,
        sessions_total,
        sessions_used,
        expires_at,
        services ( name )
      `)
      .eq("patient_id", patient.id);

    return {
      data: {
        patient,
        appointments: appointments || [],
        packages: packages || [],
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: "Falha ao carregar suas consultas." };
  }
}
