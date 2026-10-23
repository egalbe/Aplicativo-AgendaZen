import { z } from "zod";

// Schema para Criar Conta a Receber
export const receivableSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().uuid("Selecione um paciente").optional().nullable(),
  appointmentId: z.string().uuid().optional().nullable(),
  packageId: z.string().uuid().optional().nullable(),
  description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de vencimento inválida"),
  status: z.enum(["open", "partially_paid", "paid", "cancelled"]).default("open"),
});

// Schema para Registrar Pagamento / Baixa
export const paymentSchema = z.object({
  receivableId: z.string().uuid("ID da conta a receber inválido"),
  amount: z.coerce.number().min(0.01, "Valor do pagamento deve ser maior que zero"),
  method: z.enum(["pix", "credit_card", "debit_card", "cash", "bank_slip", "insurance"]),
  paidAt: z.string().optional(),
  notes: z.string().optional().nullable(),
});

// Schema para Venda de Pacote de Sessões (cria pacote + conta a receber)
export const sellPackageSchema = z.object({
  patientId: z.string().uuid("Selecione um paciente"),
  serviceId: z.string().uuid("Selecione um serviço").optional().nullable(),
  sessionsTotal: z.coerce.number().min(2, "Mínimo 2 sessões para um pacote"),
  pricePaid: z.coerce.number().min(0.01, "Valor do pacote inválido"),
  validDays: z.coerce.number().min(1).default(90),
  paymentMethod: z.enum(["pix", "credit_card", "debit_card", "cash", "bank_slip"]),
  paidNow: z.boolean().default(true),
});

// Schema para Registrar Despesa / Conta a Pagar
export const expenseSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(2, "Categoria obrigatória"),
  description: z.string().min(3, "Descrição obrigatória"),
  amount: z.coerce.number().min(0.01, "Valor inválido"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de vencimento inválida"),
  paidAt: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
});

// Schema para Gerar / Fechar Comissão de Profissional
export const commissionPaymentSchema = z.object({
  commissionId: z.string().uuid("ID da comissão inválido"),
});

export type ReceivableInput = z.infer<typeof receivableSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type SellPackageInput = z.infer<typeof sellPackageSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
