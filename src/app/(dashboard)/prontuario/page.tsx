import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProntuarioClient from "./ProntuarioClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prontuário Eletrônico Especializado - AgendaZen",
  description: "Evolução SOAP, Mapa Corporal SVG de Fisioterapia e Catálogo de Pontos de Acupuntura.",
};

interface Props {
  searchParams: {
    paciente?: string;
  };
}

export default async function ProntuarioPage({ searchParams }: Props) {
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

  // 2. Buscar pacientes da clínica para seleção rápida
  const { data: patients } = await supabase
    .from("patients")
    .select("id, full_name, phone, cpf, birth_date")
    .eq("clinic_id", clinicId)
    .eq("active", true)
    .order("full_name");

  // Paciente selecionado (da URL ou o primeiro da lista)
  const selectedPatientId = searchParams.paciente || (patients?.[0]?.id ?? null);

  let selectedPatient = null;
  let medicalRecord = null;
  let recordEntries: any[] = [];

  if (selectedPatientId) {
    // Buscar paciente com prontuário
    const { data: p } = await supabase
      .from("patients")
      .select("*, patient_segments(name)")
      .eq("id", selectedPatientId)
      .eq("clinic_id", clinicId)
      .single();

    selectedPatient = p;

    // Buscar ou criar prontuário base
    let { data: mr } = await supabase
      .from("medical_records")
      .select("*")
      .eq("patient_id", selectedPatientId)
      .eq("clinic_id", clinicId)
      .maybeSingle();

    if (!mr && selectedPatient) {
      const { data: newMr } = await supabase
        .from("medical_records")
        .insert({
          clinic_id: clinicId,
          patient_id: selectedPatientId,
        })
        .select()
        .single();
      mr = newMr;
    }
    medicalRecord = mr;

    // Buscar evoluções clínicas anteriores com marcações corporais e pontos de acupuntura
    if (mr) {
      const { data: entries } = await supabase
        .from("record_entries")
        .select(`
          id,
          soap,
          pain_vas,
          signed_by,
          version,
          created_at,
          professionals ( id, name, color, council_number ),
          body_markings ( id, view, x, y, kind, intensity, side, note ),
          acupuncture_session_points (
            id,
            point_code,
            side,
            technique,
            retention_min,
            depth,
            note,
            acupuncture_points ( pinyin, name_pt, meridian )
          )
        `)
        .eq("record_id", mr.id)
        .order("created_at", { ascending: false });

      recordEntries = entries || [];
    }
  }

  // 3. Buscar profissionais da clínica (para assinar a evolução)
  const { data: professionals } = await supabase
    .from("professionals")
    .select("id, name, specialty, council_number, color")
    .eq("clinic_id", clinicId)
    .eq("active", true)
    .order("name");

  // 4. Buscar catálogo completo de pontos de acupuntura (361 pontos)
  const { data: acupuncturePoints } = await supabase
    .from("acupuncture_points")
    .select("code, pinyin, name_pt, meridian, location, view, point_type")
    .order("code");

  // 5. Buscar protocolos clínicos salvos da clínica
  const { data: protocols } = await supabase
    .from("treatment_protocols")
    .select("id, name, description, point_codes")
    .eq("clinic_id", clinicId)
    .order("name");

  return (
    <ProntuarioClient
      patients={patients || []}
      selectedPatient={selectedPatient}
      medicalRecord={medicalRecord}
      recordEntries={recordEntries}
      professionals={professionals || []}
      acupuncturePoints={acupuncturePoints || []}
      protocols={protocols || []}
      userRole={member.role}
    />
  );
}
