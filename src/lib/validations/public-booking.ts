import { z } from "zod";
import { isValidCPF } from "@/lib/utils";

// Schema para o agendamento público pelo paciente em /c/[slug]
export const publicBookingSchema = z.object({
  clinicId: z.string().uuid("Clínica inválida"),
  professionalId: z.string().uuid("Selecione um profissional"),
  serviceId: z.string().uuid("Selecione o serviço"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (AAAA-MM-DD)"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido (HH:MM)"),
  durationMin: z.coerce.number().min(10).max(240).default(50),

  // Dados do paciente
  fullName: z
    .string()
    .min(3, "Nome completo deve ter pelo menos 3 caracteres")
    .max(120),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 10 || val.length === 11, {
      message: "Telefone deve conter DDD + 8 ou 9 dígitos",
    }),
  cpf: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.replace(/\D/g, "") : null))
    .refine((val) => !val || isValidCPF(val), {
      message: "CPF inválido",
    }),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  notes: z.string().max(500, "Observação muito longa").optional().or(z.literal("")),

  // Consentimento LGPD Obrigatório
  lgpdConsent: z.boolean().refine((val) => val === true, {
    message: "É obrigatório aceitar o termo de consentimento LGPD para agendar",
  }),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
