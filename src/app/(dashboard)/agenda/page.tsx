import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Clock, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      {/* Topo com Título e Ação Rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
            Agenda de Atendimentos
          </h1>
          <p className="text-sm text-slate-500">
            Visualize e gerencie os horários de fisioterapia e acupuntura da clínica
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button className="bg-brand-dark hover:bg-brand-primary text-white font-medium flex items-center gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Grade de Estatísticas Rápidas do Dia */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500">
              Consultas Hoje
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-brand-dark">0</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3 text-brand-light" /> Próxima sessão: Nenhuma agendada
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500">
              Horários Livres Hoje
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-brand-light">Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-slate-500">
              Conforme sua grade configurada no Onboarding
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500">
              Pacientes Cadastrados
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-brand-dark">0</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/pacientes"
              className="text-xs text-brand-dark hover:text-brand-primary font-medium flex items-center gap-1"
            >
              Ver lista de pacientes <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Calendário / Visão da Semana */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-brand-dark" />
              Grade de Horários da Semana
            </CardTitle>
            <CardDescription className="text-xs">
              Horários livres disponíveis para o paciente via QR Code e horários reservados para encaixes
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center py-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-brand-light mb-3">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            Sua agenda está pronta para receber agendamentos!
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Compartilhe seu QR Code ou link público para que seus pacientes realizem o auto-agendamento diretamente do celular.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/divulgacao">Baixar Placa QR Code</Link>
            </Button>
            <Button size="sm" className="bg-brand-dark hover:bg-brand-primary text-white">
              Agendar Paciente Manualmente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
