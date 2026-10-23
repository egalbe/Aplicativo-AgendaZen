import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import PublicBookingClient from "./PublicBookingClient";
import type { Metadata } from "next";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: clinic } = await supabase
    .from("clinics")
    .select("name, phone, address")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!clinic) {
    return {
      title: "Clínica não encontrada - AgendaZen",
    };
  }

  return {
    title: `Agendamento Online - ${clinic.name}`,
    description: `Agende sua sessão de Fisioterapia ou Acupuntura na ${clinic.name}. Escolha o melhor dia e horário de forma rápida pelo seu celular.`,
  };
}

export default async function PublicClinicPage({ params }: Props) {
  const supabase = createAdminClient();

  // 1. Buscar a clínica pelo slug
  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, name, slug, phone, address, brand_colors, logo_url, settings")
    .eq("slug", params.slug)
    .eq("active", true)
    .maybeSingle();

  if (!clinic) {
    notFound();
  }

  // 2. Buscar profissionais ativos da clínica
  const { data: professionals } = await supabase
    .from("professionals")
    .select("id, name, specialty, council_number, color, photo_url")
    .eq("clinic_id", clinic.id)
    .eq("active", true)
    .order("name");

  // 3. Buscar serviços ativos da clínica
  const { data: services } = await supabase
    .from("services")
    .select("id, name, specialty, duration_min")
    .eq("clinic_id", clinic.id)
    .eq("active", true)
    .order("name");

  // 4. Buscar segmento padrão para obter tabela de preços padrão (avulso)
  const { data: defaultSegment } = await supabase
    .from("patient_segments")
    .select("id, name")
    .eq("clinic_id", clinic.id)
    .eq("is_default", true)
    .maybeSingle();

  let servicePrices: any[] = [];
  if (defaultSegment) {
    const { data: prices } = await supabase
      .from("service_prices")
      .select("service_id, price, mode, sessions")
      .eq("clinic_id", clinic.id)
      .eq("segment_id", defaultSegment.id)
      .eq("mode", "single");
    servicePrices = prices || [];
  }

  return (
    <PublicBookingClient
      clinic={clinic}
      professionals={professionals || []}
      services={services || []}
      prices={servicePrices}
    />
  );
}
