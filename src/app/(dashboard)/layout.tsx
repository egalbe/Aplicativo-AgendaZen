import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  QrCode,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = [
    { name: "Agenda", href: "/agenda", icon: Calendar },
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Prontuário", href: "/prontuario", icon: FileText },
    { name: "Financeiro", href: "/financeiro", icon: DollarSign },
    { name: "QR Code & Divulgação", href: "/divulgacao", icon: QrCode },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-brand-surface">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3 px-6 pb-5 border-b">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-dark text-white font-bold text-lg shadow-sm">
              ☯
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-brand-dark">
                Agenda<span className="text-brand-light">Zen</span>
              </span>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Gestão Integrada
              </p>
            </div>
          </div>

          {/* Navegação Principal */}
          <nav className="mt-5 flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:text-brand-dark hover:bg-slate-50 transition-colors"
                >
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-brand-dark" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer Sidebar / Sair */}
          <div className="p-3 border-t">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair da Conta
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-brand-dark" />
            <span className="text-sm font-semibold text-slate-800">
              Minha Clínica
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
              Trial Ativo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/c/minha-clinica"
              target="_blank"
              className="text-xs text-brand-dark font-medium border border-brand-dark/20 px-3 py-1.5 rounded-lg hover:bg-brand-dark/5 transition-colors flex items-center gap-1.5"
            >
              <QrCode className="h-3.5 w-3.5 text-brand-light" />
              Página do Paciente
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
