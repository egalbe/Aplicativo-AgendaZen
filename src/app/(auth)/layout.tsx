import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-brand-surface">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-dark text-white font-bold text-2xl shadow-sm">
            ☯
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-dark">
            Agenda<span className="text-brand-light">Zen</span>
          </span>
        </Link>
        <p className="mt-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
          Fisioterapia & Acupuntura Integrada
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
}
