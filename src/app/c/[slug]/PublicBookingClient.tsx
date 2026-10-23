"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  History,
  ArrowLeft,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatPhone, formatCPF } from "@/lib/utils";
import {
  getPublicSlotsAction,
  createPublicAppointmentAction,
  getPatientAppointmentsAction,
} from "./actions";

interface Props {
  clinic: any;
  professionals: any[];
  services: any[];
  prices: any[];
}

export default function PublicBookingClient({
  clinic,
  professionals,
  services,
  prices,
}: Props) {
  // Cores dinâmicas da marca da clínica
  const primaryColor = clinic.brand_colors?.primary || "#0F4C5C";
  const secondaryColor = clinic.brand_colors?.secondary || "#52B788";

  // Abas superiores: "Novo Agendamento" ou "Minhas Consultas"
  const [viewMode, setViewMode] = useState<"book" | "my-appointments">("book");

  // Etapas do fluxo de agendamento:
  // 1: Serviço & Especialidade
  // 2: Profissional
  // 3: Data & Horário
  // 4: Dados do Paciente & LGPD
  // 5: Confirmação / Sucesso
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Estados da seleção
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Formulário do paciente
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [lgpdModalOpen, setLgpdModalOpen] = useState(false);

  // Submissão
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  // Área do Paciente ("Minhas Consultas")
  const [searchPhone, setSearchPhone] = useState("");
  const [searchCpf, setSearchCpf] = useState("");
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [patientSearchError, setPatientSearchError] = useState<string | null>(null);

  // Gerar os próximos 14 dias para escolha rápida de data no mobile
  const nextDays = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(new Date(), i);
    return {
      dateStr: format(d, "yyyy-MM-dd"),
      dayName: format(d, "EEE", { locale: ptBR }),
      dayNumber: format(d, "d"),
      monthName: format(d, "MMM", { locale: ptBR }),
    };
  });

  // Carregar slots quando profissional ou data mudarem
  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      loadSlots();
    }
  }, [selectedProfessional, selectedDate]);

  async function loadSlots() {
    setLoadingSlots(true);
    setSelectedTime(null);
    setErrorMessage(null);

    const res = await getPublicSlotsAction({
      clinicId: clinic.id,
      professionalId: selectedProfessional.id,
      date: selectedDate,
      durationMin: selectedService?.duration_min || 50,
    });

    setLoadingSlots(false);
    if (res.error) {
      setErrorMessage(res.error);
      setAvailableSlots([]);
    } else {
      setAvailableSlots(res.data || []);
    }
  }

  // Obter o preço do serviço
  function getServicePrice(serviceId: string) {
    const p = prices.find((item) => item.service_id === serviceId);
    return p ? Number(p.price) : null;
  }

  // Submissão do agendamento
  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTime) {
      setErrorMessage("Por favor, selecione um horário.");
      return;
    }
    if (!lgpdConsent) {
      setErrorMessage("Você precisa aceitar os termos de consentimento LGPD para agendar.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      clinicId: clinic.id,
      professionalId: selectedProfessional.id,
      serviceId: selectedService.id,
      date: selectedDate,
      time: selectedTime,
      durationMin: selectedService.duration_min || 50,
      fullName,
      phone,
      cpf: cpf || null,
      email: email || null,
      notes: notes || null,
      lgpdConsent,
    };

    const res = await createPublicAppointmentAction(payload);
    setSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessData({
        service: selectedService,
        professional: selectedProfessional,
        date: selectedDate,
        time: selectedTime,
      });
      setStep(5);
    }
  }

  // Consulta do Paciente ("Minhas Consultas")
  async function handleSearchPatient(e: React.FormEvent) {
    e.preventDefault();
    setSearchingPatient(true);
    setPatientSearchError(null);
    setPatientData(null);

    const res = await getPatientAppointmentsAction({
      clinicId: clinic.id,
      phone: searchPhone,
      cpf: searchCpf || undefined,
    });

    setSearchingPatient(false);
    if (res.error) {
      setPatientSearchError(res.error);
    } else {
      setPatientData(res.data);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* ======================================================== */}
      {/* CABEÇALHO DA CLÍNICA */}
      {/* ======================================================== */}
      <header
        className="text-white px-4 py-6 shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl border border-white/20 backdrop-blur-sm">
              ☯
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">
                {clinic.name}
              </h1>
              {clinic.address?.city && (
                <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {clinic.address.city} - {clinic.address.state}
                </p>
              )}
            </div>
          </div>

          {/* Botão de Trocar Visão: Agendar / Minhas Consultas */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setViewMode(viewMode === "book" ? "my-appointments" : "book");
              setErrorMessage(null);
            }}
            className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            {viewMode === "book" ? (
              <>
                <History className="h-3.5 w-3.5 mr-1.5" />
                Minhas Consultas
              </>
            ) : (
              <>
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                Novo Agendamento
              </>
            )}
          </Button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* CORPO PRINCIPAL (MOBILE FIRST - LARGURA MÁXIMA 448PX) */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-5">
        {/* Mensagem de Erro Global */}
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODO 1: AGENDAR CONSULTA */}
        {/* ======================================================== */}
        {viewMode === "book" && (
          <div>
            {/* Barra de Progresso das Etapas (quando não for etapa 5 de sucesso) */}
            {step < 5 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                  <span className={step >= 1 ? "text-brand-dark font-bold" : ""}>
                    1. Serviço
                  </span>
                  <span className={step >= 2 ? "text-brand-dark font-bold" : ""}>
                    2. Profissional
                  </span>
                  <span className={step >= 3 ? "text-brand-dark font-bold" : ""}>
                    3. Horário
                  </span>
                  <span className={step >= 4 ? "text-brand-dark font-bold" : ""}>
                    4. Seus Dados
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(step / 4) * 100}%`,
                      backgroundColor: secondaryColor,
                    }}
                  />
                </div>
              </div>
            )}

            {/* ETAPA 1: SELEÇÃO DE SERVIÇO */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    O que você gostaria de agendar?
                  </h2>
                  <p className="text-xs text-slate-500">
                    Escolha a modalidade de atendimento desejada
                  </p>
                </div>

                <div className="space-y-2.5">
                  {services.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border">
                      Nenhum serviço cadastrado no momento.
                    </div>
                  ) : (
                    services.map((srv) => {
                      const price = getServicePrice(srv.id);
                      const isSelected = selectedService?.id === srv.id;

                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedService(srv)}
                          className={`p-4 rounded-xl border bg-white cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-sm font-semibold text-slate-800 block">
                              {srv.name}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {srv.duration_min} min
                              </span>
                              <span>•</span>
                              <span className="capitalize">
                                {srv.specialty === "physio"
                                  ? "Fisioterapia"
                                  : srv.specialty === "acupuncture"
                                  ? "Acupuntura"
                                  : "Fisio & Acupuntura"}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            {price !== null ? (
                              <span className="text-sm font-bold text-slate-900 block">
                                {formatCurrency(price)}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 block">A combinar</span>
                            )}
                            <span className="text-[10px] text-slate-400">por sessão</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <Button
                  disabled={!selectedService}
                  onClick={() => setStep(2)}
                  className="w-full mt-4 h-12 text-sm font-semibold text-white shadow-md flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ETAPA 2: SELEÇÃO DE PROFISSIONAL */}
            {step === 2 && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="h-3 w-3" /> Voltar aos serviços
                </button>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Com qual profissional?
                  </h2>
                  <p className="text-xs text-slate-500">
                    Selecione o especialista de sua preferência
                  </p>
                </div>

                <div className="space-y-2.5">
                  {professionals.map((prof) => {
                    const isSelected = selectedProfessional?.id === prof.id;

                    return (
                      <div
                        key={prof.id}
                        onClick={() => setSelectedProfessional(prof)}
                        className={`p-4 rounded-xl border bg-white cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? "border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ backgroundColor: prof.color || primaryColor }}
                        >
                          {prof.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <span className="text-sm font-semibold text-slate-800 block">
                            {prof.name}
                          </span>
                          <span className="text-xs text-slate-500 block">
                            {prof.council_number || "Fisioterapeuta / Acupunturista"}
                          </span>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button
                  disabled={!selectedProfessional}
                  onClick={() => setStep(3)}
                  className="w-full mt-4 h-12 text-sm font-semibold text-white shadow-md flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  Ver Horários Disponíveis <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ETAPA 3: DATA & HORÁRIO */}
            {step === 3 && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="h-3 w-3" /> Trocar profissional
                </button>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Escolha o dia e o horário
                  </h2>
                  <p className="text-xs text-slate-500">
                    Horários livres atualizados em tempo real
                  </p>
                </div>

                {/* Seletor Horizontal de Dias */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {nextDays.map((d) => {
                    const isSelected = selectedDate === d.dateStr;
                    return (
                      <button
                        key={d.dateStr}
                        onClick={() => setSelectedDate(d.dateStr)}
                        className={`flex flex-col items-center justify-center min-w-[60px] py-2.5 px-2 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? "bg-brand-dark text-white border-brand-dark shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                        style={isSelected ? { backgroundColor: primaryColor } : {}}
                      >
                        <span className="text-[10px] uppercase font-medium">
                          {d.dayName}
                        </span>
                        <span className="text-base font-bold my-0.5">
                          {d.dayNumber}
                        </span>
                        <span className="text-[10px] capitalize text-slate-400">
                          {d.monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Grade de Horários */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="p-3.5 pb-2 border-b bg-slate-50/50">
                    <CardTitle className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>Horários para {selectedDate.split("-").reverse().join("/")}</span>
                      {loadingSlots && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5">
                    {loadingSlots ? (
                      <div className="py-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-light mb-2" />
                        <span className="text-xs text-slate-500">
                          Consultando agenda do profissional...
                        </span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        Não há horários disponíveis para esta data. Por favor, escolha outro dia acima.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          const isFree = slot.available;

                          return (
                            <button
                              key={slot.time}
                              disabled={!isFree}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition-all ${
                                isSelected
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                  : isFree
                                  ? "bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700"
                                  : "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through"
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button
                  disabled={!selectedTime}
                  onClick={() => setStep(4)}
                  className="w-full mt-4 h-12 text-sm font-semibold text-white shadow-md flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  Continuar com {selectedTime} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ETAPA 4: DADOS DO PACIENTE & TERMO LGPD */}
            {step === 4 && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep(3)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="h-3 w-3" /> Trocar horário
                </button>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Seus dados de contato
                  </h2>
                  <p className="text-xs text-slate-500">
                    Para confirmar sua consulta e enviar lembrete no WhatsApp
                  </p>
                </div>

                {/* Resumo do Agendamento */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-emerald-950">
                    <span>{selectedService.name}</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>Profissional: {selectedProfessional.name}</span>
                    <span>{selectedDate.split("-").reverse().join("/")}</span>
                  </div>
                </div>

                <form onSubmit={handleBookAppointment} className="space-y-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="fullName" className="text-xs font-semibold">
                      Nome Completo *
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Maria da Silva"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      WhatsApp / Celular com DDD *
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      maxLength={15}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="cpf" className="text-xs font-semibold">
                        CPF (Opcional)
                      </Label>
                      <Input
                        id="cpf"
                        value={cpf}
                        onChange={(e) => setCpf(formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs font-semibold">
                        E-mail (Opcional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="notes" className="text-xs font-semibold">
                      Alguma queixa ou observação inicial?
                    </Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Dor na lombar ao caminhar..."
                    />
                  </div>

                  {/* Consentimento LGPD Obrigatório */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 mt-4">
                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        id="lgpd"
                        checked={lgpdConsent}
                        onCheckedChange={(val) => setLgpdConsent(!!val)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor="lgpd"
                        className="text-xs text-slate-600 leading-tight cursor-pointer"
                      >
                        Autorizo a coleta e o armazenamento dos meus dados de contato e saúde pela clínica{" "}
                        <strong className="text-slate-800">{clinic.name}</strong>, estritamente para fins de atendimento clínico e contato, em conformidade com a <strong>LGPD (Lei 13.709/2018)</strong>.
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLgpdModalOpen(true)}
                      className="text-[11px] text-brand-dark hover:underline font-medium block pt-1"
                    >
                      Ler Termo de Privacidade Completo
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || !lgpdConsent}
                    className="w-full h-12 text-sm font-semibold text-white shadow-md flex items-center justify-center gap-2 mt-4"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Confirmando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Confirmar Agendamento
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* ETAPA 5: SUCESSO & COMPROVANTE */}
            {step === 5 && successData && (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-5 animate-in fade-in duration-300">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-800">
                    Agendamento Confirmado!
                  </h2>
                  <p className="text-xs text-slate-500">
                    Recebemos sua solicitação na clínica com sucesso.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl text-left space-y-2 text-xs border border-slate-200/60">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Serviço:</span>
                    <span className="font-semibold text-slate-800">
                      {successData.service.name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Profissional:</span>
                    <span className="font-semibold text-slate-800">
                      {successData.professional.name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Data & Horário:</span>
                    <span className="font-semibold text-emerald-700">
                      {successData.date.split("-").reverse().join("/")} às {successData.time}
                    </span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-slate-500">Paciente:</span>
                    <span className="font-semibold text-slate-800">{fullName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setStep(1);
                      setSelectedTime(null);
                    }}
                    variant="outline"
                    className="w-full text-xs font-semibold"
                  >
                    Agendar Outro Horário
                  </Button>

                  <Button
                    onClick={() => {
                      setSearchPhone(phone);
                      setViewMode("my-appointments");
                      setStep(1);
                    }}
                    className="w-full text-xs font-semibold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Ver Minhas Consultas
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODO 2: ÁREA DO PACIENTE ("MINHAS CONSULTAS") */}
        {/* ======================================================== */}
        {viewMode === "my-appointments" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Área do Paciente
              </h2>
              <p className="text-xs text-slate-500">
                Consulte seus agendamentos e o saldo das suas sessões
              </p>
            </div>

            {/* Busca por Celular / CPF */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <form onSubmit={handleSearchPatient} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="searchPhone" className="text-xs font-semibold">
                      Seu Celular / WhatsApp
                    </Label>
                    <Input
                      id="searchPhone"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(formatPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="searchCpf" className="text-xs font-semibold">
                      Ou seu CPF (opcional)
                    </Label>
                    <Input
                      id="searchCpf"
                      value={searchCpf}
                      onChange={(e) => setSearchCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={searchingPatient}
                    className="w-full text-xs font-semibold text-white h-10"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {searchingPatient ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Consultar Meus Dados"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {patientSearchError && (
              <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{patientSearchError}</span>
              </div>
            )}

            {/* Resultados do Paciente */}
            {patientData && (
              <div className="space-y-4 animate-in fade-in">
                {/* Cartão de Identificação */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Paciente
                  </span>
                  <h3 className="text-base font-bold text-slate-800">
                    {patientData.patient.full_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    WhatsApp: {formatPhone(patientData.patient.phone)}
                  </p>
                </div>

                {/* Saldo de Pacotes (se houver) */}
                {patientData.packages.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Seus Pacotes de Sessões
                    </h4>
                    {patientData.packages.map((pkg: any) => {
                      const balance = pkg.sessions_total - pkg.sessions_used;
                      return (
                        <div
                          key={pkg.id}
                          className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold text-emerald-950 block">
                              {pkg.services?.name || "Pacote de Sessões"}
                            </span>
                            <span className="text-[11px] text-emerald-800">
                              Realizadas: {pkg.sessions_used} de {pkg.sessions_total}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-emerald-700 block leading-tight">
                              {balance}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-semibold uppercase">
                              Restantes
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Histórico de Consultas */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Histórico de Consultas
                  </h4>

                  {patientData.appointments.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border">
                      Nenhuma consulta registrada até o momento.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {patientData.appointments.map((appt: any) => {
                        let formattedPeriod = "Horário a confirmar";
                        if (appt.period) {
                          const match = String(appt.period).match(/["']?([^,"'\[\()]+)["']?/);
                          if (match) {
                            try {
                              const d = new Date(match[1]);
                              formattedPeriod = format(d, "dd/MM/yyyy 'às' HH:mm");
                            } catch {}
                          }
                        }

                        return (
                          <div
                            key={appt.id}
                            className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-800 block">
                                {appt.services?.name || "Atendimento Clínico"}
                              </span>
                              <span className="text-slate-500 block">
                                Profissional: {appt.professionals?.name}
                              </span>
                              <span className="text-emerald-700 font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {formattedPeriod}
                              </span>
                            </div>

                            <div className="text-right">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  appt.status === "scheduled"
                                    ? "bg-blue-100 text-blue-800"
                                    : appt.status === "confirmed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : appt.status === "done"
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {appt.status === "scheduled"
                                  ? "Agendado"
                                  : appt.status === "confirmed"
                                  ? "Confirmado"
                                  : appt.status === "done"
                                  ? "Concluído"
                                  : "Cancelado"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL DE PRIVACIDADE LGPD */}
      {/* ======================================================== */}
      {lgpdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Termo de Consentimento (LGPD)
                </h3>
              </div>
              <button
                onClick={() => setLgpdModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Em cumprimento à <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>, este termo formaliza seu consentimento para o tratamento dos dados pessoais e dados pessoais sensíveis (relacionados à saúde) fornecidos à clínica <strong>{clinic.name}</strong>.
              </p>

              <h4 className="font-bold text-slate-800">1. Finalidade do Tratamento</h4>
              <p>
                Os dados coletados (nome completo, telefone celular, CPF, e-mail, queixas clínicas e histórico de saúde) têm como única e exclusiva finalidade:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Gestão e confirmação de horários de atendimento na clínica;</li>
                <li>Envio de lembretes e notificações de consulta via WhatsApp ou e-mail;</li>
                <li>Formação e manutenção do prontuário eletrônico do paciente, conforme determina o Conselho Profissional (COFFITO);</li>
                <li>Emissão de recibos e prestação de contas financeiras.</li>
              </ul>

              <h4 className="font-bold text-slate-800">2. Segurança e Sigilo</h4>
              <p>
                A clínica compromete-se a adotar medidas técnicas e administrativas aptas a proteger seus dados contra acessos não autorizados e situações acidentais ou ilícitas. Seus dados clínicos são de acesso restrito aos profissionais de saúde vinculados ao seu atendimento.
              </p>

              <h4 className="font-bold text-slate-800">3. Direitos do Titular</h4>
              <p>
                Você poderá, a qualquer momento, mediante solicitação expressa à clínica, confirmar a existência de tratamento, acessar seus dados, corrigir dados incompletos ou solicitar a revogação do consentimento, observados os prazos legais de guarda de prontuários estipulados pela legislação de saúde.
              </p>
            </div>

            <div className="p-4 border-t bg-slate-50">
              <Button
                onClick={() => {
                  setLgpdConsent(true);
                  setLgpdModalOpen(false);
                }}
                className="w-full text-xs font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Concordo com os Termos
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RODAPÉ DO APP */}
      {/* ======================================================== */}
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t bg-white">
        <p>
          Agendamento seguro powered by{" "}
          <strong className="text-slate-600">AgendaZen</strong>
        </p>
      </footer>
    </div>
  );
}
