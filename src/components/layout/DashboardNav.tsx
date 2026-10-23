"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  QrCode,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/app/(auth)/actions";

interface DashboardNavProps {
  clinicName: string;
  clinicSlug: string;
}

const navigation = [
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Prontuário", href: "/prontuario", icon: FileText },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "QR Code & Divulgação", href: "/divulgacao", icon: QrCode },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

export function DashboardNav({ clinicName, clinicSlug }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar button */}
      <div className="md:hidden flex items-center">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-brand-dark rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/50 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-xl flex flex-col p-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-white font-bold text-base shadow-sm">
                  ☯
                </div>
                <div>
                  <span className="text-base font-bold text-brand-dark">AgendaZen</span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Menu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-brand-dark text-white font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t space-y-2">
              <Link
                href={`/c/${clinicSlug}`}
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-brand-dark border border-brand-dark/20 rounded-lg hover:bg-brand-dark/5"
              >
                <QrCode className="h-4 w-4 text-brand-light" />
                Página de Auto-agendamento
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Conta
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function DesktopSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-5 flex-1 px-3 space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? "bg-brand-dark text-white font-semibold shadow-sm"
                : "text-slate-700 hover:text-brand-dark hover:bg-slate-50"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
