"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  QrCode,
  Copy,
  Check,
  Printer,
  Share2,
  ExternalLink,
  Smartphone,
  Download,
  Sparkles,
  MapPin,
  MessageCircle,
} from "lucide-react";

interface Props {
  clinic: any;
  publicBookingUrl: string;
}

export default function DivulgacaoClient({ clinic, publicBookingUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [whatsappMsgCopied, setWhatsappMsgCopied] = useState(false);

  // URL do QR Code via serviço de imagem de alta resolução (Google Charts API ou QR Server)
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
    publicBookingUrl
  )}&color=0F4C5C&margin=10`;

  function handleCopyLink() {
    navigator.clipboard.writeText(publicBookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const whatsappMessage = `Olá! Para facilitar seu agendamento de fisioterapia ou acupuntura na *${clinic.name}*, você pode escolher o melhor dia e horário diretamente pelo nosso link online:\n\n👉 ${publicBookingUrl}\n\nÉ rápido e você recebe a confirmação na hora!`;

  function handleCopyWhatsappMsg() {
    navigator.clipboard.writeText(whatsappMessage);
    setWhatsappMsgCopied(true);
    setTimeout(() => setWhatsappMsgCopied(false), 2500);
  }

  function handlePrintDisplay() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Topo com Título e Descrição */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
            QR Code & Materiais de Divulgação
          </h1>
          <p className="text-sm text-slate-500">
            Disponibilize o auto-agendamento no balcão da sua recepção, no WhatsApp e no Instagram
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrintDisplay}
            className="bg-brand-dark hover:bg-brand-primary text-white font-medium flex items-center gap-2 shadow-sm"
          >
            <Printer className="h-4 w-4" /> Imprimir Display de Mesa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ======================================================== */}
        {/* COLUNA 1 & 2: CANAIS DE DIVULGAÇÃO & LINKS */}
        {/* ======================================================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Link Direto da Clínica */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-brand-dark" />
                Seu Link Público de Agendamento
              </CardTitle>
              <CardDescription className="text-xs">
                Compartilhe esse link no link da bio do Instagram, perfil do Google Meu Negócio ou mensagem direta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={publicBookingUrl}
                  className="bg-slate-50 font-mono text-xs text-slate-700 h-11"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="h-11 px-4 shrink-0 flex items-center gap-1.5 font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-500" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button asChild className="h-11 px-3 bg-brand-dark hover:bg-brand-primary text-white shrink-0">
                  <a href={publicBookingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5 text-brand-light" /> 100% otimizado para celulares
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-brand-light" /> Atualização em tempo real
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card: Mensagem Pronta para WhatsApp */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                Mensagem Automática para WhatsApp
              </CardTitle>
              <CardDescription className="text-xs">
                Copie este texto pronto para responder pacientes que entrarem em contato pelo WhatsApp da recepção.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {whatsappMessage}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleCopyWhatsappMsg}
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1.5"
                >
                  {whatsappMsgCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Mensagem Copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500" /> Copiar Mensagem de WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dicas de Como Utilizar */}
          <Card className="border-slate-200 bg-emerald-50/40 border-emerald-200/60 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Boas Práticas de Divulgação
              </h4>
              <ul className="text-xs text-emerald-900 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>
                  <strong>Na recepção:</strong> Imprima o display de mesa abaixo em papel couché ou coloque em um totem acrílico no balcão. O paciente aponta a câmera e agenda o retorno sozinho antes de sair.
                </li>
                <li>
                  <strong>No Instagram:</strong> Cole o link na biografia do perfil com o texto: <em>"Agende sua sessão online aqui 👇"</em>.
                </li>
                <li>
                  <strong>No WhatsApp Business:</strong> Adicione o link nas Respostas Rápidas ou na Mensagem de Ausência para não perder pacientes fora do horário comercial.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* ======================================================== */}
        {/* COLUNA 3: PRÉVIA DA PLACA DE BALCÃO / DISPLAY IMPRESSO */}
        {/* ======================================================== */}
        <div>
          <Card className="border-slate-200 shadow-sm sticky top-6 print:m-0 print:border-none print:shadow-none">
            <CardHeader className="pb-3 border-b bg-slate-50/50 print:hidden">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center justify-between">
                <span>Placa de Balcão (Display de Mesa)</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                  A5 / Balcão
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              {/* Moldura da Placa Impressa */}
              <div
                id="display-placa"
                className="bg-white border-2 border-brand-dark/20 rounded-2xl p-6 text-center shadow-lg space-y-4 print:border-none print:shadow-none print:p-0"
              >
                {/* Logo e Cabeçalho da Placa */}
                <div className="space-y-1">
                  <div className="h-12 w-12 rounded-xl bg-brand-dark text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-sm">
                    ☯
                  </div>
                  <h3 className="text-base font-bold text-brand-dark tracking-tight">
                    {clinic.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Fisioterapia & Acupuntura Integrada
                  </p>
                </div>

                <div className="border-t border-b border-dashed border-slate-200 py-3 space-y-1">
                  <span className="text-xs uppercase font-extrabold text-brand-dark tracking-wider block">
                    Agende sua Próxima Sessão
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto leading-tight">
                    Aponte a câmera do seu celular para o QR Code abaixo:
                  </p>
                </div>

                {/* QR Code Imagem de Alta Qualidade */}
                <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-inner inline-block">
                  <img
                    src={qrCodeImageUrl}
                    alt={`QR Code ${clinic.name}`}
                    className="w-48 h-48 mx-auto object-contain"
                  />
                </div>

                {/* Instrução Inferior */}
                <div className="space-y-1 text-slate-600">
                  <p className="text-[10px] font-semibold text-brand-dark">
                    Disponível 24 horas por dia
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    {publicBookingUrl.replace(/^https?:\/\//, "")}
                  </p>
                  {clinic.phone && (
                    <p className="text-[10px] text-slate-500 font-medium pt-1">
                      Dúvidas? WhatsApp: {clinic.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Botão de Download / Impressão */}
              <div className="mt-4 print:hidden space-y-2">
                <Button
                  onClick={handlePrintDisplay}
                  className="w-full text-xs font-semibold bg-brand-dark hover:bg-brand-primary text-white flex items-center justify-center gap-2 h-10 shadow-sm"
                >
                  <Printer className="h-4 w-4" /> Imprimir Display Agora
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full text-xs font-semibold flex items-center justify-center gap-2 h-10"
                >
                  <a
                    href={qrCodeImageUrl}
                    download={`qrcode-${clinic.slug}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 text-slate-500" /> Baixar Imagem do QR Code
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
