import { z } from "zod";
import { isValidCPF } from "@/lib/utils";

export const patientSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, "Nome completo deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .optional()
    .refine((val) => !val || isValidCPF(val), {
      message: "CPF inválido",
    }),
  birthDate: z.string().optional(),
  sex: z.enum(["M", "F", "other"]).optional().nullable(),
  phone: z.string().min(10, "Telefone / WhatsApp inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  profession: z.string().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
  segmentId: z.string().uuid("Selecione um segmento válido").optional().nullable(),
  lgpdConsent: z.boolean().default(true),
  // Endereço
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  // Vínculo inicial com convênio (opcional)
  insurancePlanId: z.string().uuid().optional().nullable(),
  cardNumber: z.string().optional(),
  cardValidUntil: z.string().optional(),
});

export const updatePatientSegmentSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  segmentId: z.string().uuid("ID de segmento inválido"),
  reason: z.string().optional(),
});

export const patientInsuranceSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  planId: z.string().uuid("ID do plano de convênio inválido"),
  cardNumber: z.string().min(3, "Número da carteirinha obrigatório"),
  validUntil: z.string().optional(),
});

export const insuranceAuthSchema = z.object({
  patientInsuranceId: z.string().uuid("ID do convênio do paciente inválido"),
  guideNumber: z.string().min(3, "Número da guia / autorização obrigatório"),
  sessionsAuthorized: z.coerce.number().min(1, "Mínimo 1 sessão"),
  expiresAt: z.string().optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;
export type UpdatePatientSegmentInput = z.infer<typeof updatePatientSegmentSchema>;
export type PatientInsuranceInput = z.infer<typeof patientInsuranceSchema>;
export type InsuranceAuthInput = z.infer<typeof insuranceAuthSchema>;
