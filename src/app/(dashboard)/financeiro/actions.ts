"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { addDays, format } from "date-fns";
import {
  receivableSchema,
  paymentSchema,
  sellPackageSchema,
  expenseSchema,
} from "@/lib/validations/financial";

// Obtém clínica, usuário e permissão
async function getAuthClinic() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado", clinicId: null, userId: null, role: null, supabase: null };
  }

  const { data: member } = await supabase
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return { error: "Clínica não vinculada", clinicId: null, userId: null, role: null, supabase: null };
  }

  // Permissão financeira: owner, admin e financial
  const allowedRoles = ["owner", "admin", "financial"];
  if (!allowedRoles.includes(member.role)) {
    return {
      error: "Acesso negado: Seu perfil não possui permissão para acessar o módulo financeiro.",
      clinicId: null,
      userId: null,
      role: null,
      supabase: null,
    };
  }

  return { error: null, clinicId: member.clinic_id, role: member.role, userId: user.id, supabase };
}

// ----------------------------------------------------
// 1. CRIAR CONTA A RECEBER MANUAL
// ----------------------------------------------------
export async function createReceivableAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = receivableSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados inválidos." };
  }

  const { patientId, appointmentId, packageId, description, amount, dueDate } = parsed.data;

  const { error } = await supabase.from("receivables").insert({
    clinic_id: clinicId,
    patient_id: patientId || null,
    appointment_id: appointmentId || null,
    package_id: packageId || null,
    description,
    amount,
    due_date: dueDate,
    status: "open",
  });

  if (error) {
    console.error("Erro ao criar conta a receber:", error);
    return { error: "Falha ao registrar cobrança." };
  }

  revalidatePath("/financeiro");
  return { success: true };
}

// ----------------------------------------------------
// 2. DAR BAIXA / REGISTRAR PAGAMENTO (PIX, CARTÃO, DINHEIRO)
// ----------------------------------------------------
export async function registerPaymentAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = paymentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados de pagamento inválidos." };
  }

  const { receivableId, amount, method, paidAt, notes } = parsed.data;

  // 1. Buscar conta a receber atual
  const { data: rec } = await supabase
    .from("receivables")
    .select("*, payments(amount)")
    .eq("id", receivableId)
    .eq("clinic_id", clinicId)
    .single();

  if (!rec) {
    return { error: "Conta a receber não encontrada." };
  }

  // 2. Inserir registro de pagamento
  const { error: payErr } = await supabase.from("payments").insert({
    clinic_id: clinicId,
    receivable_id: receivableId,
    amount,
    method,
    paid_at: paidAt || new Date().toISOString(),
    notes: notes || null,
  });

  if (payErr) {
    console.error("Erro ao inserir pagamento:", payErr);
    return { error: "Não foi possível registrar o pagamento." };
  }

  // 3. Calcular total já pago (incluindo o novo pagamento)
  const existingPaid = (rec.payments || []).reduce(
    (acc: number, p: any) => acc + Number(p.amount),
    0
  );
  const totalPaid = existingPaid + amount;

  let newStatus: "open" | "partially_paid" | "paid" = "partially_paid";
  if (totalPaid >= Number(rec.amount)) {
    newStatus = "paid";
  }

  await supabase
    .from("receivables")
    .update({ status: newStatus })
    .eq("id", receivableId);

  // 4. Se a conta a receber for referente a uma consulta que possui profissional com comissão,
  // gerar automaticamente o registro de comissão a pagar para o profissional
  if (rec.appointment_id) {
    const { data: appt } = await supabase
      .from("appointments")
      .select("professional_id")
      .eq("id", rec.appointment_id)
      .maybeSingle();

    if (appt?.professional_id) {
      const { data: prof } = await supabase
        .from("professionals")
        .select("commission_rate")
        .eq("id", appt.professional_id)
        .maybeSingle();

      if (prof?.commission_rate) {
        const rate = Number(prof.commission_rate);
        if (rate > 0) {
          const commAmount = (amount * rate) / 100;
          await supabase.from("commissions").insert({
            clinic_id: clinicId,
            professional_id: appt.professional_id,
            appointment_id: rec.appointment_id,
            base_amount: amount,
            commission_amount: Number(commAmount.toFixed(2)),
            status: "pending",
          });
        }
      }
    }
  }

  revalidatePath("/financeiro");
  return { success: true };
}

// ----------------------------------------------------
// 3. VENDER PACOTE DE SESSÕES COM CRIAÇÃO DE RECEBÍVEL E BAIXA
// ----------------------------------------------------
export async function sellPackageAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = sellPackageSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados do pacote inválidos." };
  }

  const {
    patientId,
    serviceId,
    sessionsTotal,
    pricePaid,
    validDays,
    paymentMethod,
    paidNow,
  } = parsed.data;

  const expiresAt = format(addDays(new Date(), validDays), "yyyy-MM-dd");

  // 1. Criar o pacote do paciente
  const { data: pkg, error: pkgErr } = await supabase
    .from("patient_packages")
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      service_id: serviceId || null,
      sessions_total: sessionsTotal,
      sessions_used: 0,
      price_paid: pricePaid,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (pkgErr || !pkg) {
    console.error("Erro ao criar pacote:", pkgErr);
    return { error: "Não foi possível gerar o pacote." };
  }

  // 2. Criar a conta a receber
  const { data: rec, error: recErr } = await supabase
    .from("receivables")
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      package_id: pkg.id,
      description: `Venda de Pacote com ${sessionsTotal} sessões`,
      amount: pricePaid,
      due_date: format(new Date(), "yyyy-MM-dd"),
      status: paidNow ? "paid" : "open",
    })
    .select("id")
    .single();

  if (recErr || !rec) {
    console.error("Erro ao criar recebível de pacote:", recErr);
    return { error: "Pacote criado, mas falha ao gerar cobrança." };
  }

  // 3. Se foi pago no ato, registrar o pagamento
  if (paidNow) {
    await supabase.from("payments").insert({
      clinic_id: clinicId,
      receivable_id: rec.id,
      amount: pricePaid,
      method: paymentMethod,
      paid_at: new Date().toISOString(),
      notes: "Pagamento total na adesão do pacote",
    });
  }

  revalidatePath("/financeiro");
  revalidatePath(`/pacientes/${patientId}`);
  return { success: true, packageId: pkg.id };
}

// ----------------------------------------------------
// 4. REGISTRAR DESPESA / CONTA A PAGAR
// ----------------------------------------------------
export async function saveExpenseAction(rawData: any) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const parsed = expenseSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dados de despesa inválidos." };
  }

  const { id, category, description, amount, dueDate, paidAt, isRecurring } = parsed.data;

  if (id) {
    const { error } = await supabase
      .from("expenses")
      .update({
        category,
        description,
        amount,
        due_date: dueDate,
        paid_at: paidAt || null,
        is_recurring: isRecurring,
      })
      .eq("id", id)
      .eq("clinic_id", clinicId);

    if (error) return { error: "Falha ao atualizar despesa." };
  } else {
    const { error } = await supabase.from("expenses").insert({
      clinic_id: clinicId,
      category,
      description,
      amount,
      due_date: dueDate,
      paid_at: paidAt || null,
      is_recurring: isRecurring,
    });

    if (error) return { error: "Falha ao registrar despesa." };
  }

  revalidatePath("/financeiro");
  return { success: true };
}

// ----------------------------------------------------
// 5. DAR BAIXA EM DESPESA (MARCAR COMO PAGA)
// ----------------------------------------------------
export async function payExpenseAction(expenseId: string) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const { error } = await supabase
    .from("expenses")
    .update({
      paid_at: format(new Date(), "yyyy-MM-dd"),
    })
    .eq("id", expenseId)
    .eq("clinic_id", clinicId);

  if (error) return { error: "Falha ao pagar despesa." };

  revalidatePath("/financeiro");
  return { success: true };
}

// ----------------------------------------------------
// 6. EFETUAR REPASSE / PAGAR COMISSÃO DO PROFISSIONAL
// ----------------------------------------------------
export async function markCommissionAsPaidAction(commissionId: string) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const { error } = await supabase
    .from("commissions")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", commissionId)
    .eq("clinic_id", clinicId);

  if (error) {
    return { error: "Não foi possível liquidar a comissão." };
  }

  revalidatePath("/financeiro");
  return { success: true };
}

// ----------------------------------------------------
// 7. GERAR COMISSÃO MANUAL OU AJUSTE DE REPASSE
// ----------------------------------------------------
export async function createManualCommissionAction(rawData: {
  professionalId: string;
  baseAmount: number;
  commissionAmount: number;
  notes?: string;
}) {
  const { error: authError, clinicId, supabase } = await getAuthClinic();
  if (authError || !clinicId || !supabase) return { error: authError };

  const { professionalId, baseAmount, commissionAmount } = rawData;

  const { error } = await supabase.from("commissions").insert({
    clinic_id: clinicId,
    professional_id: professionalId,
    base_amount: baseAmount,
    commission_amount: commissionAmount,
    status: "pending",
  });

  if (error) {
    return { error: "Falha ao criar repasse." };
  }

  revalidatePath("/financeiro");
  return { success: true };
}
