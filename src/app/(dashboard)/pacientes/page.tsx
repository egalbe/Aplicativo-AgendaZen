import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PacientesListClient from "./PacientesListClient";

export default async function PacientesPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; segment?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: member } = await supabase
    .from("clinic_members")
    .select("clinic_id")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/onboarding");
  }

  const clinicId = member.clinic_id;

  // Busca lista de segmentos da clínica para filtros
  const { data: segments } = await supabase
    .from("patient_segments")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("name");

  // Busca lista de convênios/planos para cadastro rápido
  const { data: plans } = await supabase
    .from("insurance_plans")
    .select("*, insurers(name)")
    .eq("clinic_id", clinicId);

  // Query de pacientes com filtros
  let query = supabase
    .from("patients")
    .select("*, patient_segments(name)")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  if (searchParams?.q) {
    const term = searchParams.q.trim();
    query = query.or(`full_name.ilike.%${term}%,cpf.ilike.%${term}%,phone.ilike.%${term}%`);
  }

  if (searchParams?.status === "active") {
    query = query.eq("active", true);
  } else if (searchParams?.status === "inactive") {
    query = query.eq("active", false);
  }

  if (searchParams?.segment && searchParams.segment !== "all") {
    query = query.eq("segment_id", searchParams.segment);
  }

  const { data: patients } = await query;

  return (
    <PacientesListClient
      initialPatients={patients || []}
      segments={segments || []}
      plans={plans || []}
    />
  );
}
