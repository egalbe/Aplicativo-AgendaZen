"use client";

import { useState } from "react";
import { completeOnboardingAction, type OnboardingState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Building2, User, Clock, ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";

const WEEKDAYS = [
  { id: 1, label: "Segunda" },
  { id: 2, label: "Terça" },
  { id: 3, label: "Quarta" },
  { id: 4, label: "Quinta" },
  { id: 5, label: "Sexta" },
  { id: 6, label: "Sábado" },
  { id: 0, label: "Domingo" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado unificado dos 3 passos
  const [formData, setFormData] = useState<OnboardingState>({
    step1: {
      clinicName: "",
      slug: "",
      document: "",
      phone: "",
    },
    step2: {
      professionalName: "",
      specialty: "physio",
      councilNumber: "",
      color: "#0F4C5C",
      serviceName: "Fisioterapia Ortopédica",
      serviceDuration: 50,
      singlePrice: 150,
    },
    step3: {
      weekdays: [1, 2, 3, 4, 5],
      startTime: "08:00",
      endTime: "18:00",
      slotMinutes: 50,
    },
  });

  // Geração automática de slug a partir do nome da clínica
  function handleClinicNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    setFormData((prev) => ({
      ...prev,
      step1: { ...prev.step1, clinicName: name, slug },
    }));
  }

  function toggleWeekday(day: number) {
    setFormData((prev) => {
      const current = prev.step3.weekdays;
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day];
      return {
        ...prev,
        step3: { ...prev.step3, weekdays: next },
      };
    });
  }

  async function handleFinalSubmit() {
    setError(null);
    setLoading(true);

    const result = await completeOnboardingAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="border-b bg-slate-50/50 pb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
            Passo {step} de 3
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step
                    ? "w-8 bg-brand-dark"
                    : s < step
                    ? "w-2 bg-brand-light"
                    : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <CardTitle className="text-xl font-bold text-brand-dark flex items-center gap-2">
          {step === 1 && (
            <>
              <Building2 className="h-5 w-5 text-brand-light" /> Dados da sua Clínica ou Consultório
            </>
          )}
          {step === 2 && (
            <>
              <User className="h-5 w-5 text-brand-light" /> Perfil Profissional & Primeiro Serviço
            </>
          )}
          {step === 3 && (
            <>
              <Clock className="h-5 w-5 text-brand-light" /> Grade de Horários de Atendimento
            </>
          )}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Defina a identidade da sua clínica e o link público de agendamento."}
          {step === 2 && "Cadastre seu registro profissional (CREFITO) e seu serviço principal."}
          {step === 3 && "Configure os dias e horários padrão em que você atende."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PASSO 1: DADOS DA CLÍNICA */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="clinicName">Nome da Clínica ou Consultório</Label>
              <Input
                id="clinicName"
                value={formData.step1.clinicName}
                onChange={(e) => handleClinicNameChange(e.target.value)}
                placeholder="Ex: Clínica Zen Fisioterapia & Acupuntura"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Link Público da Clínica (QR Code)</Label>
              <div className="flex items-center rounded-md border border-input bg-slate-50 px-3 py-1 text-sm text-slate-500">
                <span className="font-mono text-xs">agendazen.com.br/c/</span>
                <input
                  id="slug"
                  value={formData.step1.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      step1: { ...prev.step1, slug: e.target.value },
                    }))
                  }
                  className="w-full bg-transparent font-medium text-brand-dark focus:outline-none"
                  placeholder="sua-clinica"
                />
              </div>
              <p className="text-xs text-slate-500">
                Este será o endereço do QR Code para o auto-cadastro dos pacientes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="document">CPF ou CNPJ</Label>
                <Input
                  id="document"
                  value={formData.step1.document}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      step1: { ...prev.step1, document: e.target.value },
                    }))
                  }
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  value={formData.step1.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      step1: { ...prev.step1, phone: e.target.value },
                    }))
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={() => {
                if (!formData.step1.clinicName || !formData.step1.slug) {
                  setError("Preencha o nome da clínica e o link público.");
                  return;
                }
                setError(null);
                setStep(2);
              }}
              className="w-full mt-4 bg-brand-dark hover:bg-brand-primary font-semibold"
            >
              Avançar para Passo 2 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* PASSO 2: PROFISSIONAL E SERVIÇO */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="professionalName">Nome do Profissional Responsável</Label>
              <Input
                id="professionalName"
                value={formData.step2.professionalName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    step2: { ...prev.step2, professionalName: e.target.value },
                  }))
                }
                placeholder="Ex: Dr. Lucas Fernandes"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Especialidade Principal</Label>
                <select
                  value={formData.step2.specialty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      step2: {
                        ...prev.step2,
                        specialty: e.target.value as "physio" | "acupuncture" | "both",
                      },
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="physio">Fisioterapia</option>
                  <option value="acupuncture">Acupuntura</option>
                  <option value="both">Fisioterapia & Acupuntura</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="councilNumber">Registro CREFITO</Label>
                <Input
                  id="councilNumber"
                  value={formData.step2.councilNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      step2: { ...prev.step2, councilNumber: e.target.value },
                    }))
                  }
                  placeholder="CREFITO-3/123456-F"
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Primeiro Serviço Oferecido
              </span>

              <div className="space-y-1.5">
                <Label htmlFor="serviceName">Nome do Procedimento</Label>
                <Input
                  id="serviceName"
                  value={formData.step2.serviceName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      step2: { ...prev.step2, serviceName: e.target.value },
                    }))
                  }
                  placeholder="Ex: Consulta de Avaliação e Tratamento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.step2.serviceDuration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        step2: { ...prev.step2, serviceDuration: +e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price">Valor da Sessão (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.step2.singlePrice}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        step2: { ...prev.step2, singlePrice: +e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="w-1/3"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!formData.step2.professionalName || !formData.step2.serviceName) {
                    setError("Preencha o nome do profissional e do serviço.");
                    return;
                  }
                  setError(null);
                  setStep(3);
                }}
                className="w-2/3 bg-brand-dark hover:bg-brand-primary font-semibold"
              >
                Avançar para Passo 3 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PASSO 3: HORÁRIOS DE ATENDIMENTO */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dias da Semana com Atendimento</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {WEEKDAYS.map((day) => {
                  const selected = formData.step3.weekdays.includes(day.id);
                  return (
                    <button
                      type="button"
                      key={day.id}
                      onClick={() => toggleWeekday(day.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        selected
                          ? "bg-brand-dark text-white border-brand-dark"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {day.label}
                      {selected && <Check className="h-3.5 w-3.5 text-brand-light" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startTime">Horário de Início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.step3.startTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      step3: { ...prev.step3, startTime: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endTime">Horário de Término</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.step3.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      step3: { ...prev.step3, endTime: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slotMinutes">Duração Padrão do Slot de Atendimento</Label>
              <select
                id="slotMinutes"
                value={formData.step3.slotMinutes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    step3: { ...prev.step3, slotMinutes: +e.target.value },
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={50}>50 minutos (Recomendado)</option>
                <option value={60}>60 minutos (1 hora)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="w-1/3"
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button
                type="button"
                onClick={handleFinalSubmit}
                className="w-2/3 bg-brand-light hover:bg-emerald-600 text-white font-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Concluindo setup...
                  </>
                ) : (
                  "Concluir & Abrir Agenda"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
