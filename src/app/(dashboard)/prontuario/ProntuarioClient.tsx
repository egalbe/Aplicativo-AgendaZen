"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  User,
  History,
  Activity,
  Zap,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Clock,
  ShieldCheck,
  Search,
  ChevronRight,
  Flame,
  Award,
  Calendar,
  DollarSign,
} from "lucide-react";
import BodyMapInteractive from "@/components/medical-record/BodyMapInteractive";
import AcupunctureSelector from "@/components/medical-record/AcupunctureSelector";
import {
  saveAnamnesisAction,
  saveSoapEntryAction,
  saveTreatmentProtocolAction,
} from "./actions";
import { BodyMarkingInput, SessionPointInput } from "@/lib/validations/medical-record";
import { formatCPF, formatPhone } from "@/lib/utils";

interface Props {
  patients: any[];
  selectedPatient: any;
  medicalRecord: any;
  recordEntries: any[];
  professionals: any[];
  acupuncturePoints: any[];
  protocols: any[];
  userRole: string;
}

export default function ProntuarioClient({
  patients,
  selectedPatient,
  medicalRecord,
  recordEntries,
  professionals,
  acupuncturePoints,
  protocols,
  userRole,
}: Props) {
  const router = useRouter();

  // Estados principais
  const [activeTab, setActiveTab] = useState<"soap" | "history" | "anamnesis">("soap");
  const [patientSearch, setPatientSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados do Formulário SOAP
  const [selectedProfId, setSelectedProfId] = useState<string>(
    professionals[0]?.id || ""
  );
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [painVas, setPainVas] = useState<number>(5);

  // Marcações corporais e pontos de acupuntura da sessão
  const [bodyMarkings, setBodyMarkings] = useState<BodyMarkingInput[]>([]);
  const [acupunctureSessionPoints, setAcupunctureSessionPoints] = useState<
    SessionPointInput[]
  >([]);

  // Estados da Anamnese
  const [anamnesisData, setAnamnesisData] = useState({
    mainComplaint: medicalRecord?.anamnesis?.main_complaint || "",
    history: medicalRecord?.anamnesis?.history || "",
    medications: medicalRecord?.anamnesis?.medications || "",
    allergies: medicalRecord?.anamnesis?.allergies || "",
    surgeries: medicalRecord?.anamnesis?.surgeries || "",
    habits: medicalRecord?.anamnesis?.habits || "",
    lifestyle: medicalRecord?.anamnesis?.lifestyle || "",
  });

  // Filtro de pacientes
  const filteredPatients = patients.filter(
    (p) =>
      p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.cpf && p.cpf.includes(patientSearch)) ||
      (p.phone && p.phone.includes(patientSearch))
  );

  // 1. Salvar Evolução Clínica SOAP
  async function handleSaveSoap(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatient || !medicalRecord) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      recordId: medicalRecord.id,
      patientId: selectedPatient.id,
      professionalId: selectedProfId,
      subjective,
      objective,
      assessment,
      plan,
      painVas,
      bodyMarkings,
      acupuncturePoints: acupunctureSessionPoints,
    };

    const res = await saveSoapEntryAction(payload);
    setSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg("Evolução clínica SOAP assinada e registrada com sucesso!");
      // Limpar campos após assinar evolução
      setSubjective("");
      setObjective("");
      setAssessment("");
      setPlan("");
      setBodyMarkings([]);
      setAcupunctureSessionPoints([]);
      router.refresh();
    }
  }

  // 2. Salvar Anamnese
  async function handleSaveAnamnesis(e: React.FormEvent) {
    e.preventDefault();
    if (!medicalRecord) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await saveAnamnesisAction({
      recordId: medicalRecord.id,
      ...anamnesisData,
    });

    setSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg("Anamnese geral do paciente atualizada com sucesso!");
      router.refresh();
    }
  }

  // 3. Salvar Fórmula Clínica / Protocolo
  async function handleSaveProtocol(name: string, description: string, pointCodes: string[]) {
    setErrorMsg(null);
    const res = await saveTreatmentProtocolAction({
      name,
      description,
      pointCodes,
    });

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg(`Protocolo "${name}" salvo na biblioteca da clínica!`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Topo com Título e Alertas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
            Prontuário Eletrônico Especializado
          </h1>
          <p className="text-sm text-slate-500">
            Registro clínico SOAP, Mapa Corporal de Fisioterapia e Acupuntura Sistêmica
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ======================================================== */}
        {/* COLUNA ESQUERDA: SELEÇÃO RÁPIDA DE PACIENTES */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-3">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-3.5 pb-2 border-b bg-slate-50/50">
              <CardTitle className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Pacientes da Clínica</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                  {patients.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Buscar paciente..."
                  className="pl-8 text-xs h-8 bg-white"
                />
              </div>

              <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
                {filteredPatients.map((p) => {
                  const isSelected = selectedPatient?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => router.push(`/prontuario?paciente=${p.id}`)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "bg-brand-dark text-white border-brand-dark shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-semibold block truncate">
                        {p.full_name}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          isSelected ? "text-white/80" : "text-slate-400"
                        }`}
                      >
                        {formatPhone(p.phone)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ======================================================== */}
        {/* COLUNA DIREITA: PRONTUÁRIO & EVOLUÇÕES DO PACIENTE */}
        {/* ======================================================== */}
        <div className="lg:col-span-9 space-y-4">
          {!selectedPatient ? (
            <Card className="border-slate-200 p-12 text-center text-slate-400">
              Selecione um paciente na lista ao lado para abrir o prontuário.
            </Card>
          ) : (
            <>
              {/* Barra do Paciente Ativo */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-brand-dark text-white font-bold text-lg flex items-center justify-center">
                    {selectedPatient.full_name[0]}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      {selectedPatient.full_name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 mt-0.5">
                      {selectedPatient.cpf && <span>CPF: {formatCPF(selectedPatient.cpf)}</span>}
                      <span>WhatsApp: {formatPhone(selectedPatient.phone)}</span>
                      <span>Segmento: <strong>{selectedPatient.patient_segments?.name || "Particular"}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  >
                    <a href="/financeiro" target="_blank">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                      Cobrança / Baixa
                    </a>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                  >
                    <a href={`/pacientes/${selectedPatient.id}`} target="_blank">
                      Ver Ficha Completa
                    </a>
                  </Button>
                </div>
              </div>

              {/* Abas do Prontuário */}
              <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
                <TabsList className="grid grid-cols-3 h-10 p-1 bg-slate-200/60 rounded-xl">
                  <TabsTrigger value="soap" className="text-xs font-semibold">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Nova Evolução SOAP
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs font-semibold">
                    <History className="h-3.5 w-3.5 mr-1.5" /> Histórico Clínico ({recordEntries.length})
                  </TabsTrigger>
                  <TabsTrigger value="anamnesis" className="text-xs font-semibold">
                    <FileText className="h-3.5 w-3.5 mr-1.5" /> Anamnese Geral
                  </TabsTrigger>
                </TabsList>

                {/* ======================================================== */}
                {/* ABA 1: NOVA EVOLUÇÃO CLÍNICA SOAP */}
                {/* ======================================================== */}
                <TabsContent value="soap" className="space-y-6 pt-2">
                  <form onSubmit={handleSaveSoap} className="space-y-6">
                    {/* Cabeçalho da Evolução: Profissional e Escala EVA */}
                    <Card className="border-slate-200 shadow-sm">
                      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="prof" className="text-xs font-semibold">
                            Profissional Responsável pelo Atendimento:
                          </Label>
                          <select
                            id="prof"
                            value={selectedProfId}
                            onChange={(e) => setSelectedProfId(e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                            required
                          >
                            {professionals.map((pr) => (
                              <option key={pr.id} value={pr.id}>
                                {pr.name} ({pr.council_number || "Fisioterapeuta"})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold">
                              Escala Visual Analógica de Dor (EVA):
                            </Label>
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              {painVas} / 10
                            </span>
                          </div>
                          <Input
                            type="range"
                            min="0"
                            max="10"
                            value={painVas}
                            onChange={(e) => setPainVas(Number(e.target.value))}
                            className="h-8 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>0 (Sem dor)</span>
                            <span>5 (Moderada)</span>
                            <span>10 (Insuportável)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fisioterapia: Mapa Corporal Interativo SVG */}
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-brand-dark" />
                          Fisioterapia: Mapeamento Corporal de Algias e Trigger Points
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Clique na silhueta para apontar os pontos dolorosos, contraturas e bloqueios articulares relatados nesta sessão.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <BodyMapInteractive
                          markings={bodyMarkings}
                          onChange={setBodyMarkings}
                        />
                      </CardContent>
                    </Card>

                    {/* Acupuntura: Prescrição de Pontos e Técnicas */}
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-brand-dark" />
                          Acupuntura: Prescrição e Aplicação de Pontos
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Selecione os pontos aplicados nesta sessão, definindo tempo de retenção, técnica e lateralidade.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <AcupunctureSelector
                          allPoints={acupuncturePoints}
                          protocols={protocols}
                          selectedPoints={acupunctureSessionPoints}
                          onChange={setAcupunctureSessionPoints}
                          onSaveProtocol={handleSaveProtocol}
                        />
                      </CardContent>
                    </Card>

                    {/* Campos Clínicos Estruturados SOAP */}
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-brand-dark" />
                          Registro Clínico SOAP (Metodologia Oficial)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {/* S - Subjetivo */}
                        <div className="space-y-1.5">
                          <Label htmlFor="sub" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                              S
                            </span>
                            Subjetivo (Relato do Paciente):
                          </Label>
                          <textarea
                            id="sub"
                            rows={3}
                            value={subjective}
                            onChange={(e) => setSubjective(e.target.value)}
                            placeholder="Como o paciente refere a dor? Houve melhora desde a última sessão? Queixas principais..."
                            className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-brand-dark/20 focus:outline-none"
                            required
                          />
                        </div>

                        {/* O - Objetivo */}
                        <div className="space-y-1.5">
                          <Label htmlFor="obj" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                              O
                            </span>
                            Objetivo (Exame Físico, Goniometria e Testes Clínicos):
                          </Label>
                          <textarea
                            id="obj"
                            rows={3}
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            placeholder="Palpação, amplitude de movimento (ADM), testes ortopédicos específicos, inspeção postural..."
                            className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-brand-dark/20 focus:outline-none"
                            required
                          />
                        </div>

                        {/* A - Avaliação */}
                        <div className="space-y-1.5">
                          <Label htmlFor="ass" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                              A
                            </span>
                            Avaliação (Diagnóstico Fisioterapêutico / Energético MTC):
                          </Label>
                          <textarea
                            id="ass"
                            rows={2}
                            value={assessment}
                            onChange={(e) => setAssessment(e.target.value)}
                            placeholder="Conclusão diagnóstica, padrão da MTC (ex: Estagnação de Qi e Sangue no canal da Bexiga)..."
                            className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-brand-dark/20 focus:outline-none"
                            required
                          />
                        </div>

                        {/* P - Plano */}
                        <div className="space-y-1.5">
                          <Label htmlFor="pln" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                              P
                            </span>
                            Plano Terapêutico e Conduta:
                          </Label>
                          <textarea
                            id="pln"
                            rows={2}
                            value={plan}
                            onChange={(e) => setPlan(e.target.value)}
                            placeholder="Recursos aplicados (Cinesioterapia, terapia manual, eletroterapia, orientações domiciliares)..."
                            className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-brand-dark/20 focus:outline-none"
                            required
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Botão de Assinar e Gravar */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-brand-dark hover:bg-brand-primary text-white font-semibold text-xs h-11 px-6 shadow-md flex items-center gap-2"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {submitting ? "Assinando e Gravando..." : "Assinar e Gravar Evolução SOAP"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* ======================================================== */}
                {/* ABA 2: HISTÓRICO DE EVOLUÇÕES ANTERIORES */}
                {/* ======================================================== */}
                <TabsContent value="history" className="space-y-4 pt-2">
                  {recordEntries.length === 0 ? (
                    <Card className="border-slate-200 p-12 text-center text-slate-400">
                      Nenhuma evolução clínica registrada até o momento para este paciente.
                    </Card>
                  ) : (
                    recordEntries.map((entry, index) => (
                      <Card key={entry.id} className="border-slate-200 shadow-sm">
                        <CardHeader className="py-3 px-4 bg-slate-50/60 border-b flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-brand-dark" />
                              Sessão de {format(new Date(entry.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              Assinado por: <strong>{entry.signed_by || entry.professionals?.name}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
                              EVA {entry.pain_vas}/10
                            </span>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 space-y-4">
                          {/* Conteúdo SOAP */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-1">
                              <span className="font-bold text-blue-900 block">Subjetivo (S):</span>
                              <p className="text-slate-700 whitespace-pre-line">{entry.soap?.subjective}</p>
                            </div>

                            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1">
                              <span className="font-bold text-emerald-900 block">Objetivo (O):</span>
                              <p className="text-slate-700 whitespace-pre-line">{entry.soap?.objective}</p>
                            </div>

                            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg space-y-1">
                              <span className="font-bold text-amber-900 block">Avaliação (A):</span>
                              <p className="text-slate-700 whitespace-pre-line">{entry.soap?.assessment}</p>
                            </div>

                            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg space-y-1">
                              <span className="font-bold text-purple-900 block">Conduta / Plano (P):</span>
                              <p className="text-slate-700 whitespace-pre-line">{entry.soap?.plan}</p>
                            </div>
                          </div>

                          {/* Pontos de Acupuntura Aplicados */}
                          {entry.acupuncture_session_points && entry.acupuncture_session_points.length > 0 && (
                            <div className="pt-2 border-t">
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                                Acupontos Utilizados:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {entry.acupuncture_session_points.map((pt: any) => (
                                  <span
                                    key={pt.id}
                                    className="px-2 py-1 bg-brand-surface border border-brand-dark/20 text-brand-dark rounded text-xs font-semibold flex items-center gap-1"
                                  >
                                    <span className="font-mono">{pt.point_code}</span>
                                    <span className="text-[10px] text-slate-500 font-normal">
                                      ({pt.side} • {pt.technique} {pt.retention_min}m)
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Marcações Corporais Registradas */}
                          {entry.body_markings && entry.body_markings.length > 0 && (
                            <div className="pt-2 border-t">
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                                Achados no Mapa Corporal:
                              </span>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {entry.body_markings.map((bm: any) => (
                                  <span
                                    key={bm.id}
                                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1"
                                  >
                                    <span className="capitalize font-semibold">{bm.kind}</span>
                                    <span className="text-[10px] text-slate-500">
                                      ({bm.view === "front" ? "Frente" : "Costas"} - {bm.side})
                                    </span>
                                    <span className="font-bold text-red-600">
                                      {bm.intensity}/10
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* ======================================================== */}
                {/* ABA 3: ANAMNESE GERAL DO PACIENTE */}
                {/* ======================================================== */}
                <TabsContent value="anamnesis" className="space-y-4 pt-2">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                      <CardTitle className="text-sm font-semibold text-slate-800">
                        Histórico Médico e Anamnese Geral
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Dados permanentes de saúde, histórico de cirurgias, medicamentos e hábitos de vida.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <form onSubmit={handleSaveAnamnesis} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="mainComplaint" className="text-xs font-semibold">
                            Queixa Principal e Motivo da Consulta:
                          </Label>
                          <textarea
                            id="mainComplaint"
                            rows={2}
                            value={anamnesisData.mainComplaint}
                            onChange={(e) =>
                              setAnamnesisData({ ...anamnesisData, mainComplaint: e.target.value })
                            }
                            className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="history" className="text-xs font-semibold">
                            Histórico da Moléstia Atual (HMA):
                          </Label>
                          <textarea
                            id="history"
                            rows={3}
                            value={anamnesisData.history}
                            onChange={(e) =>
                              setAnamnesisData({ ...anamnesisData, history: e.target.value })
                            }
                            className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="medications" className="text-xs font-semibold">
                              Medicamentos de Uso Contínuo:
                            </Label>
                            <Input
                              id="medications"
                              value={anamnesisData.medications}
                              onChange={(e) =>
                                setAnamnesisData({ ...anamnesisData, medications: e.target.value })
                              }
                              placeholder="Ex: Anti-hipertensivo, analgésicos..."
                              className="text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="allergies" className="text-xs font-semibold">
                              Alergias Conhecidas:
                            </Label>
                            <Input
                              id="allergies"
                              value={anamnesisData.allergies}
                              onChange={(e) =>
                                setAnamnesisData({ ...anamnesisData, allergies: e.target.value })
                              }
                              placeholder="Ex: Alergia a metais, iodo, látex..."
                              className="text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="surgeries" className="text-xs font-semibold">
                              Cirurgias Prévias / Próteses:
                            </Label>
                            <Input
                              id="surgeries"
                              value={anamnesisData.surgeries}
                              onChange={(e) =>
                                setAnamnesisData({ ...anamnesisData, surgeries: e.target.value })
                              }
                              placeholder="Ex: Artroplastia de quadril em 2021..."
                              className="text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="habits" className="text-xs font-semibold">
                              Hábitos e Prática de Exercícios:
                            </Label>
                            <Input
                              id="habits"
                              value={anamnesisData.habits}
                              onChange={(e) =>
                                setAnamnesisData({ ...anamnesisData, habits: e.target.value })
                              }
                              placeholder="Ex: Sedentário, trabalho sentado 8h/dia..."
                              className="text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-brand-dark hover:bg-brand-primary text-white text-xs font-semibold h-10 px-6 shadow-sm"
                          >
                            <Save className="h-4 w-4 mr-1.5" />
                            {submitting ? "Salvando..." : "Atualizar Anamnese"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
