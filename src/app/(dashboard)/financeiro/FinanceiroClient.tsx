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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Check,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
  Search,
} from "lucide-react";
import { formatCurrency, formatPhone } from "@/lib/utils";
import {
  createReceivableAction,
  registerPaymentAction,
  sellPackageAction,
  saveExpenseAction,
  payExpenseAction,
  markCommissionAsPaidAction,
} from "./actions";

interface Props {
  receivables: any[];
  expenses: any[];
  commissions: any[];
  professionals: any[];
  patients: any[];
  services: any[];
  userRole: string;
}

export default function FinanceiroClient({
  receivables,
  expenses,
  commissions,
  professionals,
  patients,
  services,
  userRole,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Alertas
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modais
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<any>(null);

  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [newReceivableModalOpen, setNewReceivableModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Filtros
  const [recSearch, setRecSearch] = useState("");
  const [selectedProfCommission, setSelectedProfCommission] = useState("all");

  // ----------------------------------------------------
  // CÁLCULOS E TOTALIZADORES GERAIS
  // ----------------------------------------------------
  // Total Recebido
  const totalReceived = receivables.reduce((sum, r) => {
    const paidInThis = (r.payments || []).reduce(
      (pSum: number, p: any) => pSum + Number(p.amount),
      0
    );
    return sum + paidInThis;
  }, 0);

  // Total a Receber Pendente (status 'open' ou 'partially_paid')
  const totalPendingReceive = receivables.reduce((sum, r) => {
    if (r.status === "paid" || r.status === "cancelled") return sum;
    const paidInThis = (r.payments || []).reduce(
      (pSum: number, p: any) => pSum + Number(p.amount),
      0
    );
    const balance = Math.max(0, Number(r.amount) - paidInThis);
    return sum + balance;
  }, 0);

  // Total de Despesas Pagas e Pendentes
  const totalExpensesPaid = expenses
    .filter((e) => e.paid_at)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalExpensesPending = expenses
    .filter((e) => !e.paid_at)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  // Total de Comissões Pendentes de Repasse
  const totalCommissionsPending = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + Number(c.commission_amount), 0);

  const totalCommissionsPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + Number(c.commission_amount), 0);

  // Saldo Líquido da Clínica (Receitas Pagas - Despesas Pagas - Comissões Pagas)
  const netIncome = totalReceived - totalExpensesPaid - totalCommissionsPaid;

  // ----------------------------------------------------
  // AÇÕES
  // ----------------------------------------------------
  // 1. Dar baixa em recebimento
  async function handleRegisterPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedReceivable) return;
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      receivableId: selectedReceivable.id,
      amount: Number(formData.get("amount")),
      method: formData.get("method"),
      notes: formData.get("notes"),
    };

    const res = await registerPaymentAction(payload);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setPaymentModalOpen(false);
      setSuccessMsg("Pagamento registrado com sucesso!");
      router.refresh();
    }
  }

  // 2. Vender pacote
  async function handleSellPackage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      patientId: formData.get("patientId"),
      serviceId: formData.get("serviceId") || null,
      sessionsTotal: Number(formData.get("sessionsTotal")),
      pricePaid: Number(formData.get("pricePaid")),
      validDays: Number(formData.get("validDays")),
      paymentMethod: formData.get("paymentMethod"),
      paidNow: formData.get("paidNow") === "on",
    };

    const res = await sellPackageAction(payload);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setPackageModalOpen(false);
      setSuccessMsg("Pacote vendido e registrado no financeiro com sucesso!");
      router.refresh();
    }
  }

  // 3. Criar conta a receber avulsa
  async function handleCreateReceivable(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      patientId: formData.get("patientId") || null,
      description: formData.get("description"),
      amount: Number(formData.get("amount")),
      dueDate: formData.get("dueDate"),
    };

    const res = await createReceivableAction(payload);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setNewReceivableModalOpen(false);
      setSuccessMsg("Cobrança criada com sucesso!");
      router.refresh();
    }
  }

  // 4. Salvar despesa
  async function handleSaveExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      category: formData.get("category"),
      description: formData.get("description"),
      amount: Number(formData.get("amount")),
      dueDate: formData.get("dueDate"),
      isRecurring: formData.get("isRecurring") === "on",
    };

    const res = await saveExpenseAction(payload);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setExpenseModalOpen(false);
      setSuccessMsg("Despesa cadastrada com sucesso!");
      router.refresh();
    }
  }

  // 5. Pagar despesa
  async function handlePayExpense(expenseId: string) {
    setLoading(true);
    const res = await payExpenseAction(expenseId);
    setLoading(false);
    if (!res.error) {
      setSuccessMsg("Despesa marcada como paga!");
      router.refresh();
    }
  }

  // 6. Liquidar comissão
  async function handlePayCommission(commId: string) {
    setLoading(true);
    const res = await markCommissionAsPaidAction(commId);
    setLoading(false);
    if (!res.error) {
      setSuccessMsg("Comissão marcada como liquidada com sucesso!");
      router.refresh();
    }
  }

  // Filtragem de recebíveis
  const filteredReceivables = receivables.filter((r) => {
    return (
      r.description?.toLowerCase().includes(recSearch.toLowerCase()) ||
      r.patients?.full_name?.toLowerCase().includes(recSearch.toLowerCase())
    );
  });

  // Filtragem de comissões
  const filteredCommissions = commissions.filter((c) => {
    return (
      selectedProfCommission === "all" ||
      c.professional_id === selectedProfCommission
    );
  });

  return (
    <div className="space-y-6">
      {/* Topo com Título e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
            Financeiro & Split de Comissões
          </h1>
          <p className="text-sm text-slate-500">
            Controle receitas, venda de pacotes, despesas e repasses dos fisioterapeutas e acupunturistas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setPackageModalOpen(true)}
            className="bg-brand-light hover:bg-emerald-600 text-white font-medium text-xs h-9 gap-1.5 shadow-sm"
          >
            <Package className="h-4 w-4" /> Vender Pacote
          </Button>

          <Button
            onClick={() => setNewReceivableModalOpen(true)}
            variant="outline"
            className="text-xs h-9 gap-1.5 font-medium"
          >
            <Plus className="h-4 w-4" /> Nova Cobrança
          </Button>

          <Button
            onClick={() => setExpenseModalOpen(true)}
            variant="outline"
            className="text-xs h-9 gap-1.5 font-medium text-red-700 border-red-200 hover:bg-red-50"
          >
            <ArrowDownRight className="h-4 w-4" /> Nova Despesa
          </Button>
        </div>
      </div>

      {/* Alertas */}
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

      {/* ======================================================== */}
      {/* CARDS COM INDICADORES FINANCEIROS CHAVE (KPIs) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Realizada */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500 flex items-center justify-between">
              <span>Receita Realizada</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-700">
              {formatCurrency(totalReceived)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-slate-500">
              A receber pendente: <strong>{formatCurrency(totalPendingReceive)}</strong>
            </span>
          </CardContent>
        </Card>

        {/* Despesas Pagas */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500 flex items-center justify-between">
              <span>Despesas Pagas</span>
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-700">
              {formatCurrency(totalExpensesPaid)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-slate-500">
              A pagar pendente: <strong>{formatCurrency(totalExpensesPending)}</strong>
            </span>
          </CardContent>
        </Card>

        {/* Repasses / Comissões Pendentes */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500 flex items-center justify-between">
              <span>Comissões a Repassar</span>
              <Users className="h-4 w-4 text-amber-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-700">
              {formatCurrency(totalCommissionsPending)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-slate-500">
              Já repassado: {formatCurrency(totalCommissionsPaid)}
            </span>
          </CardContent>
        </Card>

        {/* Saldo Líquido da Clínica */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-slate-500 flex items-center justify-between">
              <span>Resultado Líquido</span>
              <DollarSign className="h-4 w-4 text-brand-dark" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-brand-dark">
              {formatCurrency(netIncome)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-[11px] text-slate-500">
              Receitas - Despesas - Comissões
            </span>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* ABAS DO FINANCEIRO */}
      {/* ======================================================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-10 p-1 bg-slate-200/60 rounded-xl">
          <TabsTrigger value="overview" className="text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Contas a Receber ({receivables.length})
          </TabsTrigger>
          <TabsTrigger value="commissions" className="text-xs font-semibold">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Repasses & Comissões ({commissions.length})
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs font-semibold">
            <TrendingDown className="h-3.5 w-3.5 mr-1.5" /> Despesas & Contas a Pagar ({expenses.length})
          </TabsTrigger>
          <TabsTrigger value="dre" className="text-xs font-semibold">
            <PieChartIcon className="h-3.5 w-3.5 mr-1.5" /> DRE & Demonstrativo
          </TabsTrigger>
        </TabsList>

        {/* ======================================================== */}
        {/* ABA 1: CONTAS A RECEBER */}
        {/* ======================================================== */}
        <TabsContent value="overview" className="space-y-4 pt-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 bg-slate-50/50 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Lançamentos de Receita
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={recSearch}
                  onChange={(e) => setRecSearch(e.target.value)}
                  placeholder="Buscar por paciente ou descrição..."
                  className="pl-8 text-xs h-8 bg-white"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b">
                    <tr>
                      <th className="p-3">Descrição / Paciente</th>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Valor Total</th>
                      <th className="p-3">Valor Pago</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReceivables.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Nenhum lançamento encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredReceivables.map((rec) => {
                        const totalPaidInRec = (rec.payments || []).reduce(
                          (acc: number, p: any) => acc + Number(p.amount),
                          0
                        );

                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <span className="font-semibold text-slate-900 block">
                                {rec.description}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {rec.patients?.full_name || "Venda balcão / Sem paciente"}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">
                              {rec.due_date.split("-").reverse().join("/")}
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {formatCurrency(Number(rec.amount))}
                            </td>
                            <td className="p-3 font-semibold text-emerald-700">
                              {formatCurrency(totalPaidInRec)}
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  rec.status === "paid"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : rec.status === "partially_paid"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {rec.status === "paid"
                                  ? "Pago"
                                  : rec.status === "partially_paid"
                                  ? "Parcial"
                                  : "Em Aberto"}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {rec.status !== "paid" ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReceivable(rec);
                                    setPaymentModalOpen(true);
                                  }}
                                  className="h-7 text-[11px] bg-brand-dark hover:bg-brand-primary text-white"
                                >
                                  Dar Baixa
                                </Button>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-medium">
                                  Liquidado
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* ABA 2: COMISSÕES E REPASSES DOS PROFISSIONAIS */}
        {/* ======================================================== */}
        <TabsContent value="commissions" className="space-y-4 pt-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 bg-slate-50/50 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Split de Repasse dos Profissionais
                </CardTitle>
                <CardDescription className="text-xs">
                  Cálculo automático baseado na % de comissão contratada de cada fisioterapeuta e acupunturista.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={selectedProfCommission}
                  onChange={(e) => setSelectedProfCommission(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  <option value="all">Todos os Profissionais</option>
                  {professionals.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name} ({pr.commission_rate}%)
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b">
                    <tr>
                      <th className="p-3">Profissional</th>
                      <th className="p-3">Data do Atendimento</th>
                      <th className="p-3">Valor Cobrado</th>
                      <th className="p-3">% Contratada</th>
                      <th className="p-3">Comissão Devida</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCommissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Nenhum repasse de comissão encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredCommissions.map((comm) => (
                        <tr key={comm.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <span className="font-semibold text-slate-900 block">
                              {comm.professionals?.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {comm.professionals?.specialty === "physio"
                                ? "Fisioterapia"
                                : comm.professionals?.specialty === "acupuncture"
                                ? "Acupuntura"
                                : "Fisio & Acupuntura"}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">
                            {format(new Date(comm.created_at), "dd/MM/yyyy")}
                          </td>
                          <td className="p-3 text-slate-800">
                            {formatCurrency(Number(comm.base_amount))}
                          </td>
                          <td className="p-3 font-semibold text-slate-700">
                            {comm.professionals?.commission_rate}%
                          </td>
                          <td className="p-3 font-bold text-emerald-700">
                            {formatCurrency(Number(comm.commission_amount))}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                comm.status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {comm.status === "paid" ? "Repassado" : "A Pagar"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {comm.status === "pending" ? (
                              <Button
                                size="sm"
                                onClick={() => handlePayCommission(comm.id)}
                                className="h-7 text-[11px] bg-brand-dark hover:bg-brand-primary text-white"
                              >
                                Pagar Repasse
                              </Button>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Pago em {comm.paid_at ? format(new Date(comm.paid_at), "dd/MM") : "--"}
                              </span>
                            )}
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
        {/* ABA 3: DESPESAS E CONTAS A PAGAR */}
        {/* ======================================================== */}
        <TabsContent value="expenses" className="space-y-4 pt-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 bg-slate-50/50 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Contas a Pagar & Despesas Operacionais
                </CardTitle>
                <CardDescription className="text-xs">
                  Aluguel, insumos (agulhas, óleos), energia, software e marketing.
                </CardDescription>
              </div>

              <Button
                size="sm"
                onClick={() => setExpenseModalOpen(true)}
                className="bg-brand-dark text-white text-xs h-8"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Despesa
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b">
                    <tr>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Descrição</th>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Nenhuma despesa lançada no momento.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <span className="font-semibold capitalize text-slate-800">
                              {exp.category}
                            </span>
                            {exp.is_recurring && (
                              <span className="text-[10px] text-brand-light block">
                                Recorrente
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-700 font-medium">{exp.description}</td>
                          <td className="p-3 text-slate-600">
                            {exp.due_date.split("-").reverse().join("/")}
                          </td>
                          <td className="p-3 font-semibold text-red-700">
                            {formatCurrency(Number(exp.amount))}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                exp.paid_at
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {exp.paid_at ? "Paga" : "Pendente"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {!exp.paid_at ? (
                              <Button
                                size="sm"
                                onClick={() => handlePayExpense(exp.id)}
                                className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Baixar
                              </Button>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Paga em {exp.paid_at.split("-").reverse().join("/")}
                              </span>
                            )}
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
        {/* ABA 4: DRE & DEMONSTRATIVO FINANCEIRO */}
        {/* ======================================================== */}
        <TabsContent value="dre" className="space-y-4 pt-2">
          <Card className="border-slate-200 shadow-sm max-w-2xl">
            <CardHeader className="py-4 border-b bg-slate-50/50">
              <CardTitle className="text-base font-semibold text-slate-800">
                Demonstrativo de Resultado do Exercício (DRE Sintético)
              </CardTitle>
              <CardDescription className="text-xs">
                Visão consolidada de receitas operacionais, custos variáveis (repasses) e despesas fixas.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-slate-800 border-b pb-2">
                  <span>(+) RECEITA BRUTA OPERACIONAL (Consultas e Pacotes)</span>
                  <span className="text-emerald-700">{formatCurrency(totalReceived)}</span>
                </div>

                <div className="flex justify-between text-slate-600 pl-4 py-1">
                  <span>(-) Repasses / Split aos Profissionais (Comissões)</span>
                  <span className="text-amber-700 font-medium">
                    {formatCurrency(totalCommissionsPaid + totalCommissionsPending)}
                  </span>
                </div>

                <div className="flex justify-between font-semibold text-slate-800 bg-slate-50 p-2 rounded">
                  <span>(=) MARGEM DE CONTRIBUIÇÃO DA CLÍNICA</span>
                  <span>
                    {formatCurrency(
                      totalReceived - (totalCommissionsPaid + totalCommissionsPending)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 pl-4 py-1">
                  <span>(-) Despesas Operacionais e Fixas</span>
                  <span className="text-red-700 font-medium">
                    {formatCurrency(totalExpensesPaid + totalExpensesPending)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-brand-dark border-t-2 border-brand-dark pt-3">
                  <span>(=) LUCRO LÍQUIDO OPERACIONAL DA CLÍNICA</span>
                  <span
                    className={
                      netIncome >= 0 ? "text-emerald-700" : "text-red-700"
                    }
                  >
                    {formatCurrency(netIncome)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ======================================================== */}
      {/* MODAL 1: REGISTRAR PAGAMENTO / BAIXA */}
      {/* ======================================================== */}
      {selectedReceivable && (
        <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Pagamento / Baixa</DialogTitle>
              <DialogDescription>
                Informe o valor recebido e o método de pagamento escolhido pelo paciente.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegisterPayment} className="space-y-4">
              <div className="p-3 bg-slate-50 border rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-800 block">
                  {selectedReceivable.description}
                </span>
                <span className="text-slate-500 block">
                  Paciente: {selectedReceivable.patients?.full_name || "Venda Balcão"}
                </span>
                <span className="text-emerald-800 font-bold block">
                  Valor Total: {formatCurrency(Number(selectedReceivable.amount))}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payAmount" className="text-xs font-semibold">
                  Valor do Pagamento (R$) *
                </Label>
                <Input
                  id="payAmount"
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={selectedReceivable.amount}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="method" className="text-xs font-semibold">
                  Forma de Pagamento *
                </Label>
                <select
                  id="method"
                  name="method"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  <option value="pix">PIX Instantâneo</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="cash">Dinheiro em Espécie</option>
                  <option value="bank_slip">Boleto Bancário</option>
                  <option value="insurance">Repasse de Convênio</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Observações (Opcional)
                </Label>
                <Input id="notes" name="notes" placeholder="Ex: Pago na recepção em 1x..." />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-dark hover:bg-brand-primary text-white"
                >
                  {loading ? "Registrando..." : "Confirmar Baixa"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: VENDER PACOTE DE SESSÕES */}
      {/* ======================================================== */}
      <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Venda de Pacote de Sessões</DialogTitle>
            <DialogDescription>
              Cria o saldo de sessões para o paciente e gera o recebível no financeiro.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSellPackage} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pkgPatient" className="text-xs font-semibold">
                Paciente *
              </Label>
              <select
                id="pkgPatient"
                name="patientId"
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="">Selecione o paciente...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({formatPhone(p.phone)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pkgService" className="text-xs font-semibold">
                Serviço Relacionado *
              </Label>
              <select
                id="pkgService"
                name="serviceId"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="">Todos / Livre escolha</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sessionsTotal" className="text-xs font-semibold">
                  Qtd de Sessões *
                </Label>
                <Input
                  id="sessionsTotal"
                  name="sessionsTotal"
                  type="number"
                  defaultValue="10"
                  min="2"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pricePaid" className="text-xs font-semibold">
                  Valor Total do Pacote (R$) *
                </Label>
                <Input
                  id="pricePaid"
                  name="pricePaid"
                  type="number"
                  step="0.01"
                  defaultValue="1500.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="validDays" className="text-xs font-semibold">
                  Validade em Dias *
                </Label>
                <Input
                  id="validDays"
                  name="validDays"
                  type="number"
                  defaultValue="90"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod" className="text-xs font-semibold">
                  Forma de Pagamento *
                </Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="cash">Dinheiro</option>
                  <option value="bank_slip">Boleto</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="paidNow"
                name="paidNow"
                defaultChecked
                className="rounded border-slate-300 text-brand-dark focus:ring-brand-dark"
              />
              <label htmlFor="paidNow" className="text-xs text-slate-700 cursor-pointer">
                Pagamento já recebido no ato (marca como <strong>pago</strong> imediatamente)
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPackageModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-dark hover:bg-brand-primary text-white"
              >
                {loading ? "Processando..." : "Confirmar Venda do Pacote"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 3: NOVA COBRANÇA AVULSA */}
      {/* ======================================================== */}
      <Dialog open={newReceivableModalOpen} onOpenChange={setNewReceivableModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Conta a Receber</DialogTitle>
            <DialogDescription>
              Lance uma cobrança avulsa de consulta ou procedimento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReceivable} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="recPatient" className="text-xs font-semibold">
                Paciente (Opcional)
              </Label>
              <select
                id="recPatient"
                name="patientId"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="">Nenhum / Venda Balcão</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recDesc" className="text-xs font-semibold">
                Descrição da Cobrança *
              </Label>
              <Input
                id="recDesc"
                name="description"
                placeholder="Ex: Sessão de Acupuntura Avulsa"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="recAmount" className="text-xs font-semibold">
                  Valor (R$) *
                </Label>
                <Input
                  id="recAmount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="200.00"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="recDue" className="text-xs font-semibold">
                  Data de Vencimento *
                </Label>
                <Input
                  id="recDue"
                  name="dueDate"
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewReceivableModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-dark hover:bg-brand-primary text-white"
              >
                Salvar Cobrança
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 4: NOVA DESPESA OPERACIONAL */}
      {/* ======================================================== */}
      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Despesa / Conta a Pagar</DialogTitle>
            <DialogDescription>
              Lance custos fixos ou insumos adquiridos pela clínica.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveExpense} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="expCat" className="text-xs font-semibold">
                Categoria *
              </Label>
              <select
                id="expCat"
                name="category"
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="aluguel">Aluguel / Condomínio</option>
                <option value="insumos">Insumos (Agulhas, Ventosas, Óleos, Fita)</option>
                <option value="energia">Energia / Água / Internet</option>
                <option value="marketing">Marketing / Anúncios</option>
                <option value="software">Software / Tecnologia</option>
                <option value="outros">Outras Despesas</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expDesc" className="text-xs font-semibold">
                Descrição da Despesa *
              </Label>
              <Input
                id="expDesc"
                name="description"
                placeholder="Ex: Compra de 500 agulhas de acupuntura DongBang"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expAmount" className="text-xs font-semibold">
                  Valor (R$) *
                </Label>
                <Input
                  id="expAmount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="350.00"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expDue" className="text-xs font-semibold">
                  Vencimento *
                </Label>
                <Input
                  id="expDue"
                  name="dueDate"
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                className="rounded border-slate-300 text-brand-dark focus:ring-brand-dark"
              />
              <label htmlFor="isRecurring" className="text-xs text-slate-700 cursor-pointer">
                Despesa Mensal Recorrente
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setExpenseModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-dark hover:bg-brand-primary text-white"
              >
                Cadastrar Despesa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
