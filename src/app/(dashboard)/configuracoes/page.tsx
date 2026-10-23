import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConfiguracoesClient from "./ConfiguracoesClient";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Busca a clínica do usuário logado
  const { data: member } = await supabase
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/onboarding");
  }

  const clinicId = member.clinic_id;

  // Busca todos os dados da clínica em paralelo
  const [
    { data: clinic },
    { data: professionals },
    { data: services },
    { data: segments },
    { data: prices },
    { data: insurers },
    { data: plans },
  ] = await Promise.all([
    supabase.from("clinics").select("*").eq("id", clinicId).single(),
    supabase.from("professionals").select("*").eq("clinic_id", clinicId).order("name"),
    supabase.from("services").select("*").eq("clinic_id", clinicId).order("name"),
    supabase.from("patient_segments").select("*").eq("clinic_id", clinicId).order("is_default", { ascending: false }),
    supabase.from("service_prices").select("*, services(name), patient_segments(name)").eq("clinic_id", clinicId),
    supabase.from("insurers").select("*").eq("clinic_id", clinicId).order("name"),
    supabase.from("insurance_plans").select("*, insurers(name)").eq("clinic_id", clinicId),
  ]);

  return (
    <ConfiguracoesClient
      initialClinic={clinic}
      initialProfessionals={professionals || []}
      initialServices={services || []}
      initialSegments={segments || []}
      initialPrices={prices || []}
      initialInsurers={insurers || []}
      initialPlans={plans || []}
      userRole={member.role}
    />
  );
}
