"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  anamnesisSchema,
  soapEntrySchema,
  treatmentProtocolSchema,
} from "@/lib/validations/medical-record";

// Obtém clínica, papel e usuário atual
async function getAuthClinic() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado", clinicId: null, userId: null, role: null, supabase: null };
  }

  const { data: member } = await supabase
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return { error: "Clínica não vinculada", clinicId: null, userId: null, role: null, supabase: null };
  }

  // Garantir conformidade com RLS: Apenas owner, admin e professional podem acessar prontuário
  const allowedRoles = ["owner", "admin", "professional"];
  if (!allowedRoles.includes(member.role)) {
    return {
      error: "Acesso negado: Somente profissionais de saúde ou administradores podem gerenciar o prontuário clínico.",
      clinicId: null,
      userId: null,
      role: null,
      supabase: null,
    };
  }

  return { error: null, clinicId: member.clinic_id, role: member.role, userId: user.id, supabase };
}

// ----------------------------------------------------
// 1. ATUALIZAR ANAMNESE GERAL DO PACIENTE
// ----------------------------------------------------
export async function saveAnamnesisAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = anamnesisSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos." };
  }

  const { recordId, mainComplaint, history, medications, allergies, surgeries, habits, lifestyle } =
    parsed.data;

  const anamnesisJson = {
    main_complaint: mainComplaint,
    history,
    medications,
    allergies,
    surgeries,
    habits,
    lifestyle,
  };

  const { error } = await supabase
    .from("medical_records")
    .update({
      anamnesis: anamnesisJson,
      updated_at: new Date().toISOString(),
    })
    .eq("id", recordId)
    .eq("clinic_id", clinicId);

  if (error) {
    console.error("Erro ao salvar anamnese:", error);
    return { error: "Não foi possível salvar os dados da anamnese." };
  }

  revalidatePath("/prontuario");
  return { success: true };
}

// ----------------------------------------------------
// 2. REGISTRAR NOVA EVOLUÇÃO CLÍNICA SOAP (COM MAPA E PONTOS)
// ----------------------------------------------------
export async function saveSoapEntryAction(rawData: any) {
  const { error: authError, clinicId, userId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = soapEntrySchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados do SOAP inválidos." };
  }

  const {
    recordId,
    patientId,
    appointmentId,
    professionalId,
    subjective,
    objective,
    assessment,
    plan,
    painVas,
    bodyMarkings,
    acupuncturePoints,
  } = parsed.data;

  // Buscar informações do profissional para assinatura legal no prontuário
  const { data: prof } = await supabase
    .from("professionals")
    .select("name, council_number")
    .eq("id", professionalId)
    .single();

  const signedBy = prof
    ? `${prof.name} (${prof.council_number || "Fisioterapeuta/Acupunturista"})`
    : `Profissional ID: ${professionalId}`;

  // 1. Inserir a evolução clínica SOAP imutável
  const { data: entry, error: entryErr } = await supabase
    .from("record_entries")
    .insert({
      clinic_id: clinicId,
      record_id: recordId,
      appointment_id: appointmentId || null,
      professional_id: professionalId,
      soap: {
        subjective,
        objective,
        assessment,
        plan,
      },
      pain_vas: painVas,
      version: 1,
      signed_by: signedBy,
    })
    .select("id")
    .single();

  if (entryErr || !entry) {
    console.error("Erro ao registrar evolução SOAP:", entryErr);
    return { error: "Falha ao registrar evolução clínica." };
  }

  const entryId = entry.id;

  // 2. Se houver marcações no mapa corporal de fisioterapia, salvar
  if (bodyMarkings && bodyMarkings.length > 0) {
    const markingsToInsert = bodyMarkings.map((m) => ({
      clinic_id: clinicId,
      entry_id: entryId,
      view: m.view,
      x: m.x,
      y: m.y,
      kind: m.kind,
      intensity: m.intensity,
      side: m.side,
      note: m.note || null,
    }));

    const { error: markingsErr } = await supabase
      .from("body_markings")
      .insert(markingsToInsert);

    if (markingsErr) {
      console.error("Erro ao gravar marcações corporais:", markingsErr);
    }
  }

  // 3. Se houver pontos de acupuntura aplicados, salvar
  if (acupuncturePoints && acupuncturePoints.length > 0) {
    const pointsToInsert = acupuncturePoints.map((p) => ({
      clinic_id: clinicId,
      entry_id: entryId,
      point_code: p.pointCode,
      side: p.side,
      technique: p.technique,
      retention_min: p.retentionMin,
      depth: p.depth || null,
      note: p.note || null,
    }));

    const { error: pointsErr } = await supabase
      .from("acupuncture_session_points")
      .insert(pointsToInsert);

    if (pointsErr) {
      console.error("Erro ao gravar pontos de acupuntura:", pointsErr);
    }
  }

  // 4. Se esta evolução for vinculada a um agendamento, atualizar status da consulta para "done"
  if (appointmentId) {
    await supabase
      .from("appointments")
      .update({
        status: "done",
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);
  }

  // 5. Auditoria
  await supabase.from("audit_logs").insert({
    clinic_id: clinicId,
    user_id: userId,
    action: "INSERT",
    table_name: "record_entries",
    row_id: entryId,
    diff: {
      patient_id: patientId,
      pain_vas: painVas,
      markings_count: bodyMarkings?.length || 0,
      points_count: acupuncturePoints?.length || 0,
    },
  });

  revalidatePath(`/prontuario`);
  revalidatePath(`/pacientes/${patientId}`);
  return { success: true, entryId };
}

// ----------------------------------------------------
// 3. SALVAR OU EXCLUIR PROTOCOLO CLÍNICO DE ACUPUNTURA
// ----------------------------------------------------
export async function saveTreatmentProtocolAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = treatmentProtocolSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos." };
  }

  const { name, description, pointCodes } = parsed.data;

  const { error } = await supabase.from("treatment_protocols").insert({
    clinic_id: clinicId,
    name,
    description: description || null,
    point_codes: pointCodes,
  });

  if (error) {
    return { error: "Não foi possível salvar o protocolo." };
  }

  revalidatePath("/prontuario");
  return { success: true };
}

export async function deleteTreatmentProtocolAction(protocolId: string) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const { error } = await supabase
    .from("treatment_protocols")
    .delete()
    .eq("id", protocolId)
    .eq("clinic_id", clinicId);

  if (error) {
    return { error: "Falha ao remover protocolo." };
  }

  revalidatePath("/prontuario");
  return { success: true };
}
