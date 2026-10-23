import { z } from "zod";

export const clinicUpdateSchema = z.object({
  name: z.string().min(3, "Nome da clínica deve ter no mínimo 3 caracteres"),
  document: z.string().optional(),
  phone: z.string().min(10, "Telefone deve conter no mínimo 10 dígitos"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor primária inválida"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor secundária inválida"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor de destaque inválida"),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  cancellationLimitHours: z.coerce.number().min(0).max(72).default(4),
  maxDaysAhead: z.coerce.number().min(7).max(180).default(60),
  minNoticeHours: z.coerce.number().min(1).max(48).default(2),
});

export const professionalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nome do profissional é obrigatório"),
  specialty: z.enum(["physio", "acupuncture", "both"]),
  councilNumber: z.string().min(3, "Número do CREFITO é obrigatório"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
  commissionRate: z.coerce.number().min(0).max(100).default(50),
  active: z.boolean().default(true),
});

export const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nome do serviço é obrigatório"),
  specialty: z.enum(["physio", "acupuncture", "both"]),
  durationMin: z.coerce.number().min(15).max(180),
  active: z.boolean().default(true),
});

export const segmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome do segmento é obrigatório"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const servicePriceSchema = z.object({
  id: z.string().optional(),
  serviceId: z.string().uuid("Selecione um serviço válido"),
  segmentId: z.string().uuid("Selecione um segmento válido"),
  mode: z.enum(["single", "package", "loyalty"]),
  price: z.coerce.number().min(0, "O preço deve ser positivo"),
  sessions: z.coerce.number().min(1).optional().nullable(),
  validDays: z.coerce.number().min(1).optional().nullable(),
});

export const insurerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome da operadora é obrigatório"),
  ansRegistry: z.string().optional(),
  contact: z.string().optional(),
});

export const insurancePlanSchema = z.object({
  id: z.string().optional(),
  insurerId: z.string().uuid("Operadora inválida"),
  name: z.string().min(2, "Nome do plano é obrigatório"),
  payoutPerSession: z.coerce.number().min(0, "Valor de repasse inválido"),
  requiresAuthorization: z.boolean().default(true),
  sessionLimit: z.coerce.number().min(1).optional().nullable(),
});

export type ClinicUpdateInput = z.infer<typeof clinicUpdateSchema>;
export type ProfessionalInput = z.infer<typeof professionalSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type SegmentInput = z.infer<typeof segmentSchema>;
export type ServicePriceInput = z.infer<typeof servicePriceSchema>;
export type InsurerInput = z.infer<typeof insurerSchema>;
export type InsurancePlanInput = z.infer<typeof insurancePlanSchema>;
