"use client";

import { useState } from "react";
import { format, parse, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  QrCode,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  X,
  Loader2,
  Phone,
  FileText,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { createManualAppointmentAction, updateAppointmentStatusAction } from "./actions";
import { formatPhone } from "@/lib/utils";

interface Props {
  clinicId: string;
  professionals: any[];
  services: any[];
  patients: any[];
  initialAppointments: any[];
  scheduleRules: any[];
}

export default function AgendaClient({
  clinicId,
  professionals,
  services,
  patients,
  initialAppointments,
  scheduleRules,
}: Props) {
  // Data selecionada na agenda
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filtro por profissional
  const [selectedProfId, setSelectedProfId] = useState<string>("all");

  // Modal de Novo Agendamento
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal de Detalhes da Consulta
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Lista de agendamentos
  const [appointments, setAppointments] = useState(initialAppointments);

  // Filtrar consultas da data selecionada
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const dayAppointments = appointments.filter((appt) => {
    if (!appt.period) return false;
    // Extrair data do PostgreSQL range
    const match = String(appt.period).match(/["']?([^,"'\[\()]+)["']?/);
    if (!match) return false;

    try {
      const apptDate = new Date(match[1]);
      const matchesDate = isSameDay(apptDate, selectedDate);
      const matchesProf =
        selectedProfId === "all" || appt.professional_id === selectedProfId;
      return matchesDate && matchesProf;
    } catch {
      return false;
    }
  });

  // Estatísticas do dia
  const totalDay = dayAppointments.length;
  const confirmedDay = dayAppointments.filter(
    (a) => a.status === "confirmed" || a.status === "checked_in"
  ).length;
  const scheduledDay = dayAppointments.filter((a) => a.status === "scheduled").length;

  // Ações de Atualização de Status
  async function handleUpdateStatus(newStatus: any) {
    if (!selectedAppt) return;
    setUpdatingStatus(true);

    const res = await updateAppointmentStatusAction({
      appointmentId: selectedAppt.id,
      newStatus,
    });

    setUpdatingStatus(false);
    if (!res.error) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === selectedAppt.id ? { ...item, status: newStatus } : item
        )
      );
      setSelectedAppt((prev: any) => ({ ...prev, status: newStatus }));
      setSuccessMsg("Status atualizado com sucesso!");
    }
  }

  // Submissão do agendamento manual
  async function handleCreateManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      patientId: formData.get("patientId") as string,
      professionalId: formData.get("professionalId") as string,
      serviceId: formData.get("serviceId") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      notes: formData.get("notes") as string,
      isWalkIn: formData.get("isWalkIn") === "on",
    };

    const res = await createManualAppointmentAction(payload);
    setSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setNewModalOpen(false);
      setSuccessMsg("Agendamento criado com sucesso!");
      // Atualizar lista local
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      {/* Topo com Título e Ação Rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
            Agenda de Atendimentos
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie consultas, confirme horários e encaixe pacientes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5">
            <Link href="/divulgacao">
              <QrCode className="h-4 w-4 text-brand-light" /> Link & QR Code
            </Link>
          </Button>

          <Button
            onClick={() => {
              setErrorMsg(null);
              setNewModalOpen(true);
            }}
            className="bg-brand-dark hover:bg-brand-primary text-white font-medium flex items-center gap-2 shadow-sm text-xs h-9"
          >
            <Plus className="h-4 w-4" /> Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grade de Estatísticas Rápidas do Dia */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500">
              Total Agendado Hoje
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-brand-dark">
              {totalDay}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand-light" />
              {scheduledDay} aguardando confirmação
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500">
              Confirmados / Na Clínica
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-brand-light">
              {confirmedDay}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-slate-500">
              Prontos para atendimento
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500">
              Auto-agendamento QR Code
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-brand-dark">
              Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/divulgacao"
              className="text-xs text-brand-dark hover:text-brand-primary font-medium flex items-center gap-1"
            >
              Imprimir placa de mesa <QrCode className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Navegação de Datas e Filtro por Profissional */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Navegação de Dia */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="text-xs font-semibold"
            >
              Hoje
            </Button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border rounded-lg text-sm font-semibold text-slate-800">
              <CalendarIcon className="h-4 w-4 text-brand-dark" />
              <span>
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Filtro por Profissional */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedProfId}
              onChange={(e) => setSelectedProfId(e.target.value)}
              className="w-full sm:w-56 h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
            >
              <option value="all">Todos os Profissionais</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Consultas do Dia */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50 py-3.5">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center justify-between">
            <span>Consultas Marcadas ({dayAppointments.length})</span>
            <span className="text-xs text-slate-500 font-normal">
              Clique em uma consulta para mudar status ou abrir prontuário
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          {dayAppointments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                Nenhum atendimento marcado para este dia
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Os horários livres continuam abertos para seus pacientes agendarem pelo link público ou QR Code.
              </p>
              <Button
                size="sm"
                onClick={() => setNewModalOpen(true)}
                className="bg-brand-dark text-white text-xs font-semibold"
              >
                Agendar Paciente Manualmente
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayAppointments.map((appt) => {
                let timeStr = "--:--";
                if (appt.period) {
                  const match = String(appt.period).match(/["']?([^,"'\[\()]+)["']?/);
                  if (match) {
                    try {
                      timeStr = format(new Date(match[1]), "HH:mm");
                    } catch {}
                  }
                }

                return (
                  <div
                    key={appt.id}
                    onClick={() => {
                      setSelectedAppt(appt);
                      setApptModalOpen(true);
                    }}
                    className="p-4 bg-white border border-slate-200 hover:border-brand-dark/40 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-sm hover:shadow"
                  >
                    <div className="flex items-center gap-4">
                      {/* Horário */}
                      <div className="flex flex-col items-center justify-center w-14 h-12 bg-slate-50 border border-slate-200 rounded-lg">
                        <Clock className="h-3.5 w-3.5 text-brand-dark mb-0.5" />
                        <span className="text-xs font-bold text-slate-800">
                          {timeStr}
                        </span>
                      </div>

                      {/* Dados do Paciente e Consulta */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {appt.patients?.full_name || "Paciente sem nome"}
                          </span>
                          {appt.is_walk_in && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                              Encaixe
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {appt.services?.name || "Atendimento"} • Profissional:{" "}
                          <strong className="text-slate-700">
                            {appt.professionals?.name}
                          </strong>
                        </p>
                        {appt.patients?.phone && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {formatPhone(appt.patients.phone)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          appt.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : appt.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : appt.status === "checked_in"
                            ? "bg-amber-100 text-amber-800"
                            : appt.status === "in_progress"
                            ? "bg-purple-100 text-purple-800"
                            : appt.status === "done"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {appt.status === "scheduled"
                          ? "Agendado"
                          : appt.status === "confirmed"
                          ? "Confirmado"
                          : appt.status === "checked_in"
                          ? "Na Recepção"
                          : appt.status === "in_progress"
                          ? "Em Atendimento"
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
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* MODAL 1: NOVO AGENDAMENTO MANUAL */}
      {/* ======================================================== */}
      <Dialog open={newModalOpen} onOpenChange={setNewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento Manual</DialogTitle>
            <DialogDescription>
              Encaixe ou marque a consulta diretamente pelo balcão da clínica.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateManual} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="patientId">Paciente *</Label>
              <select
                id="patientId"
                name="patientId"
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="">Selecione o paciente...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({formatPhone(p.phone)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="professionalId">Profissional *</Label>
                <select
                  id="professionalId"
                  name="professionalId"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="">Selecione...</option>
                  {professionals.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="serviceId">Serviço *</Label>
                <select
                  id="serviceId"
                  name="serviceId"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="">Selecione...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration_min}m)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={dateStr}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  defaultValue="08:00"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Ex: Queixa de dor no joelho..."
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isWalkIn"
                name="isWalkIn"
                className="rounded border-slate-300 text-brand-dark focus:ring-brand-dark"
              />
              <label htmlFor="isWalkIn" className="text-xs text-slate-700 cursor-pointer">
                Marcar como <strong>Encaixe Emergencial</strong> (ignora restrições de slot)
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-brand-dark hover:bg-brand-primary text-white"
              >
                {submitting ? "Salvando..." : "Confirmar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 2: GESTÃO DE STATUS DA CONSULTA */}
      {/* ======================================================== */}
      {selectedAppt && (
        <Dialog open={apptModalOpen} onOpenChange={setApptModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gerenciar Consulta</DialogTitle>
              <DialogDescription>
                Atualize o andamento do paciente na clínica.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Resumo */}
              <div className="p-3.5 bg-slate-50 border rounded-xl space-y-1 text-xs">
                <p className="font-bold text-slate-800 text-sm">
                  {selectedAppt.patients?.full_name}
                </p>
                <p className="text-slate-600">
                  {selectedAppt.services?.name} • Profissional: {selectedAppt.professionals?.name}
                </p>
                <p className="text-slate-500">
                  Telefone: {formatPhone(selectedAppt.patients?.phone || "")}
                </p>
              </div>

              {/* Botões de Ação de Mudança de Status */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Alterar Situação do Paciente:
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={selectedAppt.status === "confirmed" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("confirmed")}
                    disabled={updatingStatus}
                    className="text-xs"
                  >
                    Confirmado
                  </Button>

                  <Button
                    size="sm"
                    variant={selectedAppt.status === "checked_in" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("checked_in")}
                    disabled={updatingStatus}
                    className="text-xs"
                  >
                    Chegou na Clínica
                  </Button>

                  <Button
                    size="sm"
                    variant={selectedAppt.status === "in_progress" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("in_progress")}
                    disabled={updatingStatus}
                    className="text-xs"
                  >
                    Em Atendimento
                  </Button>

                  <Button
                    size="sm"
                    variant={selectedAppt.status === "done" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("done")}
                    disabled={updatingStatus}
                    className="text-xs"
                  >
                    Concluído
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus("no_show")}
                    disabled={updatingStatus}
                    className="text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                  >
                    Não Compareceu
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus("cancelled")}
                    disabled={updatingStatus}
                    className="text-xs text-red-700 border-red-200 hover:bg-red-50"
                  >
                    Cancelar Horário
                  </Button>
                </div>
              </div>

              {/* Atalhos para Prontuário e Cobrança */}
              <div className="pt-2 border-t flex flex-wrap gap-2 justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
                    <Link href={`/pacientes/${selectedAppt.patient_id}`}>
                      <FileText className="h-3.5 w-3.5 text-brand-dark" />
                      Prontuário
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50">
                    <Link href={`/financeiro`}>
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                      Financeiro / Baixa
                    </Link>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setApptModalOpen(false)}
                  className="text-xs"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
