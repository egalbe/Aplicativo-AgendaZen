"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
} from "@/lib/validations/auth";

export interface OnboardingState {
  step1: {
    clinicName: string;
    slug: string;
    document: string;
    phone: string;
  };
  step2: {
    professionalName: string;
    specialty: "physio" | "acupuncture" | "both";
    councilNumber: string;
    color: string;
    serviceName: string;
    serviceDuration: number;
    singlePrice: number;
  };
  step3: {
    weekdays: number[];
    startTime: string;
    endTime: string;
    slotMinutes: number;
  };
}

export async function completeOnboardingAction(data: OnboardingState) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  // Validação dos dados
  const v1 = onboardingStep1Schema.safeParse(data.step1);
  const v2 = onboardingStep2Schema.safeParse(data.step2);
  const v3 = onboardingStep3Schema.safeParse(data.step3);

  if (!v1.success || !v2.success || !v3.success) {
    return { error: "Alguns campos obrigatórios estão incompletos." };
  }

  // 1. Inserir a Clínica
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .insert({
      name: v1.data.clinicName,
      slug: v1.data.slug.toLowerCase().trim(),
      document: v1.data.document,
      phone: v1.data.phone,
    })
    .select("id")
    .single();

  if (clinicError || !clinic) {
    return {
      error:
        clinicError?.code === "23505"
          ? "Este slug de clínica já está em uso. Escolha outro."
          : clinicError?.message || "Erro ao criar clínica.",
    };
  }

  const clinicId = clinic.id;

  // 2. Vincular o usuário como OWNER na clinic_members
  const { data: member, error: memberError } = await supabase
    .from("clinic_members")
    .insert({
      clinic_id: clinicId,
      user_id: user.id,
      role: "owner",
    })
    .select("id")
    .single();

  if (memberError || !member) {
    return { error: "Erro ao vincular administrador da clínica." };
  }

  // 3. Criar o segmento de paciente padrão (Particular Padrão)
  const { data: segment } = await supabase
    .from("patient_segments")
    .insert({
      clinic_id: clinicId,
      name: "Particular Padrão",
      description: "Segmento inicial atribuído automaticamente",
      is_default: true,
    })
    .select("id")
    .single();

  // 4. Criar o primeiro Profissional
  const { data: prof, error: profError } = await supabase
    .from("professionals")
    .insert({
      clinic_id: clinicId,
      member_id: member.id,
      name: v2.data.professionalName,
      specialty: v2.data.specialty,
      council_number: v2.data.councilNumber,
      color: v2.data.color,
      commission_rate: 100.0,
      active: true,
    })
    .select("id")
    .single();

  if (profError || !prof) {
    return { error: "Erro ao cadastrar profissional." };
  }

  // 5. Criar o primeiro Serviço e sua tabela de preço avulsa
  const { data: service } = await supabase
    .from("services")
    .insert({
      clinic_id: clinicId,
      name: v2.data.serviceName,
      specialty: v2.data.specialty,
      duration_min: v2.data.serviceDuration,
      active: true,
    })
    .select("id")
    .single();

  if (service && segment) {
    await supabase.from("service_prices").insert({
      clinic_id: clinicId,
      service_id: service.id,
      segment_id: segment.id,
      mode: "single",
      price: v2.data.singlePrice,
      sessions: 1,
    });
  }

  // 6. Criar as regras de horário de atendimento na agenda (schedule_rules)
  const rules = v3.data.weekdays.map((weekday) => ({
    clinic_id: clinicId,
    professional_id: prof.id,
    weekday,
    start_time: v3.data.startTime,
    end_time: v3.data.endTime,
    slot_minutes: v3.data.slotMinutes,
    default_status: "free",
  }));

  await supabase.from("schedule_rules").insert(rules);

  redirect("/agenda");
}
