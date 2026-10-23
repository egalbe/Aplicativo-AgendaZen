import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import PacienteDetalhesClient from "./PacienteDetalhesClient";

export default async function PacienteDetalhesPage({
  params,
}: {
  params: { id: string };
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
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/onboarding");
  }

  const clinicId = member.clinic_id;
  const patientId = params.id;

  // Busca dados completos do paciente
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*, patient_segments(id, name)")
    .eq("id", patientId)
    .eq("clinic_id", clinicId)
    .single();

  if (patientError || !patient) {
    notFound();
  }

  // Busca dados relacionados em paralelo
  const [
    { data: segments },
    { data: segmentHistory },
    { data: appointments },
    { data: packages },
    { data: insurances },
    { data: attachments },
    { data: medicalRecord },
    { data: recordEntries },
  ] = await Promise.all([
    supabase.from("patient_segments").select("*").eq("clinic_id", clinicId).order("name"),
    supabase
      .from("patient_segment_history")
      .select("*, old_seg:patient_segments!old_segment(name), new_seg:patient_segments!new_segment(name)")
      .eq("patient_id", patientId)
      .order("changed_at", { ascending: false }),
    supabase
      .from("appointments")
      .select("*, professionals(name, color), services(name)")
      .eq("patient_id", patientId)
      .order("period", { ascending: false }),
    supabase
      .from("patient_packages")
      .select("*, services(name)")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("patient_insurances")
      .select("*, insurance_plans(name, payout_per_session, insurers(name)), insurance_authorizations(*)")
      .eq("patient_id", patientId),
    supabase
      .from("attachments")
      .select("*")
      .eq("patient_id", patientId)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("medical_records")
      .select("*")
      .eq("patient_id", patientId)
      .maybeSingle(),
    supabase
      .from("record_entries")
      .select("*, professionals(name)")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <PacienteDetalhesClient
      patient={patient}
      segments={segments || []}
      segmentHistory={segmentHistory || []}
      appointments={appointments || []}
      packages={packages || []}
      insurances={insurances || []}
      attachments={attachments || []}
      medicalRecord={medicalRecord}
      recordEntries={recordEntries || []}
      userRole={member.role}
    />
  );
}
