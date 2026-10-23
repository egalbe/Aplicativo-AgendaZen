import { z } from "zod";

// Schema para a Anamnese Geral do Prontuário
export const anamnesisSchema = z.object({
  recordId: z.string().uuid("ID de prontuário inválido"),
  mainComplaint: z.string().optional().default(""),
  history: z.string().optional().default(""),
  medications: z.string().optional().default(""),
  allergies: z.string().optional().default(""),
  surgeries: z.string().optional().default(""),
  habits: z.string().optional().default(""),
  lifestyle: z.string().optional().default(""),
});

// Schema para cada Ponto marcado no Mapa Corporal SVG (Fisioterapia)
export const bodyMarkingSchema = z.object({
  view: z.enum(["front", "back"]),
  x: z.coerce.number().min(0).max(100),
  y: z.coerce.number().min(0).max(100),
  kind: z.enum(["dor", "contratura", "edema", "limitacao", "lesao"]).default("dor"),
  intensity: z.coerce.number().min(0).max(10),
  side: z.enum(["left", "right", "center", "bilateral"]).default("center"),
  note: z.string().optional().nullable(),
});

// Schema para cada Ponto de Acupuntura aplicado na sessão
export const sessionPointSchema = z.object({
  pointCode: z.string().min(1, "Código do ponto obrigatório"),
  side: z.enum(["left", "right", "bilateral"]).default("bilateral"),
  technique: z.enum(["agulha", "moxa", "ventosa", "eletro", "laser", "auriculo"]).default("agulha"),
  retentionMin: z.coerce.number().min(0).max(120).default(20),
  depth: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

// Schema para uma Nova Evolução Clínica SOAP (comversionamento)
export const soapEntrySchema = z.object({
  recordId: z.string().uuid("ID de prontuário inválido"),
  patientId: z.string().uuid("ID de paciente inválido"),
  appointmentId: z.string().uuid().optional().nullable(),
  professionalId: z.string().uuid("Selecione o profissional que está atendendo"),

  // Estrutura Clássica SOAP
  subjective: z.string().min(2, "O relato Subjetivo (S) do paciente é obrigatório"),
  objective: z.string().min(2, "A avaliação Objetiva (O) e testes clínicos são obrigatórios"),
  assessment: z.string().min(2, "O Diagnóstico / Avaliação (A) é obrigatório"),
  plan: z.string().min(2, "A Conduta e Plano Terapêutico (P) são obrigatórios"),

  // Escala Visual Analógica de Dor (EVA de 0 a 10)
  painVas: z.coerce.number().min(0).max(10).default(0),

  // Mapa Corporal de Fisioterapia
  bodyMarkings: z.array(bodyMarkingSchema).optional().default([]),

  // Pontos de Acupuntura Aplicados
  acupuncturePoints: z.array(sessionPointSchema).optional().default([]),
});

// Schema para Salvar um Novo Protocolo / Fórmula Clínica de Acupuntura
export const treatmentProtocolSchema = z.object({
  name: z.string().min(3, "Nome do protocolo deve ter pelo menos 3 caracteres"),
  description: z.string().optional().default(""),
  pointCodes: z.array(z.string()).min(1, "Adicione pelo menos um ponto ao protocolo"),
});

export type AnamnesisInput = z.infer<typeof anamnesisSchema>;
export type BodyMarkingInput = z.infer<typeof bodyMarkingSchema>;
export type SessionPointInput = z.infer<typeof sessionPointSchema>;
export type SoapEntryInput = z.infer<typeof soapEntrySchema>;
export type TreatmentProtocolInput = z.infer<typeof treatmentProtocolSchema>;
