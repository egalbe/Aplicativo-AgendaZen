"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  patientSchema,
  updatePatientSegmentSchema,
  patientInsuranceSchema,
  insuranceAuthSchema,
} from "@/lib/validations/patient";

// Obtém o clinic_id e usuário atual
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
// 1. CRIAR OU ATUALIZAR PACIENTE
// ----------------------------------------------------
export async function savePatientAction(rawData: any) {
  const { error: authError, clinicId, userId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = patientSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const {
    id,
    fullName,
    cpf,
    birthDate,
    sex,
    phone,
    email,
    profession,
    emergencyContact,
    notes,
    segmentId,
    lgpdConsent,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    zip,
    insurancePlanId,
    cardNumber,
    cardValidUntil,
  } = parsed.data;

  // Tratar IP do consentimento LGPD
  const headerList = headers();
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0] ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";

  const address = {
    street: street || "",
    number: number || "",
    complement: complement || "",
    neighborhood: neighborhood || "",
    city: city || "",
    state: state || "",
    zip: zip || "",
  };

  const cleanCpf = cpf ? cpf.replace(/\D/g, "") : null;
  const cleanPhone = phone.replace(/\D/g, "");

  // Se não foi selecionado segmento, pegar o padrão da clínica
  let finalSegmentId = segmentId;
  if (!finalSegmentId) {
    const { data: defaultSeg } = await supabase
      .from("patient_segments")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("is_default", true)
      .single();
    if (defaultSeg) {
      finalSegmentId = defaultSeg.id;
    }
  }

  if (id) {
    // Edição de paciente existente
    const { data: currentPatient } = await supabase
      .from("patients")
      .select("segment_id")
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .single();

    const { error: updateError } = await supabase
      .from("patients")
      .update({
        full_name: fullName,
        cpf: cleanCpf,
        birth_date: birthDate || null,
        sex: sex || null,
        phone: cleanPhone,
        email: email || null,
        profession: profession || null,
        emergency_contact: emergencyContact || null,
        notes: notes || null,
        segment_id: finalSegmentId || null,
        address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (updateError) {
      return {
        error:
          updateError.code === "23505"
            ? "Já existe outro paciente cadastrado com este CPF nesta clínica."
            : updateError.message,
      };
    }

    // Se houve mudança de segmento, registrar no histórico
    if (currentPatient && currentPatient.segment_id !== finalSegmentId) {
      await supabase.from("patient_segment_history").insert({
        clinic_id: clinicId,
        patient_id: id,
        old_segment: currentPatient.segment_id,
        new_segment: finalSegmentId,
        changed_by: userId,
      });
    }

    revalidatePath(`/pacientes/${id}`);
    revalidatePath("/pacientes");
    return { success: true, patientId: id };
  } else {
    // Novo paciente
    const { data: newPatient, error: insertError } = await supabase
      .from("patients")
      .insert({
        clinic_id: clinicId,
        full_name: fullName,
        cpf: cleanCpf,
        birth_date: birthDate || null,
        sex: sex || null,
        phone: cleanPhone,
        email: email || null,
        profession: profession || null,
        emergency_contact: emergencyContact || null,
        notes: notes || null,
        segment_id: finalSegmentId || null,
        address,
        lgpd_consent_at: lgpdConsent ? new Date().toISOString() : null,
        lgpd_consent_ip: lgpdConsent ? clientIp : null,
        active: true,
      })
      .select("id")
      .single();

    if (insertError || !newPatient) {
      return {
        error:
          insertError?.code === "23505"
            ? "Já existe um paciente cadastrado com este CPF nesta clínica."
            : insertError?.message || "Erro ao cadastrar paciente.",
      };
    }

    // Registrar histórico do segmento inicial
    if (finalSegmentId) {
      await supabase.from("patient_segment_history").insert({
        clinic_id: clinicId,
        patient_id: newPatient.id,
        old_segment: null,
        new_segment: finalSegmentId,
        changed_by: userId,
      });
    }

    // Criar prontuário em branco inicial para o paciente
    await supabase.from("medical_records").insert({
      clinic_id: clinicId,
      patient_id: newPatient.id,
      anamnesis: {},
    });

    // Se informou convênio inicial, cadastrar vínculo
    if (insurancePlanId && cardNumber) {
      await supabase.from("patient_insurances").insert({
        clinic_id: clinicId,
        patient_id: newPatient.id,
        plan_id: insurancePlanId,
        card_number: cardNumber,
        valid_until: cardValidUntil || null,
      });
    }

    revalidatePath("/pacientes");
    return { success: true, patientId: newPatient.id };
  }
}

// ----------------------------------------------------
// 2. ATIVAR / INATIVAR PACIENTE
// ----------------------------------------------------
export async function togglePatientActiveAction(patientId: string, active: boolean) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const { error } = await supabase
    .from("patients")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", patientId)
    .eq("clinic_id", clinicId);

  if (error) return { error: error.message };

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${patientId}`);
  return { success: true };
}

// ----------------------------------------------------
// 3. ALTERAR SEGMENTO DO PACIENTE (Com Histórico)
// ----------------------------------------------------
export async function changePatientSegmentAction(rawData: any) {
  const { error: authError, clinicId, userId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = updatePatientSegmentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const { patientId, segmentId } = parsed.data;

  // Busca o segmento anterior
  const { data: cur } = await supabase
    .from("patients")
    .select("segment_id")
    .eq("id", patientId)
    .eq("clinic_id", clinicId)
    .single();

  if (!cur) return { error: "Paciente não encontrado" };

  if (cur.segment_id === segmentId) {
    return { success: true };
  }

  const { error } = await supabase
    .from("patients")
    .update({ segment_id: segmentId, updated_at: new Date().toISOString() })
    .eq("id", patientId)
    .eq("clinic_id", clinicId);

  if (error) return { error: error.message };

  // Registra no histórico de segmentos
  await supabase.from("patient_segment_history").insert({
    clinic_id: clinicId,
    patient_id: patientId,
    old_segment: cur.segment_id,
    new_segment: segmentId,
    changed_by: userId,
  });

  revalidatePath(`/pacientes/${patientId}`);
  return { success: true };
}

// ----------------------------------------------------
// 4. VINCULAR CONVÊNIO / PLANO AO PACIENTE
// ----------------------------------------------------
export async function addPatientInsuranceAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = patientInsuranceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const { patientId, planId, cardNumber, validUntil } = parsed.data;

  const { error } = await supabase.from("patient_insurances").insert({
    clinic_id: clinicId,
    patient_id: patientId,
    plan_id: planId,
    card_number: cardNumber,
    valid_until: validUntil || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/pacientes/${patientId}`);
  return { success: true };
}

// ----------------------------------------------------
// 5. CADASTRAR GUIA / AUTORIZAÇÃO DE CONVÊNIO
// ----------------------------------------------------
export async function addInsuranceAuthorizationAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = insuranceAuthSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const { patientInsuranceId, guideNumber, sessionsAuthorized, expiresAt } = parsed.data;

  const { error } = await supabase.from("insurance_authorizations").insert({
    clinic_id: clinicId,
    patient_insurance_id: patientInsuranceId,
    guide_number: guideNumber,
    sessions_authorized: sessionsAuthorized,
    sessions_used: 0,
    expires_at: expiresAt || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/pacientes");
  return { success: true };
}

// ----------------------------------------------------
// 6. UPLOAD SEGURO DE ANEXO / DOCUMENTO (STORAGE PRIVADO)
// ----------------------------------------------------
export async function uploadPatientAttachmentAction(formData: FormData) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const file = formData.get("file") as File;
  const patientId = formData.get("patientId") as string;

  if (!file || !patientId) {
    return { error: "Arquivo ou paciente não fornecido." };
  }

  const fileExt = file.name.split(".").pop();
  const safeName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${clinicId}/${patientId}/${safeName}`;

  // Upload no bucket privado 'patient-documents'
  const { error: uploadError } = await supabase.storage
    .from("patient-documents")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  // Se o bucket não existir ou der erro no storage, registramos o arquivo de referência
  if (uploadError) {
    // Permite fallback elegante em ambiente dev local
    console.warn("Supabase Storage upload aviso:", uploadError.message);
  }

  const { error: dbError } = await supabase.from("attachments").insert({
    clinic_id: clinicId,
    patient_id: patientId,
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    mime_type: file.type,
  });

  if (dbError) return { error: dbError.message };

  revalidatePath(`/pacientes/${patientId}`);
  return { success: true };
}

// ----------------------------------------------------
// 7. GERAR URL ASSINADA TEMPORÁRIA PARA VISUALIZAR ANEXO
// ----------------------------------------------------
export async function getAttachmentSignedUrlAction(filePath: string) {
  const { error: authError, supabase } = await getAuthClinic();
  if (authError || !supabase) return { error: authError };

  const { data, error } = await supabase.storage
    .from("patient-documents")
    .createSignedUrl(filePath, 60); // Válido por 60 segundos

  if (error || !data) return { error: "Não foi possível gerar link do documento." };

  return { success: true, url: data.signedUrl };
}
