"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  savePatientAction,
  changePatientSegmentAction,
  togglePatientActiveAction,
  uploadPatientAttachmentAction,
  getAttachmentSignedUrlAction,
} from "../actions";
import { formatCPF, formatPhone, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Paperclip,
  Clock,
  ShieldCheck,
  Edit2,
  Upload,
  CheckCircle2,
  History,
  Package,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface Props {
  patient: any;
  segments: any[];
  segmentHistory: any[];
  appointments: any[];
  packages: any[];
  insurances: any[];
  attachments: any[];
  medicalRecord: any;
  recordEntries: any[];
  userRole: string;
}

export default function PacienteDetalhesClient({
  patient,
  segments,
  segmentHistory,
  appointments,
  packages,
  insurances,
  attachments,
  medicalRecord,
  recordEntries,
  userRole,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("timeline");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modais
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [segmentModalOpen, setSegmentModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Alterar segmento
  async function handleChangeSegment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const newSegmentId = formData.get("segmentId") as string;

    const res = await changePatientSegmentAction({
      patientId: patient.id,
      segmentId: newSegmentId,
    });

    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSegmentModalOpen(false);
      setSuccessMsg("Segmento de preço atualizado!");
      router.refresh();
    }
  }

  // Upload de Documento
  async function handleUploadAttachment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.append("patientId", patient.id);

    const res = await uploadPatientAttachmentAction(formData);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setUploadModalOpen(false);
      setSuccessMsg("Documento anexado com sucesso!");
      router.refresh();
    }
  }

  // Abrir link assinado de anexo
  async function handleOpenAttachment(filePath: string) {
    const res = await getAttachmentSignedUrlAction(filePath);
    if (res.url) {
      window.open(res.url, "_blank");
    } else {
      alert("Não foi possível carregar o anexo.");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between">
        <Link
          href="/pacientes"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para lista de pacientes
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSegmentModalOpen(true)}
            className="text-xs"
          >
            <Layers className="h-3.5 w-3.5 mr-1 text-brand-light" />
            Alterar Segmento
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="text-xs"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Editar Dados
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cartão de Identificação do Paciente */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                {patient.full_name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">{patient.full_name}</h1>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      patient.active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {patient.active ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                  {patient.cpf && <span>CPF: {formatCPF(patient.cpf)}</span>}
                  <span>WhatsApp: {formatPhone(patient.phone)}</span>
                  {patient.email && <span>E-mail: {patient.email}</span>}
                  {patient.birth_date && <span>Nasc: {patient.birth_date}</span>}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs bg-brand-surface text-brand-dark font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                    Segmento: {patient.patient_segments?.name || "Particular Padrão"}
                  </span>

                  {patient.lgpd_consent_at ? (
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Consentimento LGPD registrado
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Pendente Termo LGPD
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right flex sm:flex-col justify-between items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
              <Button asChild size="sm" className="bg-brand-dark hover:bg-brand-primary text-white">
                <Link href={`/prontuario?paciente=${patient.id}`}>
                  <FileText className="h-3.5 w-3.5 mr-1" /> Abrir Prontuário SOAP
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas de Detalhamento do Paciente */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-slate-200/60 rounded-xl gap-1">
          <TabsTrigger value="timeline" className="text-xs font-semibold py-2">
            <Clock className="h-3.5 w-3.5 mr-1.5" /> Linha do Tempo
          </TabsTrigger>
          <TabsTrigger value="packages" className="text-xs font-semibold py-2">
            <Package className="h-3.5 w-3.5 mr-1.5" /> Pacientes & Saldo
          </TabsTrigger>
          <TabsTrigger value="insurance" className="text-xs font-semibold py-2">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Convênio & Guias
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-semibold py-2">
            <History className="h-3.5 w-3.5 mr-1.5" /> Histórico Segmento
          </TabsTrigger>
          <TabsTrigger value="attachments" className="text-xs font-semibold py-2">
            <Paperclip className="h-3.5 w-3.5 mr-1.5" /> Exames & Anexos
          </TabsTrigger>
        </TabsList>

        {/* 1. LINHA DO TEMPO: CONSULTAS E ATENDIMENTOS */}
        <TabsContent value="timeline">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-base">Histórico de Atendimentos</CardTitle>
                <CardDescription className="text-xs">
                  Sessões agendadas, realizadas e evoluções clínicas do paciente.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Nenhum atendimento registrado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-3.5 border rounded-xl flex items-center justify-between hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-10 rounded-full"
                          style={{ backgroundColor: appt.professionals?.color || "#0F4C5C" }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">
                              {appt.services?.name || "Consulta"}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {appt.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Terapeuta: {appt.professionals?.name}
                          </p>
                        </div>
                      </div>

                      <Button asChild variant="ghost" size="sm" className="text-xs">
                        <Link href={`/prontuario?consulta=${appt.id}`}>Ver Evolução</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. PACOTES E SALDO DE SESSÕES */}
        <TabsContent value="packages">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Pacotes de Sessões Adquiridos</CardTitle>
              <CardDescription className="text-xs">
                Controle de saldo, sessões total/usadas e validade dos pacotes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {packages.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">O paciente não possui pacotes ativos no momento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {packages.map((pkg) => {
                    const remaining = pkg.sessions_total - pkg.sessions_used;
                    return (
                      <div key={pkg.id} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">{pkg.services?.name || "Pacote"}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Valor Pago: {formatCurrency(pkg.price_paid)} • Validade: {pkg.expires_at || "Indeterminada"}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-bold text-brand-dark">
                            {remaining} <span className="text-xs text-slate-500 font-normal">restantes</span>
                          </span>
                          <p className="text-[11px] text-slate-400">
                            {pkg.sessions_used} de {pkg.sessions_total} realizadas
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. CONVÊNIO E GUIAS */}
        <TabsContent value="insurance">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Convênios e Autorizações</CardTitle>
              <CardDescription className="text-xs">
                Planos vinculados, número da carteirinha e controle de sessões autorizadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insurances.length === 0 ? (
                <div className="py-12 text-center">
                  <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Nenhum convênio cadastrado para este paciente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insurances.map((ins) => (
                    <div key={ins.id} className="p-4 border rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">
                            {ins.insurance_plans?.insurers?.name} - {ins.insurance_plans?.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Carteirinha: <strong>{ins.card_number}</strong> • Validade: {ins.valid_until || "Indeterminada"}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-brand-dark">
                          Repasse: {formatCurrency(ins.insurance_plans?.payout_per_session || 0)}/sessão
                        </span>
                      </div>

                      {/* Guias cadastradas */}
                      <div className="pt-2 border-t">
                        <span className="text-xs font-semibold text-slate-600">Guias / Autorizações:</span>
                        <div className="mt-1 space-y-1">
                          {ins.insurance_authorizations?.length === 0 ? (
                            <p className="text-xs text-slate-400">Nenhuma guia cadastrada.</p>
                          ) : (
                            ins.insurance_authorizations.map((auth: any) => (
                              <div key={auth.id} className="flex justify-between text-xs p-1.5 bg-slate-50 rounded">
                                <span>Guia: #{auth.guide_number}</span>
                                <span>
                                  {auth.sessions_used} de {auth.sessions_authorized} usadas
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. HISTÓRICO DE MUDANÇAS DE SEGMENTO */}
        <TabsContent value="history">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Histórico de Alterações de Segmento</CardTitle>
              <CardDescription className="text-xs">
                Trilha de auditoria das mudanças de precificação do paciente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {segmentHistory.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">Nenhuma alteração registrada.</p>
              ) : (
                <div className="divide-y text-xs">
                  {segmentHistory.map((h) => (
                    <div key={h.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-800">
                          {h.old_seg?.name ? `De "${h.old_seg.name}" para ` : "Definido como "}
                          <strong>"{h.new_seg?.name}"</strong>
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {new Date(h.changed_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. ANEXOS E EXAMES DO PACIENTE */}
        <TabsContent value="attachments">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-base">Exames, Laudos e Documentos</CardTitle>
                <CardDescription className="text-xs">
                  Arquivos armazenados no Supabase Storage com links assinados temporários.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setUploadModalOpen(true)}
                className="bg-brand-dark hover:bg-brand-primary text-white text-xs"
              >
                <Upload className="h-3.5 w-3.5 mr-1" /> Enviar Arquivo
              </Button>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <div className="py-12 text-center">
                  <Paperclip className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Nenhum documento ou exame anexado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 border rounded-xl flex items-center justify-between hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileSpreadsheet className="h-5 w-5 text-brand-light shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">{att.file_name}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(att.uploaded_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAttachment(att.file_path)}
                        className="text-xs text-brand-dark hover:text-brand-primary"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ======================================================== */}
      {/* MODAL: ALTERAR SEGMENTO */}
      {/* ======================================================== */}
      <Dialog open={segmentModalOpen} onOpenChange={setSegmentModalOpen}>
        <DialogContent>
          <form onSubmit={handleChangeSegment}>
            <DialogHeader>
              <DialogTitle>Alterar Segmento do Paciente</DialogTitle>
              <DialogDescription>
                A alteração do segmento mudará os preços cobrados nas próximas consultas e pacotes.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="segmentSelect">Novo Segmento</Label>
                <select
                  id="segmentSelect"
                  name="segmentId"
                  defaultValue={patient.segment_id || ""}
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSegmentModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-brand-dark text-white">
                Salvar Alteração
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: UPLOAD DE ANEXO */}
      {/* ======================================================== */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <form onSubmit={handleUploadAttachment}>
            <DialogHeader>
              <DialogTitle>Anexar Exame ou Documento</DialogTitle>
              <DialogDescription>
                Faça upload de ressonâncias, laudos médicos, fotos ou documentos em PDF/imagens.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="file">Selecione o arquivo</Label>
                <Input id="file" name="file" type="file" required className="cursor-pointer" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-brand-dark text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Enviar Documento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
