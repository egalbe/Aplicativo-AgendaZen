import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FinanceiroClient from "./FinanceiroClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financeiro & Split de Comissões - AgendaZen",
  description: "Controle de receitas, pacotes, despesas e repasses automáticos de comissões.",
};

export default async function FinanceiroPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Obter clínica e papel do usuário
  const { data: member } = await supabase
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/onboarding");
  }

  const allowedRoles = ["owner", "admin", "financial"];
  if (!allowedRoles.includes(member.role)) {
    redirect("/agenda");
  }

  const clinicId = member.clinic_id;

  // 2. Buscar Contas a Receber com pagamentos vinculados e dados do paciente
  const { data: receivables } = await supabase
    .from("receivables")
    .select(`
      id,
      patient_id,
      appointment_id,
      package_id,
      description,
      amount,
      due_date,
      status,
      created_at,
      patients ( id, full_name, phone ),
      payments ( id, amount, method, paid_at )
    `)
    .eq("clinic_id", clinicId)
    .order("due_date", { ascending: false });

  // 3. Buscar Despesas / Contas a Pagar
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("due_date", { ascending: false });

  // 4. Buscar Comissões / Repasses aos Profissionais
  const { data: commissions } = await supabase
    .from("commissions")
    .select(`
      id,
      professional_id,
      appointment_id,
      base_amount,
      commission_amount,
      status,
      paid_at,
      created_at,
      professionals ( id, name, commission_rate, specialty, color )
    `)
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  // 5. Buscar Profissionais (para filtro e comissões)
  const { data: professionals } = await supabase
    .from("professionals")
    .select("id, name, commission_rate, specialty")
    .eq("clinic_id", clinicId)
    .eq("active", true)
    .order("name");

  // 6. Buscar Pacientes (para selects de cobrança e venda de pacotes)
  const { data: patients } = await supabase
    .from("patients")
    .select("id, full_name, phone")
    .eq("clinic_id", clinicId)
    .eq("active", true)
    .order("full_name");

  // 7. Buscar Serviços (para venda de pacote)
  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_min")
    .eq("clinic_id", clinicId)
    .eq("active", true)
    .order("name");

  return (
    <FinanceiroClient
      receivables={receivables || []}
      expenses={expenses || []}
      commissions={commissions || []}
      professionals={professionals || []}
      patients={patients || []}
      services={services || []}
      userRole={member.role}
    />
  );
}
