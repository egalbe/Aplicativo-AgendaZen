"use client";

import { useState } from "react";
import { completeOnboardingAction, type OnboardingState, type DayScheduleItem } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Building2, User, Clock, ArrowRight, ArrowLeft, Loader2, Check, Sun, Moon } from "lucide-react";

const WEEKDAYS = [
  { id: 1, label: "Segunda", short: "Seg" },
  { id: 2, label: "Terça", short: "Ter" },
  { id: 3, label: "Quarta", short: "Qua" },
  { id: 4, label: "Quinta", short: "Qui" },
  { id: 5, label: "Sexta", short: "Sex" },
  { id: 6, label: "Sábado", short: "Sáb" },
  { id: 0, label: "Domingo", short: "Dom" },
];

const INITIAL_DAYS: DayScheduleItem[] = [
  { weekday: 1, morningActive: true, morningStart: "08:00", morningEnd: "12:00", afternoonActive: true, afternoonStart: "13:00", afternoonEnd: "18:00" },
  { weekday: 2, morningActive: true, morningStart: "08:00", morningEnd: "12:00", afternoonActive: true, afternoonStart: "13:00", afternoonEnd: "18:00" },
  { weekday: 3, morningActive: true, morningStart: "08:00", morningEnd: "12:00", afternoonActive: true, afternoonStart: "13:00", afternoonEnd: "18:00" },
  { weekday: 4, morningActive: true, morningStart: "08:00", morningEnd: "12:00", afternoonActive: true, afternoonStart: "13:00", afternoonEnd: "18:00" },
  { weekday: 5, morningActive: true, morningStart: "08:00", morningEnd: "12:00", afternoonActive: true, afternoonStart: "13:00", afternoonEnd: "18:00" },
  { weekday: 6, morningActive: false, morningStart: "08:00", morningEnd: "12:00", afternoonActive: false, afternoonStart: "13:00", afternoonEnd: "18:00" },
  { weekday: 0, morningActive: false, morningStart: "08:00", morningEnd: "12:00", afternoonActive: false, afternoonStart: "13:00", afternoonEnd: "18:00" },
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
      days: INITIAL_DAYS,
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

  function updateDaySchedule(weekday: number, field: keyof DayScheduleItem, value: any) {
    setFormData((prev) => ({
      ...prev,
      step3: {
        ...prev.step3,
        days: prev.step3.days.map((item) =>
          item.weekday === weekday ? { ...item, [field]: value } : item
        ),
      },
    }));
  }

  async function handleFinalSubmit() {
    setError(null);
    setLoading(true);

    const hasAnyActive = formData.step3.days.some(
      (d) => d.morningActive || d.afternoonActive
    );

    if (!hasAnyActive) {
      setError("Ative pelo menos um turno (manhã ou tarde) em algum dia da semana.");
      setLoading(false);
      return;
    }

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
              <Clock className="h-5 w-5 text-brand-light" /> Grade de Horários por Turno (Manhã & Tarde)
            </>
          )}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Defina a identidade da sua clínica e o link público de agendamento."}
          {step === 2 && "Cadastre seu registro profissional (CREFITO) e seu serviço principal."}
          {step === 3 && "Configure individualmente os turnos da manhã e da tarde para cada dia da semana."}
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

        {/* PASSO 3: HORÁRIOS POR TURNO (MANHÃ E TARDE) */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg bg-emerald-50/80 p-3 text-xs text-emerald-900 border border-emerald-200">
              <p>
                <strong>Dica:</strong> Ative ou desative <strong>Manhã</strong> e <strong>Tarde</strong> de forma independente para cada dia (ex: atenda só de manhã na terça e só de tarde na quinta).
              </p>
            </div>

            {/* Lista dos 7 dias com Manhã e Tarde */}
            <div className="space-y-2.5">
              {WEEKDAYS.map((w) => {
                const dayConfig = formData.step3.days.find((d) => d.weekday === w.id);
                if (!dayConfig) return null;

                const hasAnyTurn = dayConfig.morningActive || dayConfig.afternoonActive;

                return (
                  <div
                    key={w.id}
                    className={`rounded-xl border p-3 transition-all ${
                      hasAnyTurn
                        ? "bg-white border-slate-300 shadow-sm"
                        : "bg-slate-50/70 border-slate-200 opacity-60"
                    }`}
                  >
                    {/* Cabeçalho do dia */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          hasAnyTurn ? "bg-brand-dark text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {w.short}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {w.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            const newActive = !hasAnyTurn;
                            updateDaySchedule(w.id, "morningActive", newActive);
                            updateDaySchedule(w.id, "afternoonActive", newActive);
                          }}
                          className="text-xs font-medium text-slate-500 hover:text-brand-dark underline"
                        >
                          {hasAnyTurn ? "Desativar dia" : "Ativar dia completo"}
                        </button>
                      </div>
                    </div>

                    {/* Turnos: Manhã e Tarde */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                      {/* TURNO MANHÃ */}
                      <div
                        className={`rounded-lg border p-2.5 transition-all ${
                          dayConfig.morningActive
                            ? "bg-amber-50/50 border-amber-200"
                            : "bg-slate-50/40 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                            <input
                              type="checkbox"
                              checked={dayConfig.morningActive}
                              onChange={(e) =>
                                updateDaySchedule(w.id, "morningActive", e.target.checked)
                              }
                              className="h-4 w-4 rounded border-slate-300 text-brand-dark focus:ring-brand-light"
                            />
                            <Sun className="h-3.5 w-3.5 text-amber-500" />
                            Turno Manhã
                          </label>

                          {dayConfig.morningActive && (
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                              Ativo
                            </span>
                          )}
                        </div>

                        {dayConfig.morningActive ? (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Início</span>
                              <input
                                type="time"
                                value={dayConfig.morningStart}
                                onChange={(e) =>
                                  updateDaySchedule(w.id, "morningStart", e.target.value)
                                }
                                className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Término</span>
                              <input
                                type="time"
                                value={dayConfig.morningEnd}
                                onChange={(e) =>
                                  updateDaySchedule(w.id, "morningEnd", e.target.value)
                                }
                                className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic block py-1">
                            Não atende pela manhã
                          </span>
                        )}
                      </div>

                      {/* TURNO TARDE */}
                      <div
                        className={`rounded-lg border p-2.5 transition-all ${
                          dayConfig.afternoonActive
                            ? "bg-indigo-50/50 border-indigo-200"
                            : "bg-slate-50/40 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                            <input
                              type="checkbox"
                              checked={dayConfig.afternoonActive}
                              onChange={(e) =>
                                updateDaySchedule(w.id, "afternoonActive", e.target.checked)
                              }
                              className="h-4 w-4 rounded border-slate-300 text-brand-dark focus:ring-brand-light"
                            />
                            <Moon className="h-3.5 w-3.5 text-indigo-500" />
                            Turno Tarde
                          </label>

                          {dayConfig.afternoonActive && (
                            <span className="text-[10px] font-semibold text-indigo-800 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                              Ativo
                            </span>
                          )}
                        </div>

                        {dayConfig.afternoonActive ? (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Início</span>
                              <input
                                type="time"
                                value={dayConfig.afternoonStart}
                                onChange={(e) =>
                                  updateDaySchedule(w.id, "afternoonStart", e.target.value)
                                }
                                className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Término</span>
                              <input
                                type="time"
                                value={dayConfig.afternoonEnd}
                                onChange={(e) =>
                                  updateDaySchedule(w.id, "afternoonEnd", e.target.value)
                                }
                                className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic block py-1">
                            Não atende pela tarde
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Duração Padrão do Slot */}
            <div className="space-y-1.5 pt-2 border-t">
              <Label htmlFor="slotMinutes">Duração Padrão de Cada Atendimento</Label>
              <select
                id="slotMinutes"
                value={formData.step3.slotMinutes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    step3: { ...prev.step3, slotMinutes: +e.target.value },
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
              >
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={50}>50 minutos (Recomendado Fisioterapia & Acupuntura)</option>
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
