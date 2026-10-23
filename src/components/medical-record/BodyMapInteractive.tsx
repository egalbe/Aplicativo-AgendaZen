"use client";

import React, { useState } from "react";
import { BodyMarkingInput } from "@/lib/validations/medical-record";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Plus,
  RotateCw,
  Flame,
  Zap,
  Activity,
  Layers,
  HelpCircle,
} from "lucide-react";

interface Props {
  markings: BodyMarkingInput[];
  onChange: (markings: BodyMarkingInput[]) => void;
  readOnly?: boolean;
}

export default function BodyMapInteractive({
  markings,
  onChange,
  readOnly = false,
}: Props) {
  const [currentView, setCurrentView] = useState<"front" | "back">("front");
  const [selectedKind, setSelectedKind] = useState<
    "dor" | "contratura" | "edema" | "limitacao" | "lesao"
  >("dor");
  const [selectedIntensity, setSelectedIntensity] = useState<number>(7);
  const [selectedSide, setSelectedSide] = useState<
    "left" | "right" | "center" | "bilateral"
  >("center");
  const [note, setNote] = useState<string>("");

  // Cores por tipo de achado clínico
  const kindColors: Record<string, { bg: string; border: string; label: string }> = {
    dor: { bg: "#EF4444", border: "#B91C1C", label: "Dor / Algia" },
    contratura: { bg: "#F59E0B", border: "#B45309", label: "Trigger Point / Tensão" },
    edema: { bg: "#3B82F6", border: "#1D4ED8", label: "Edema / Inchaço" },
    limitacao: { bg: "#8B5CF6", border: "#6D28D9", label: "Bloqueio / Restrição" },
    lesao: { bg: "#EC4899", border: "#BE185D", label: "Lesão / Pós-op" },
  };

  // Clique no SVG para adicionar marcação
  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (readOnly) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarking: BodyMarkingInput = {
      view: currentView,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      kind: selectedKind,
      intensity: selectedIntensity,
      side: selectedSide,
      note: note || null,
    };

    onChange([...markings, newMarking]);
    setNote("");
  }

  // Remover marcação
  function handleRemoveMarking(index: number) {
    if (readOnly) return;
    const updated = markings.filter((_, i) => i !== index);
    onChange(updated);
  }

  // Filtrar marcações da vista atual (frente ou costas)
  const currentMarkings = markings.filter((m) => m.view === currentView);

  return (
    <div className="space-y-4">
      {/* Barra de Controles: Alternar Frente/Costas e Ferramentas */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border rounded-xl">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={currentView === "front" ? "default" : "outline"}
            onClick={() => setCurrentView("front")}
            className="text-xs h-8"
          >
            Vista Anterior (Frente)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={currentView === "back" ? "default" : "outline"}
            onClick={() => setCurrentView("back")}
            className="text-xs h-8"
          >
            Vista Posterior (Costas)
          </Button>
        </div>

        {!readOnly && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Tipo de Achado:</span>
            {(
              Object.keys(kindColors) as Array<
                "dor" | "contratura" | "edema" | "limitacao" | "lesao"
              >
            ).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSelectedKind(k)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all border ${
                  selectedKind === k
                    ? "ring-2 ring-slate-800 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
                style={
                  selectedKind === k
                    ? { backgroundColor: kindColors[k].bg, borderColor: kindColors[k].border }
                    : {}
                }
              >
                {kindColors[k].label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* ======================================================== */}
        {/* ÁREA INTERATIVA DO MAPA SVG */}
        {/* ======================================================== */}
        <div className="md:col-span-7 flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl relative shadow-inner min-h-[460px]">
          <div className="absolute top-3 left-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            {currentView === "front" ? "Anterior (Frente)" : "Posterior (Costas)"}
          </div>

          {!readOnly && (
            <div className="absolute top-3 right-4 text-[11px] text-slate-400 flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" /> Clique no corpo para marcar
            </div>
          )}

          {/* SVG Silhouette do Corpo Humano */}
          <div className="relative w-full max-w-[280px] aspect-[1/2] select-none">
            <svg
              viewBox="0 0 200 400"
              onClick={handleSvgClick}
              className={`w-full h-full drop-shadow-sm ${
                readOnly ? "cursor-default" : "cursor-crosshair"
              }`}
            >
              {/* Definições de gradiente */}
              <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
              </defs>

              {/* Contorno Geral do Corpo Humano (Frente ou Costas) */}
              <g fill="url(#bodyGrad)" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round">
                {/* Cabeça */}
                <ellipse cx="100" cy="38" rx="22" ry="28" />

                {/* Pescoço */}
                <path d="M 91 65 L 91 80 L 109 80 L 109 65 Z" />

                {/* Ombros, Tórax e Tronco */}
                {currentView === "front" ? (
                  // Vista Frente: Detalhes de clavícula e abdome sutis
                  <path d="
                    M 91 80
                    C 75 83, 50 95, 42 110
                    C 38 120, 32 165, 30 200
                    C 28 225, 22 250, 18 265
                    C 20 270, 26 270, 30 260
                    C 38 240, 46 195, 52 175
                    C 55 175, 55 235, 58 245
                    L 96 245
                    L 98 335
                    L 95 385
                    C 95 390, 85 392, 78 395
                    C 78 400, 92 400, 98 398
                    L 100 250
                    L 102 398
                    C 108 400, 122 400, 122 395
                    C 115 392, 105 390, 105 385
                    L 102 335
                    L 104 245
                    L 142 245
                    C 145 235, 145 175, 148 175
                    C 154 195, 162 240, 170 260
                    C 174 270, 180 270, 182 265
                    C 178 250, 172 225, 170 200
                    C 168 165, 162 120, 158 110
                    C 150 95, 125 83, 109 80
                    Z
                  " />
                ) : (
                  // Vista Costas: Escápulas e coluna
                  <path d="
                    M 91 80
                    C 75 83, 50 95, 42 110
                    C 38 120, 32 165, 30 200
                    C 28 225, 22 250, 18 265
                    C 20 270, 26 270, 30 260
                    C 38 240, 46 195, 52 175
                    C 55 175, 55 235, 58 245
                    L 96 245
                    L 98 335
                    L 95 385
                    C 95 390, 85 392, 78 395
                    C 78 400, 92 400, 98 398
                    L 100 250
                    L 102 398
                    C 108 400, 122 400, 122 395
                    C 115 392, 105 390, 105 385
                    L 102 335
                    L 104 245
                    L 142 245
                    C 145 235, 145 175, 148 175
                    C 154 195, 162 240, 170 260
                    C 174 270, 180 270, 182 265
                    C 178 250, 172 225, 170 200
                    C 168 165, 162 120, 158 110
                    C 150 95, 125 83, 109 80
                    Z
                  " />
                )}

                {/* Linhas anatômicas sutis para orientação */}
                {currentView === "front" ? (
                  <g stroke="#94A3B8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6">
                    {/* Clavículas */}
                    <line x1="70" y1="88" x2="94" y2="92" />
                    <line x1="130" y1="88" x2="106" y2="92" />
                    {/* Umbigo */}
                    <circle cx="100" cy="180" r="2" fill="#94A3B8" />
                    {/* Joelhos */}
                    <ellipse cx="80" cy="305" rx="7" ry="5" fill="none" />
                    <ellipse cx="120" cy="305" rx="7" ry="5" fill="none" />
                  </g>
                ) : (
                  <g stroke="#94A3B8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6">
                    {/* Escápulas */}
                    <path d="M 68 105 Q 65 130 82 135" fill="none" />
                    <path d="M 132 105 Q 135 130 118 135" fill="none" />
                    {/* Linha da Coluna Vertebral */}
                    <line x1="100" y1="75" x2="100" y2="235" />
                    {/* Pregas Glúteas */}
                    <path d="M 70 245 Q 85 255 100 245" fill="none" />
                    <path d="M 130 245 Q 115 255 100 245" fill="none" />
                  </g>
                )}
              </g>

              {/* Renderização dos Pontos Marcados */}
              {currentMarkings.map((m, idx) => {
                const conf = kindColors[m.kind] || kindColors.dor;
                // Converter porcentagem de 0-100 para coordenadas SVG (200x400)
                const cx = (m.x / 100) * 200;
                const cy = (m.y / 100) * 400;

                return (
                  <g key={idx} className="cursor-pointer group">
                    {/* Halo de pulso */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={7 + m.intensity * 0.5}
                      fill={conf.bg}
                      opacity="0.3"
                      className="animate-pulse"
                    />
                    {/* Ponto Central */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={conf.bg}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    {/* Rótulo de Intensidade */}
                    <text
                      x={cx}
                      y={cy - 8}
                      fontSize="9"
                      fontWeight="bold"
                      fill="#1E293B"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {m.intensity}/10
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ======================================================== */}
        {/* LISTA E EDIÇÃO DE PONTOS MARCADOS */}
        {/* ======================================================== */}
        <div className="md:col-span-5 space-y-3">
          {!readOnly && (
            <div className="p-3 bg-slate-50 border rounded-xl space-y-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Configurar Ponto Antes de Clicar:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-slate-600">Intensidade (0 a 10):</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="range"
                      min="0"
                      max="10"
                      value={selectedIntensity}
                      onChange={(e) => setSelectedIntensity(Number(e.target.value))}
                      className="h-8 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800 w-5">
                      {selectedIntensity}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] text-slate-600">Lateralidade:</Label>
                  <select
                    value={selectedSide}
                    onChange={(e) => setSelectedSide(e.target.value as any)}
                    className="w-full h-8 px-2 mt-1 rounded border border-slate-200 text-xs bg-white"
                  >
                    <option value="center">Central</option>
                    <option value="left">Esquerdo</option>
                    <option value="right">Direito</option>
                    <option value="bilateral">Bilateral</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-slate-600">Observação rápida:</Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Irradiação para fossa poplítea..."
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>
          )}

          {/* Relação de Achados Registrados nesta Sessão */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pontos Mapeados ({markings.length})
              </span>
              {markings.length > 0 && !readOnly && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-[11px] text-red-600 hover:underline"
                >
                  Limpar todos
                </button>
              )}
            </div>

            {markings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-white border border-dashed rounded-xl">
                Nenhum ponto registrado no mapa corporal.
                {!readOnly && " Clique sobre o corpo acima para registrar algias e tensões."}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {markings.map((m, idx) => {
                  const conf = kindColors[m.kind] || kindColors.dor;
                  return (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: conf.bg }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">
                              {conf.label}
                            </span>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                              {m.view === "front" ? "Frente" : "Costas"}
                            </span>
                            <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold">
                              EVA {m.intensity}/10
                            </span>
                          </div>
                          {m.note && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {m.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMarking(idx)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
