"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { savePatientAction } from "./actions";
import { formatCPF, formatPhone } from "@/lib/utils";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  MapPin,
} from "lucide-react";

interface Props {
  initialPatients: any[];
  segments: any[];
  plans: any[];
}

export default function PacientesListClient({ initialPatients, segments, plans }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Busca de CEP automática via ViaCEP
  const [cepLoading, setCepLoading] = useState(false);
  const [addressData, setAddressData] = useState({
    street: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  async function handleCepBlur(cep: string) {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddressData({
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          });
        }
      } catch (err) {
        console.warn("Erro ao buscar CEP:", err);
      } finally {
        setCepLoading(false);
      }
    }
  }

  // Filtragem local instantânea
  const filteredPatients = initialPatients.filter((p) => {
    const matchSearch =
      !searchTerm ||
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.cpf && p.cpf.includes(searchTerm.replace(/\D/g, ""))) ||
      (p.phone && p.phone.includes(searchTerm.replace(/\D/g, "")));

    const matchStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? p.active
        : !p.active;

    const matchSegment =
      segmentFilter === "all" ? true : p.segment_id === segmentFilter;

    return matchSearch && matchStatus && matchSegment;
  });

  async function handleSaveNewPatient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      fullName: formData.get("fullName"),
      cpf: formData.get("cpf"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      birthDate: formData.get("birthDate"),
      sex: formData.get("sex"),
      profession: formData.get("profession"),
      emergencyContact: formData.get("emergencyContact"),
      segmentId: formData.get("segmentId") || null,
      notes: formData.get("notes"),
      lgpdConsent: formData.get("lgpdConsent") === "on",
      // Endereço
      zip: formData.get("zip"),
      street: formData.get("street"),
      number: formData.get("number"),
      complement: formData.get("complement"),
      neighborhood: formData.get("neighborhood"),
      city: formData.get("city"),
      state: formData.get("state"),
      // Convênio
      insurancePlanId: formData.get("insurancePlanId") || null,
      cardNumber: formData.get("cardNumber") || "",
      cardValidUntil: formData.get("cardValidUntil") || "",
    };

    const res = await savePatientAction(payload);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setModalOpen(false);
      router.refresh();
      if (res.patientId) {
        router.push(`/pacientes/${res.patientId}`);
      }
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Topo com Título e Botão de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-light" /> Pacientes
          </h1>
          <p className="text-sm text-slate-500">
            Base completa de pacientes, termos LGPD, segmentos e prontuários vinculados
          </p>
        </div>

        <Button
          onClick={() => {
            setErrorMsg(null);
            setModalOpen(true);
          }}
          className="bg-brand-dark hover:bg-brand-primary text-white font-medium flex items-center gap-2 shadow-sm"
        >
          <UserPlus className="h-4 w-4" /> Novo Paciente
        </Button>
      </div>

      {/* Barra de Filtros e Busca Rápida */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Campo de Busca */}
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, CPF ou celular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200"
              />
            </div>

            {/* Filtro de Status */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Apenas Ativos</option>
                <option value="inactive">Apenas Inativos</option>
              </select>
            </div>

            {/* Filtro de Segmento */}
            <div className="sm:col-span-3">
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm"
              >
                <option value="all">Todos os Segmentos</option>
                {segments.map((seg) => (
                  <option key={seg.id} value={seg.id}>
                    {seg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista / Tabela de Pacientes */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50 py-3 px-6 flex flex-row items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Total Encontrado: {filteredPatients.length} paciente(s)
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredPatients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-700">Nenhum paciente encontrado</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchTerm
                    ? "Tente alterar os termos da busca ou limpe os filtros."
                    : "Cadastre seu primeiro paciente ou compartilhe seu QR Code para auto-cadastro."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="mt-4"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Cadastrar Agora
                </Button>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-dark/10 flex items-center justify-center text-brand-dark font-bold text-sm">
                      {patient.full_name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/pacientes/${patient.id}`}
                          className="font-semibold text-slate-900 text-sm hover:text-brand-dark hover:underline"
                        >
                          {patient.full_name}
                        </Link>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            patient.active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {patient.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                        {patient.cpf && <span>CPF: {formatCPF(patient.cpf)}</span>}
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-brand-light" />
                          {formatPhone(patient.phone)}
                        </span>
                        {patient.patient_segments?.name && (
                          <span className="bg-brand-surface text-brand-dark font-medium px-2 py-0.5 rounded border border-slate-200">
                            {patient.patient_segments.name}
                          </span>
                        )}
                        {patient.lgpd_consent_at && (
                          <span className="flex items-center gap-1 text-emerald-700" title="Consentimento LGPD ativo">
                            <ShieldCheck className="h-3.5 w-3.5" /> LGPD OK
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/pacientes/${patient.id}`}>
                        <FileText className="h-3.5 w-3.5 mr-1 text-slate-500" />
                        Prontuário & Perfil
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* MODAL: CADASTRO COMPLETO DE PACIENTE COM VIA CEP E LGPD */}
      {/* ======================================================== */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveNewPatient}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <UserPlus className="h-5 w-5 text-brand-light" />
                Cadastrar Novo Paciente
              </DialogTitle>
              <DialogDescription>
                Preencha os dados cadastrais do paciente, endereço e consentimento LGPD.
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="my-3 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4 py-4 text-xs">
              {/* DADOS BÁSICOS */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input id="fullName" name="fullName" placeholder="Ex: Lucas Gabriel da Silva" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" name="cpf" placeholder="000.000.000-00" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Celular / WhatsApp *</Label>
                  <Input id="phone" name="phone" placeholder="(11) 98765-4321" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input id="birthDate" name="birthDate" type="date" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" placeholder="paciente@email.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sex">Sexo Biológico</Label>
                  <select
                    id="sex"
                    name="sex"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Selecione...</option>
                    <option value="F">Feminino</option>
                    <option value="M">Masculino</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="segmentId">Segmento de Preço</Label>
                  <select
                    id="segmentId"
                    name="segmentId"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Padrão da Clínica</option>
                    {segments.map((seg) => (
                      <option key={seg.id} value={seg.id}>
                        {seg.name} {seg.is_default ? "(Padrão)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="profession">Profissão / Ocupação</Label>
                  <Input id="profession" name="profession" placeholder="Ex: Engenheiro de Software" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                  <Input id="emergencyContact" name="emergencyContact" placeholder="Nome e telefone de familiar" />
                </div>
              </div>

              {/* ENDEREÇO COM VIA CEP */}
              <div className="border-t pt-3">
                <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-dark" /> Endereço Residencial
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="zip">CEP</Label>
                    <div className="relative">
                      <Input
                        id="zip"
                        name="zip"
                        placeholder="00000-000"
                        onBlur={(e) => handleCepBlur(e.target.value)}
                      />
                      {cepLoading && (
                        <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-brand-dark" />
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="street">Rua / Avenida</Label>
                    <Input
                      id="street"
                      name="street"
                      defaultValue={addressData.street}
                      placeholder="Rua das Palmeiras"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" name="number" placeholder="123" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input id="complement" name="complement" placeholder="Apto 42" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      name="neighborhood"
                      defaultValue={addressData.neighborhood}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1.5">
                      <Label htmlFor="city">Cidade</Label>
                      <Input id="city" name="city" defaultValue={addressData.city} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state">UF</Label>
                      <Input id="state" name="state" defaultValue={addressData.state} maxLength={2} />
                    </div>
                  </div>
                </div>
              </div>

              {/* VÍNCULO OPCIONAL COM CONVÊNIO */}
              {plans.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-brand-dark" /> Convênio de Saúde (Opcional)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="insurancePlanId">Plano de Saúde</Label>
                      <select
                        id="insurancePlanId"
                        name="insurancePlanId"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      >
                        <option value="">Nenhum (Particular)</option>
                        {plans.map((pl) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.insurers?.name} - {pl.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cardNumber">Nº Carteirinha</Label>
                      <Input id="cardNumber" name="cardNumber" placeholder="000000000000" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cardValidUntil">Validade</Label>
                      <Input id="cardValidUntil" name="cardValidUntil" type="date" />
                    </div>
                  </div>
                </div>
              )}

              {/* TERMO DE CONSENTIMENTO LGPD */}
              <div className="border-t pt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="lgpdConsent"
                    name="lgpdConsent"
                    defaultChecked
                    className="mt-1 rounded text-brand-dark cursor-pointer"
                  />
                  <div>
                    <Label htmlFor="lgpdConsent" className="font-semibold text-slate-800 cursor-pointer">
                      Consentimento de Tratamento de Dados (LGPD)
                    </Label>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      O paciente autoriza a coleta e processamento de seus dados pessoais e histórico clínico de saúde exclusivamente para fins de atendimento e prontuário fisioterapêutico/acupuntura, com registro de data/hora e IP.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-dark hover:bg-brand-primary text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Cadastrando...
                  </>
                ) : (
                  "Salvar Paciente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
