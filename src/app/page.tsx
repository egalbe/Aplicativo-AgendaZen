import Link from "next/link";
import { Sparkles, Calendar, Users, FileText, QrCode, ArrowRight, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark text-white font-bold text-xl shadow-sm">
              ☯
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-brand-dark">
                Agenda<span className="text-brand-light">Zen</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-brand-text/60 border-l pl-2">
                Fisioterapia & Acupuntura
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-brand-dark hover:bg-slate-100 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-primary transition-all"
            >
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 text-xs font-medium text-emerald-800 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-brand-light" />
              Desenvolvido exclusivamente para Fisioterapeutas e Acupunturistas
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-brand-dark sm:text-6xl max-w-4xl mx-auto leading-tight">
              A gestão clínica da sua prática com a{" "}
              <span className="text-brand-light">harmonia e precisão</span> que você merece.
            </h1>

            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Agendamento inteligente, prontuário eletrônico com <strong>mapa corporal interativo</strong> para fisioterapia e <strong>catálogo completo de pontos de acupuntura</strong>. Auto-agendamento por QR Code para seus pacientes.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-dark px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-dark/20 hover:bg-brand-primary transition-all"
              >
                Começar Teste Grátis de 14 Dias
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/c/clinica-demonstracao"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Ver Exemplo de QR Code Paciente
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-light" />
                Compatível com LGPD
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-light" />
                Multi-clínica & RLS Nativo
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-light" />
                PWA Instalável
              </div>
            </div>
          </div>
        </section>

        {/* Destaques das Funcionalidades */}
        <section className="bg-white py-16 border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="p-6 rounded-2xl bg-brand-surface border border-slate-100 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-brand-dark/10 flex items-center justify-center text-brand-dark">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-brand-dark text-lg">Agenda Inteligente</h3>
                <p className="text-sm text-slate-600">
                  Horários livres, bloqueados para encaixe e regras dinâmicas de recorrência sem sobrecarregar o banco.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-surface border border-slate-100 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-brand-dark text-lg">Prontuário & Mapas</h3>
                <p className="text-sm text-slate-600">
                  Evolução SOAP, EVA de dor, mapa corporal interativo em SVG e biblioteca de pontos dos 14 meridianos.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-surface border border-slate-100 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
                  <QrCode className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-brand-dark text-lg">QR Code de Balcão</h3>
                <p className="text-sm text-slate-600">
                  Gere a placa A5 para balcão. O paciente escaneia, cadastra-se com aceite LGPD e escolhe o horário.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-surface border border-slate-100 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-700">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-brand-dark text-lg">Segmentos & Preços</h3>
                <p className="text-sm text-slate-600">
                  Tabelas de preço por segmento (Particular, VIP, Convênio), pacotes de sessões e planos de fidelidade.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4">
          © {new Date().getFullYear()} AgendaZen. Fisioterapia & Acupuntura Integrativa. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
