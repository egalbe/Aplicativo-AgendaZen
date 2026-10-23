import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AgendaClient from "./AgendaClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda Integrada - AgendaZen",
  description: "Grade de horários, consultas agendadas, confirmações e encaixes manuais.",
};

export default async function AgendaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Obter clínica e perfil
  const { data: member } = await supabase
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/onboarding");
  }

  const clinicId = member.clinic_id;

  // 2. Buscar profissionais ativos
  const { data: professionals } = await supabase
    .from("professionals")
    .select("id, name, specialty, council_number, color")
    .eq("clinic_id", clinicId)
    .eq("active", true)
    .order("name");

  // 3. Buscar serviços ativos
  const { data: services } = await supabase
    .from("services")
    .select("id, name, specialty, duration_min")
    .eq("clinic_id", clinicId)
    .eq("active", true)
    .order("name");

  // 4. Buscar pacientes para select de agendamento manual
  const { data: patients } = await supabase
    .from("patients")
    .select("id, full_name, phone, cpf")
    .eq("clinic_id", clinicId)
    .eq("active", true)
    .order("full_name");

  // 5. Buscar agendamentos existentes (últimos 30 dias e próximos 60 dias)
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id,
      professional_id,
      patient_id,
      service_id,
      period,
      status,
      notes,
      is_walk_in,
      patients ( id, full_name, phone ),
      professionals ( id, name, color, specialty ),
      services ( id, name, duration_min )
    `)
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  // 6. Buscar regras de horários para saber quais horários são free/reserved
  const { data: scheduleRules } = await supabase
    .from("schedule_rules")
    .select("*, schedule_breaks(*)")
    .eq("clinic_id", clinicId)
    .eq("active", true);

  return (
    <AgendaClient
      clinicId={clinicId}
      professionals={professionals || []}
      services={services || []}
      patients={patients || []}
      initialAppointments={appointments || []}
      scheduleRules={scheduleRules || []}
    />
  );
}
