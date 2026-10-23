import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DivulgacaoClient from "./DivulgacaoClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code & Divulgação - AgendaZen",
  description: "Divulgue sua clínica com placas de balcão com QR Code e link direto para WhatsApp e redes sociais.",
};

export default async function DivulgacaoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Obter a clínica do usuário logado
  const { data: member } = await supabase
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/onboarding");
  }

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, name, slug, phone, address, brand_colors, logo_url")
    .eq("id", member.clinic_id)
    .single();

  if (!clinic) {
    redirect("/onboarding");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicBookingUrl = `${appUrl}/c/${clinic.slug}`;

  return (
    <DivulgacaoClient
      clinic={clinic}
      publicBookingUrl={publicBookingUrl}
    />
  );
}
