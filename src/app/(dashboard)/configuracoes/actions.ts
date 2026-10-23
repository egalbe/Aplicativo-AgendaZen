"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  clinicUpdateSchema,
  professionalSchema,
  serviceSchema,
  segmentSchema,
  servicePriceSchema,
  insurerSchema,
  insurancePlanSchema,
} from "@/lib/validations/clinic";

// Função auxiliar para obter o clinic_id do usuário logado
async function getCurrentClinicId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado", clinicId: null, supabase: null };

  const { data: member } = await supabase
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) return { error: "Nenhuma clínica encontrada", clinicId: null, supabase: null };

  return { error: null, clinicId: member.clinic_id, role: member.role, supabase };
}

// ----------------------------------------------------
// 1. DADOS DA CLÍNICA
// ----------------------------------------------------
export async function updateClinicDataAction(rawData: any) {
  const { error: authError, clinicId, role, supabase } = await getCurrentClinicId();
  if (authError || !clinicId || !supabase) return { error: authError || "Erro de permissão" };

  if (role !== "owner" && role !== "admin") {
    return { error: "Apenas administradores podem alterar os dados da clínica." };
  }

  const parsed = clinicUpdateSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const { data } = parsed;
  const address = {
    street: data.street || "",
    number: data.number || "",
    neighborhood: data.neighborhood || "",
    city: data.city || "",
    state: data.state || "",
    zip: data.zip || "",
  };

  const brandColors = {
    primary: data.primaryColor,
    secondary: data.secondaryColor,
    accent: data.accentColor,
  };

  const settings = {
    cancellation_limit_hours: data.cancellationLimitHours,
    max_days_ahead: data.maxDaysAhead,
    min_notice_hours: data.minNoticeHours,
  };

  const { error } = await supabase
    .from("clinics")
    .update({
      name: data.name,
      document: data.document,
      phone: data.phone,
      address,
      brand_colors: brandColors,
      settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clinicId);

  if (error) return { error: error.message };

  revalidatePath("/configuracoes");
  return { success: true };
}

// ----------------------------------------------------
// 2. PROFISSIONAIS (CREFITO, Cores, Repasses)
// ----------------------------------------------------
export async function saveProfessionalAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getCurrentClinicId();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = professionalSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const { id, ...fields } = parsed.data;

  if (id) {
    const { error } = await supabase
      .from("professionals")
      .update({
        name: fields.name,
        specialty: fields.specialty,
        council_number: fields.councilNumber,
        color: fields.color,
        commission_rate: fields.commissionRate,
        active: fields.active,
      })
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("professionals").insert({
      clinic_id: clinicId,
      name: fields.name,
      specialty: fields.specialty,
      council_number: fields.councilNumber,
      color: fields.color,
      commission_rate: fields.commissionRate,
      active: fields.active,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}

export async function toggleProfessionalStatusAction(id: string, active: boolean) {
  const { error: authError, clinicId, supabase } = await getCurrentClinicId();
  if (authError || !clinicId || !supabase) return { error: authError };

  const { error } = await supabase
    .from("professionals")
    .update({ active })
    .eq("id", id)
    .eq("clinic_id", clinicId);

  if (error) return { error: error.message };

  revalidatePath("/configuracoes");
  return { success: true };
}

// ----------------------------------------------------
// 3. SERVIÇOS
// ----------------------------------------------------
export async function saveServiceAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getCurrentClinicId();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = serviceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const { id, ...fields } = parsed.data;

  if (id) {
    const { error } = await supabase
      .from("services")
      .update({
        name: fields.name,
        specialty: fields.specialty,
        duration_min: fields.durationMin,
        active: fields.active,
      })
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("services").insert({
      clinic_id: clinicId,
      name: fields.name,
      specialty: fields.specialty,
      duration_min: fields.durationMin,
      active: fields.active,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}

// ----------------------------------------------------
// 4. SEGMENTOS DE PACIENTES
// ----------------------------------------------------
export async function saveSegmentAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getCurrentClinicId();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = segmentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const { id, ...fields } = parsed.data;

  // Se for definido como default, remove o default dos outros
  if (fields.isDefault) {
    await supabase
      .from("patient_segments")
      .update({ is_default: false })
      .eq("clinic_id", clinicId);
  }

  if (id) {
    const { error } = await supabase
      .from("patient_segments")
      .update({
        name: fields.name,
        description: fields.description,
        is_default: fields.isDefault,
      })
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("patient_segments").insert({
      clinic_id: clinicId,
      name: fields.name,
      description: fields.description,
      is_default: fields.isDefault,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}

// ----------------------------------------------------
// 5. TABELA DE PREÇOS (Avulso, Pacotes, Fidelidade)
// ----------------------------------------------------
export async function saveServicePriceAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getCurrentClinicId();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = servicePriceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const { id, serviceId, segmentId, mode, price, sessions, validDays } = parsed.data;

  if (id) {
    const { error } = await supabase
      .from("service_prices")
      .update({
        price,
        sessions: mode === "single" ? 1 : sessions || 10,
        valid_days: mode === "package" ? validDays || 90 : null,
      })
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("service_prices").upsert(
      {
        clinic_id: clinicId,
        service_id: serviceId,
        segment_id: segmentId,
        mode,
        price,
        sessions: mode === "single" ? 1 : sessions || 10,
        valid_days: mode === "package" ? validDays || 90 : null,
      },
      { onConflict: "service_id,segment_id,mode,sessions" }
    );

    if (error) return { error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}

export async function deleteServicePriceAction(id: string) {
  const { error: authError, clinicId, supabase } = await getCurrentClinicId();
  if (authError || !clinicId || !supabase) return { error: authError };

  const { error } = await supabase
    .from("service_prices")
    .delete()
    .eq("id", id)
    .eq("clinic_id", clinicId);

  if (error) return { error: error.message };

  revalidatePath("/configuracoes");
  return { success: true };
}

// ----------------------------------------------------
// 6. CONVÊNIOS & PLANOS
// ----------------------------------------------------
export async function saveInsurerAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getCurrentClinicId();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = insurerSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const { id, ...fields } = parsed.data;

  if (id) {
    const { error } = await supabase
      .from("insurers")
      .update(fields)
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("insurers").insert({
      clinic_id: clinicId,
      ...fields,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}

export async function saveInsurancePlanAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getCurrentClinicId();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = insurancePlanSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos" };
  }

  const { id, insurerId, name, payoutPerSession, requiresAuthorization, sessionLimit } =
    parsed.data;

  if (id) {
    const { error } = await supabase
      .from("insurance_plans")
      .update({
        name,
        payout_per_session: payoutPerSession,
        requires_authorization: requiresAuthorization,
        session_limit: sessionLimit,
      })
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("insurance_plans").insert({
      clinic_id: clinicId,
      insurer_id: insurerId,
      name,
      payout_per_session: payoutPerSession,
      requires_authorization: requiresAuthorization,
      session_limit: sessionLimit,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}
