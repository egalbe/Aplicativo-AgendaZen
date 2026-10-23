"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  updateClinicDataAction,
  saveProfessionalAction,
  toggleProfessionalStatusAction,
  saveServiceAction,
  saveSegmentAction,
  saveServicePriceAction,
  deleteServicePriceAction,
  saveInsurerAction,
  saveInsurancePlanAction,
} from "./actions";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Users,
  Briefcase,
  Layers,
  DollarSign,
  ShieldCheck,
  Plus,
  Edit2,
  Check,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface Props {
  initialClinic: any;
  initialProfessionals: any[];
  initialServices: any[];
  initialSegments: any[];
  initialPrices: any[];
  initialInsurers: any[];
  initialPlans: any[];
  userRole: string;
}

export default function ConfiguracoesClient({
  initialClinic,
  initialProfessionals,
  initialServices,
  initialSegments,
  initialPrices,
  initialInsurers,
  initialPlans,
  userRole,
}: Props) {
  const [activeTab, setActiveTab] = useState("clinic");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados locais
  const [clinic, setClinic] = useState(initialClinic || {});
  const [professionals, setProfessionals] = useState(initialProfessionals);
  const [services, setServices] = useState(initialServices);
  const [segments, setSegments] = useState(initialSegments);
  const [prices, setPrices] = useState(initialPrices);
  const [insurers, setInsurers] = useState(initialInsurers);
  const [plans, setPlans] = useState(initialPlans);

  // Modais de Edição/Criação
  const [profModalOpen, setProfModalOpen] = useState(false);
  const [currentProf, setCurrentProf] = useState<any>(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);

  const [segmentModalOpen, setSegmentModalOpen] = useState(false);
  const [currentSegment, setCurrentSegment] = useState<any>(null);

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<any>(null);

  const [insurerModalOpen, setInsurerModalOpen] = useState(false);
  const [currentInsurer, setCurrentInsurer] = useState<any>(null);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);

  function clearMessages() {
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  // 1. SALVAR DADOS DA CLÍNICA
  async function handleSaveClinic(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      document: formData.get("document"),
      phone: formData.get("phone"),
      primaryColor: formData.get("primaryColor"),
      secondaryColor: formData.get("secondaryColor"),
      accentColor: formData.get("accentColor"),
      street: formData.get("street"),
      number: formData.get("number"),
      neighborhood: formData.get("neighborhood"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip: formData.get("zip"),
      cancellationLimitHours: formData.get("cancellationLimitHours"),
      maxDaysAhead: formData.get("maxDaysAhead"),
      minNoticeHours: formData.get("minNoticeHours"),
    };

    const res = await updateClinicDataAction(payload);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg("Dados da clínica atualizados com sucesso!");
    }
  }

  // 2. SALVAR PROFISSIONAL
  async function handleSaveProfessional(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      id: currentProf?.id,
      name: formData.get("name"),
      specialty: formData.get("specialty"),
      councilNumber: formData.get("councilNumber"),
      color: formData.get("color"),
      commissionRate: formData.get("commissionRate"),
      active: currentProf?.active ?? true,
    };

    const res = await saveProfessionalAction(payload);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setProfModalOpen(false);
      setSuccessMsg("Profissional salvo com sucesso! Recarregue ou navegue para ver as alterações.");
    }
  }

  // 3. SALVAR SERVIÇO
  async function handleSaveService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      id: currentService?.id,
      name: formData.get("name"),
      specialty: formData.get("specialty"),
      durationMin: formData.get("durationMin"),
      active: currentService?.active ?? true,
    };

    const res = await saveServiceAction(payload);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setServiceModalOpen(false);
      setSuccessMsg("Serviço salvo com sucesso!");
    }
  }

  // 4. SALVAR SEGMENTO
  async function handleSaveSegment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      id: currentSegment?.id,
      name: formData.get("name"),
      description: formData.get("description"),
      isDefault: formData.get("isDefault") === "on",
    };

    const res = await saveSegmentAction(payload);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSegmentModalOpen(false);
      setSuccessMsg("Segmento de paciente salvo com sucesso!");
    }
  }

  // 5. SALVAR PREÇO
  async function handleSavePrice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      id: currentPrice?.id,
      serviceId: formData.get("serviceId"),
      segmentId: formData.get("segmentId"),
      mode: formData.get("mode"),
      price: formData.get("price"),
      sessions: formData.get("sessions") ? Number(formData.get("sessions")) : null,
      validDays: formData.get("validDays") ? Number(formData.get("validDays")) : null,
    };

    const res = await saveServicePriceAction(payload);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setPriceModalOpen(false);
      setSuccessMsg("Tabela de preço atualizada com sucesso!");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
          Configurações da Clínica
        </h1>
        <p className="text-sm text-slate-500">
          Gerencie os dados institucionais, profissionais, serviços, segmentos de pacientes e tabelas de preço
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto p-1 bg-slate-200/60 rounded-xl gap-1">
          <TabsTrigger value="clinic" className="text-xs font-semibold py-2">
            <Building2 className="h-3.5 w-3.5 mr-1.5" /> Clínica
          </TabsTrigger>
          <TabsTrigger value="professionals" className="text-xs font-semibold py-2">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Profissionais
          </TabsTrigger>
          <TabsTrigger value="services" className="text-xs font-semibold py-2">
            <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Serviços
          </TabsTrigger>
          <TabsTrigger value="segments" className="text-xs font-semibold py-2">
            <Layers className="h-3.5 w-3.5 mr-1.5" /> Segmentos
          </TabsTrigger>
          <TabsTrigger value="prices" className="text-xs font-semibold py-2">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Preços & Pacotes
          </TabsTrigger>
          <TabsTrigger value="insurers" className="text-xs font-semibold py-2">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Convênios
          </TabsTrigger>
        </TabsList>

        {/* ======================================================== */}
        {/* ABA 1: DADOS DA CLÍNICA */}
        {/* ======================================================== */}
        <TabsContent value="clinic">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Identidade e Informações da Clínica</CardTitle>
              <CardDescription>
                Atualize o nome institucional, telefone de contato, endereço e regras de cancelamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveClinic} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nome da Clínica / Consultório</Label>
                    <Input id="name" name="name" defaultValue={clinic.name} required />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="document">CNPJ ou CPF do Responsável</Label>
                    <Input id="document" name="document" defaultValue={clinic.document || ""} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Telefone / WhatsApp</Label>
                    <Input id="phone" name="phone" defaultValue={clinic.phone || ""} required />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Slug do Link Público (QR Code)</Label>
                    <Input value={clinic.slug || ""} disabled className="bg-slate-100 font-mono text-xs" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Endereço da Clínica</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="street">Rua / Logradouro</Label>
                      <Input id="street" name="street" defaultValue={clinic.address?.street || ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="number">Número / Sala</Label>
                      <Input id="number" name="number" defaultValue={clinic.address?.number || ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input id="neighborhood" name="neighborhood" defaultValue={clinic.address?.neighborhood || ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">Cidade</Label>
                      <Input id="city" name="city" defaultValue={clinic.address?.city || ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state">Estado (UF)</Label>
                      <Input id="state" name="state" defaultValue={clinic.address?.state || ""} maxLength={2} />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Regras de Agendamento Online</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="minNoticeHours">Antecedência Mínima (horas)</Label>
                      <Input
                        id="minNoticeHours"
                        name="minNoticeHours"
                        type="number"
                        defaultValue={clinic.settings?.min_notice_hours ?? 2}
                      />
                      <p className="text-[11px] text-slate-400">Tempo mínimo antes do horário para marcar</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cancellationLimitHours">Limite para Cancelar (horas)</Label>
                      <Input
                        id="cancellationLimitHours"
                        name="cancellationLimitHours"
                        type="number"
                        defaultValue={clinic.settings?.cancellation_limit_hours ?? 4}
                      />
                      <p className="text-[11px] text-slate-400">Cancelamento sem cobrança de falta</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="maxDaysAhead">Máximo de Dias à Frente</Label>
                      <Input
                        id="maxDaysAhead"
                        name="maxDaysAhead"
                        type="number"
                        defaultValue={clinic.settings?.max_days_ahead ?? 60}
                      />
                      <p className="text-[11px] text-slate-400">Até quando a agenda futura fica aberta</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Cores da Identidade Visual</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="primaryColor">Cor Primária</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          id="primaryColor"
                          name="primaryColor"
                          defaultValue={clinic.brand_colors?.primary || "#0F4C5C"}
                          className="h-8 w-12 rounded cursor-pointer border"
                        />
                        <span className="text-xs font-mono">{clinic.brand_colors?.primary || "#0F4C5C"}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="secondaryColor">Cor Secundária</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          id="secondaryColor"
                          name="secondaryColor"
                          defaultValue={clinic.brand_colors?.secondary || "#52B788"}
                          className="h-8 w-12 rounded cursor-pointer border"
                        />
                        <span className="text-xs font-mono">{clinic.brand_colors?.secondary || "#52B788"}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="accentColor">Cor de Destaque</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          id="accentColor"
                          name="accentColor"
                          defaultValue={clinic.brand_colors?.accent || "#E0A96D"}
                          className="h-8 w-12 rounded cursor-pointer border"
                        />
                        <span className="text-xs font-mono">{clinic.brand_colors?.accent || "#E0A96D"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading} className="bg-brand-dark hover:bg-brand-primary text-white">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* ABA 2: PROFISSIONAIS */}
        {/* ======================================================== */}
        <TabsContent value="professionals">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Corpo Clínico & Terapeutas</CardTitle>
                <CardDescription>
                  Fisioterapeutas e acupunturistas credenciados com CREFITO, cor na agenda e repasse.
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setCurrentProf(null);
                  setProfModalOpen(true);
                }}
                className="bg-brand-dark hover:bg-brand-primary text-white text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Novo Profissional
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y border rounded-lg overflow-hidden">
                {professionals.length === 0 ? (
                  <p className="p-6 text-sm text-center text-slate-500">Nenhum profissional cadastrado.</p>
                ) : (
                  professionals.map((prof) => (
                    <div key={prof.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: prof.color }}
                        >
                          {prof.name[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{prof.name}</h4>
                          <p className="text-xs text-slate-500">
                            {prof.specialty === "physio"
                              ? "Fisioterapia"
                              : prof.specialty === "acupuncture"
                              ? "Acupuntura"
                              : "Fisioterapia & Acupuntura"}{" "}
                            • {prof.council_number || "Sem CREFITO"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-slate-600">
                          Repasse: {prof.commission_rate}%
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            prof.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {prof.active ? "Ativo" : "Inativo"}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentProf(prof);
                            setProfModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* ABA 3: SERVIÇOS */}
        {/* ======================================================== */}
        <TabsContent value="services">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Serviços e Procedimentos</CardTitle>
                <CardDescription>
                  Tipos de atendimentos clínicos realizados na clínica com duração padrão de slot.
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setCurrentService(null);
                  setServiceModalOpen(true);
                }}
                className="bg-brand-dark hover:bg-brand-primary text-white text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Novo Serviço
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((svc) => (
                  <div key={svc.id} className="p-4 border rounded-xl bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-brand-surface text-brand-dark">
                          {svc.specialty === "physio"
                            ? "Fisioterapia"
                            : svc.specialty === "acupuncture"
                            ? "Acupuntura"
                            : "Integrado"}
                        </span>
                        <span className={`h-2 w-2 rounded-full ${svc.active ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">{svc.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> Duração: {svc.duration_min} min
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentService(svc);
                          setServiceModalOpen(true);
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* ABA 4: SEGMENTOS DE PACIENTES */}
        {/* ======================================================== */}
        <TabsContent value="segments">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Segmentos de Pacientes</CardTitle>
                <CardDescription>
                  Crie categorias (ex: Particular, VIP, Convênio, Social) para aplicar tabelas de preço automáticas.
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setCurrentSegment(null);
                  setSegmentModalOpen(true);
                }}
                className="bg-brand-dark hover:bg-brand-primary text-white text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Novo Segmento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y border rounded-lg overflow-hidden">
                {segments.map((seg) => (
                  <div key={seg.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">{seg.name}</h4>
                        {seg.is_default && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-light/20 text-brand-dark px-2 py-0.5 rounded-full">
                            Padrão Novos Pacientes
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {seg.description || "Sem descrição informada"}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentSegment(seg);
                        setSegmentModalOpen(true);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* ABA 5: TABELA DE PREÇOS E PACOTES */}
        {/* ======================================================== */}
        <TabsContent value="prices">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tabela de Preços por Segmento</CardTitle>
                <CardDescription>
                  Defina valores para Consulta Avulsa, Pacotes de Sessões e Planos de Recorrência.
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setCurrentPrice(null);
                  setPriceModalOpen(true);
                }}
                className="bg-brand-dark hover:bg-brand-primary text-white text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Cadastrar Preço
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                    <tr>
                      <th className="p-3">Serviço</th>
                      <th className="p-3">Segmento</th>
                      <th className="p-3">Modalidade</th>
                      <th className="p-3">Sessões</th>
                      <th className="p-3">Validade</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {prices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-500">
                          Nenhum preço cadastrado ainda.
                        </td>
                      </tr>
                    ) : (
                      prices.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-800">{p.services?.name}</td>
                          <td className="p-3">{p.patient_segments?.name}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.mode === "single"
                                  ? "bg-blue-50 text-blue-700"
                                  : p.mode === "package"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-purple-50 text-purple-700"
                              }`}
                            >
                              {p.mode === "single"
                                ? "Avulso"
                                : p.mode === "package"
                                ? "Pacote"
                                : "Fidelidade"}
                            </span>
                          </td>
                          <td className="p-3">{p.mode === "package" ? `${p.sessions} sessões` : "1 sessão"}</td>
                          <td className="p-3">{p.valid_days ? `${p.valid_days} dias` : "—"}</td>
                          <td className="p-3 font-bold text-brand-dark">{formatCurrency(p.price)}</td>
                          <td className="p-3 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentPrice(p);
                                setPriceModalOpen(true);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={async () => {
                                if (confirm("Deseja realmente remover esta regra de preço?")) {
                                  await deleteServicePriceAction(p.id);
                                }
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* ABA 6: CONVÊNIOS E OPERADORAS */}
        {/* ======================================================== */}
        <TabsContent value="insurers">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Operadoras de Convênio & Planos</CardTitle>
                <CardDescription>
                  Cadastro de convênios de saúde aceitos, registro ANS e valor de repasse por sessão.
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setCurrentInsurer(null);
                  setInsurerModalOpen(true);
                }}
                className="bg-brand-dark hover:bg-brand-primary text-white text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Nova Operadora
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insurers.length === 0 ? (
                  <p className="p-6 text-sm text-center text-slate-500 col-span-2">
                    Nenhum convênio cadastrado. Atenda apenas particular ou cadastre suas operadoras aqui.
                  </p>
                ) : (
                  insurers.map((ins) => (
                    <div key={ins.id} className="p-4 border rounded-xl bg-white space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">{ins.name}</h4>
                          <p className="text-xs text-slate-500">
                            ANS: {ins.ans_registry || "Não informado"} • {ins.contact || "Sem contato"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentInsurer(ins);
                            setInsurerModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="pt-2 border-t">
                        <span className="text-xs font-semibold text-slate-600">Planos vinculados:</span>
                        <div className="mt-1 space-y-1">
                          {plans
                            .filter((pl) => pl.insurer_id === ins.id)
                            .map((pl) => (
                              <div key={pl.id} className="flex justify-between text-xs p-1.5 bg-slate-50 rounded">
                                <span>{pl.name}</span>
                                <span className="font-semibold text-brand-dark">
                                  Repasse: {formatCurrency(pl.payout_per_session)}
                                </span>
                              </div>
                            ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 text-xs"
                          onClick={() => {
                            setCurrentPlan({ insurerId: ins.id });
                            setPlanModalOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Adicionar Plano à {ins.name}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ======================================================== */}
      {/* MODAL: PROFISSIONAL */}
      {/* ======================================================== */}
      <Dialog open={profModalOpen} onOpenChange={setProfModalOpen}>
        <DialogContent>
          <form onSubmit={handleSaveProfessional}>
            <DialogHeader>
              <DialogTitle>{currentProf ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
              <DialogDescription>
                Informe os dados do terapeuta/profissional da clínica.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="profName">Nome Completo</Label>
                <Input id="profName" name="name" defaultValue={currentProf?.name || ""} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="profSpecialty">Especialidade</Label>
                  <select
                    id="profSpecialty"
                    name="specialty"
                    defaultValue={currentProf?.specialty || "physio"}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="physio">Fisioterapia</option>
                    <option value="acupuncture">Acupuntura</option>
                    <option value="both">Ambas</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profCouncil">CREFITO</Label>
                  <Input id="profCouncil" name="councilNumber" defaultValue={currentProf?.council_number || ""} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="profColor">Cor na Agenda</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="profColor"
                      name="color"
                      defaultValue={currentProf?.color || "#0F4C5C"}
                      className="h-9 w-14 rounded cursor-pointer border"
                    />
                    <span className="text-xs font-mono">{currentProf?.color || "#0F4C5C"}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profCommission">Comissão / Repasse (%)</Label>
                  <Input
                    type="number"
                    id="profCommission"
                    name="commissionRate"
                    defaultValue={currentProf?.commission_rate ?? 50}
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProfModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-brand-dark text-white">
                Salvar Profissional
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: SERVIÇO */}
      {/* ======================================================== */}
      <Dialog open={serviceModalOpen} onOpenChange={setServiceModalOpen}>
        <DialogContent>
          <form onSubmit={handleSaveService}>
            <DialogHeader>
              <DialogTitle>{currentService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
              <DialogDescription>
                Configure o procedimento clínico e a duração padrão da sessão.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="svcName">Nome do Serviço</Label>
                <Input id="svcName" name="name" defaultValue={currentService?.name || ""} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="svcSpecialty">Especialidade</Label>
                  <select
                    id="svcSpecialty"
                    name="specialty"
                    defaultValue={currentService?.specialty || "both"}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="physio">Fisioterapia</option>
                    <option value="acupuncture">Acupuntura</option>
                    <option value="both">Ambas / Integrado</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="svcDuration">Duração (minutos)</Label>
                  <Input
                    type="number"
                    id="svcDuration"
                    name="durationMin"
                    defaultValue={currentService?.duration_min || 50}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setServiceModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-brand-dark text-white">
                Salvar Serviço
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: SEGMENTO */}
      {/* ======================================================== */}
      <Dialog open={segmentModalOpen} onOpenChange={setSegmentModalOpen}>
        <DialogContent>
          <form onSubmit={handleSaveSegment}>
            <DialogHeader>
              <DialogTitle>{currentSegment ? "Editar Segmento" : "Novo Segmento de Paciente"}</DialogTitle>
              <DialogDescription>
                Categorize os pacientes para aplicar tabelas de preços específicas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="segName">Nome do Segmento</Label>
                <Input id="segName" name="name" defaultValue={currentSegment?.name || ""} placeholder="Ex: Particular VIP" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="segDesc">Descrição</Label>
                <Input id="segDesc" name="description" defaultValue={currentSegment?.description || ""} placeholder="Condição especial para..." />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  defaultChecked={currentSegment?.is_default}
                  className="rounded text-brand-dark"
                />
                <Label htmlFor="isDefault" className="text-xs cursor-pointer">
                  Definir como segmento padrão para novos pacientes cadastrados
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSegmentModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-brand-dark text-white">
                Salvar Segmento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: PREÇO & PACOTE */}
      {/* ======================================================== */}
      <Dialog open={priceModalOpen} onOpenChange={setPriceModalOpen}>
        <DialogContent>
          <form onSubmit={handleSavePrice}>
            <DialogHeader>
              <DialogTitle>{currentPrice ? "Editar Preço" : "Cadastrar Preço / Pacote"}</DialogTitle>
              <DialogDescription>
                Associe um serviço a um segmento e determine a modalidade de cobrança.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="priceService">Serviço</Label>
                  <select
                    id="priceService"
                    name="serviceId"
                    defaultValue={currentPrice?.service_id || services[0]?.id}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priceSegment">Segmento</Label>
                  <select
                    id="priceSegment"
                    name="segmentId"
                    defaultValue={currentPrice?.segment_id || segments[0]?.id}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  >
                    {segments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priceMode">Modalidade de Cobrança</Label>
                <select
                  id="priceMode"
                  name="mode"
                  defaultValue={currentPrice?.mode || "single"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="single">Consulta Avulsa (1 sessão)</option>
                  <option value="package">Pacote de Sessões (Ex: 10 sessões)</option>
                  <option value="loyalty">Plano Fidelidade / Recorrência</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="priceVal">Valor Total (R$)</Label>
                  <Input type="number" id="priceVal" name="price" defaultValue={currentPrice?.price || 150} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priceSessions">Qtd. Sessões</Label>
                  <Input
                    type="number"
                    id="priceSessions"
                    name="sessions"
                    defaultValue={currentPrice?.sessions || 10}
                    placeholder="Para pacotes"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priceDays">Validade (dias)</Label>
                  <Input
                    type="number"
                    id="priceDays"
                    name="validDays"
                    defaultValue={currentPrice?.valid_days || 90}
                    placeholder="Ex: 90 dias"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPriceModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-brand-dark text-white">
                Salvar Preço
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: OPERADORA DE CONVÊNIO */}
      {/* ======================================================== */}
      <Dialog open={insurerModalOpen} onOpenChange={setInsurerModalOpen}>
        <DialogContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const fd = new FormData(e.currentTarget);
              const payload = {
                id: currentInsurer?.id,
                name: fd.get("name"),
                ansRegistry: fd.get("ansRegistry"),
                contact: fd.get("contact"),
              };
              await saveInsurerAction(payload);
              setLoading(false);
              setInsurerModalOpen(false);
            }}
          >
            <DialogHeader>
              <DialogTitle>{currentInsurer ? "Editar Operadora" : "Nova Operadora de Saúde"}</DialogTitle>
              <DialogDescription>Cadastre a operadora do plano de saúde aceito.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="insName">Nome da Operadora</Label>
                <Input id="insName" name="name" defaultValue={currentInsurer?.name || ""} placeholder="Ex: Unimed, Bradesco Saúde, SulAmérica" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="insAns">Registro ANS</Label>
                  <Input id="insAns" name="ansRegistry" defaultValue={currentInsurer?.ans_registry || ""} placeholder="Ex: 123456" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="insContact">Contato / Central</Label>
                  <Input id="insContact" name="contact" defaultValue={currentInsurer?.contact || ""} placeholder="0800..." />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInsurerModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-brand-dark text-white">
                Salvar Operadora
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: PLANO DO CONVÊNIO */}
      {/* ======================================================== */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const fd = new FormData(e.currentTarget);
              const payload = {
                id: currentPlan?.id,
                insurerId: currentPlan?.insurerId,
                name: fd.get("name"),
                payoutPerSession: Number(fd.get("payoutPerSession")),
                requiresAuthorization: fd.get("requiresAuth") === "on",
                sessionLimit: fd.get("sessionLimit") ? Number(fd.get("sessionLimit")) : null,
              };
              await saveInsurancePlanAction(payload);
              setLoading(false);
              setPlanModalOpen(false);
            }}
          >
            <DialogHeader>
              <DialogTitle>Adicionar Plano ao Convênio</DialogTitle>
              <DialogDescription>Defina o nome da categoria e o repasse financeiro por sessão.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="planName">Nome do Plano</Label>
                <Input id="planName" name="name" placeholder="Ex: Nacional Especial, Básico, Top" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="planPayout">Repasse por Sessão (R$)</Label>
                  <Input type="number" id="planPayout" name="payoutPerSession" defaultValue={85} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="planLimit">Limite de Sessões</Label>
                  <Input type="number" id="planLimit" name="sessionLimit" placeholder="Ex: 20" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="requiresAuth" name="requiresAuth" defaultChecked className="rounded text-brand-dark" />
                <Label htmlFor="requiresAuth" className="text-xs cursor-pointer">
                  Exige Guia / Autorização prévia
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPlanModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-brand-dark text-white">
                Salvar Plano
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
