import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Informe um e-mail válido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export const onboardingStep1Schema = z.object({
  clinicName: z.string().min(3, "O nome da clínica deve ter no mínimo 3 caracteres"),
  slug: z
    .string()
    .min(3, "O slug deve ter no mínimo 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "O slug só pode conter letras minúsculas, números e hífens"),
  document: z.string().min(11, "Informe um CPF ou CNPJ válido"),
  phone: z.string().min(10, "Informe um telefone/WhatsApp válido"),
});

export const onboardingStep2Schema = z.object({
  professionalName: z.string().min(3, "Informe o nome do profissional"),
  specialty: z.enum(["physio", "acupuncture", "both"]),
  councilNumber: z.string().min(3, "Informe o número do CREFITO"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
  serviceName: z.string().min(3, "Informe o nome do primeiro serviço"),
  serviceDuration: z.coerce.number().min(15).max(180),
  singlePrice: z.coerce.number().min(0, "O preço deve ser positivo"),
});

export const dayScheduleSchema = z.object({
  weekday: z.number().min(0).max(6),
  morningActive: z.boolean().default(true),
  morningStart: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM").default("08:00"),
  morningEnd: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM").default("12:00"),
  afternoonActive: z.boolean().default(true),
  afternoonStart: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM").default("13:00"),
  afternoonEnd: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM").default("18:00"),
});

export const onboardingStep3Schema = z.object({
  days: z.array(dayScheduleSchema).min(1, "Configure ao menos um dia com atendimento"),
  slotMinutes: z.coerce.number().min(15).max(120).default(50),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3Input = z.infer<typeof onboardingStep3Schema>;
