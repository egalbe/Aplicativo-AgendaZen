"use client";

import React, { useState } from "react";
import { SessionPointInput } from "@/lib/validations/medical-record";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Search,
  Plus,
  Trash2,
  Bookmark,
  Clock,
  Zap,
  Info,
  Check,
} from "lucide-react";

interface Props {
  allPoints: any[]; // Catálogo de 361 pontos
  protocols: any[]; // Protocolos salvos da clínica
  selectedPoints: SessionPointInput[];
  onChange: (points: SessionPointInput[]) => void;
  onSaveProtocol?: (name: string, description: string, pointCodes: string[]) => void;
  readOnly?: boolean;
}

export default function AcupunctureSelector({
  allPoints,
  protocols,
  selectedPoints,
  onChange,
  onSaveProtocol,
  readOnly = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedMeridian, setSelectedMeridian] = useState<string>("all");
  const [protocolName, setProtocolName] = useState("");
  const [protocolDesc, setProtocolDesc] = useState("");
  const [savingProtocol, setSavingProtocol] = useState(false);

  // Lista de Meridianos Principais
  const meridians = [
    "Pulmão",
    "Intestino Grosso",
    "Estômago",
    "Baço-Pâncreas",
    "Coração",
    "Intestino Delgado",
    "Bexiga",
    "Rim",
    "Pericárdio",
    "Triplo Aquecedor",
    "Vesícula Biliar",
    "Fígado",
    "Vaso Governador",
    "Vaso Concepção",
    "Pontos Extras",
  ];

  // Filtro de pontos
  const filteredPoints = allPoints.filter((pt) => {
    const matchesSearch =
      pt.code.toLowerCase().includes(search.toLowerCase()) ||
      (pt.pinyin && pt.pinyin.toLowerCase().includes(search.toLowerCase())) ||
      (pt.name_pt && pt.name_pt.toLowerCase().includes(search.toLowerCase())) ||
      (pt.point_type && pt.point_type.toLowerCase().includes(search.toLowerCase()));

    const matchesMeridian =
      selectedMeridian === "all" || pt.meridian === selectedMeridian;

    return matchesSearch && matchesMeridian;
  });

  // Adicionar ponto
  function handleAddPoint(pointCode: string) {
    if (readOnly) return;
    if (selectedPoints.some((p) => p.pointCode === pointCode)) return;

    const newPoint: SessionPointInput = {
      pointCode,
      side: "bilateral",
      technique: "agulha",
      retentionMin: 20,
      depth: "0.5 a 1.0 tsun",
      note: "",
    };

    onChange([...selectedPoints, newPoint]);
  }

  // Remover ponto
  function handleRemovePoint(index: number) {
    if (readOnly) return;
    onChange(selectedPoints.filter((_, i) => i !== index));
  }

  // Atualizar propriedade do ponto
  function handleUpdatePoint(index: number, field: keyof SessionPointInput, val: any) {
    if (readOnly) return;
    const updated = [...selectedPoints];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  }

  // Aplicar protocolo pronto
  function handleApplyProtocol(pointCodes: string[]) {
    if (readOnly) return;
    const newPoints = pointCodes
      .filter((code) => !selectedPoints.some((p) => p.pointCode === code))
      .map((code) => ({
        pointCode: code,
        side: "bilateral" as const,
        technique: "agulha" as const,
        retentionMin: 20,
        depth: "0.5 a 1.0 tsun",
        note: "Protocolo clínico aplicado",
      }));

    onChange([...selectedPoints, ...newPoints]);
  }

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* 1. PROTOCOLOS RÁPIDOS DA CLÍNICA */}
      {/* ======================================================== */}
      {!readOnly && protocols.length > 0 && (
        <div className="p-3 bg-brand-surface border border-brand-dark/15 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark uppercase tracking-wider">
            <Bookmark className="h-3.5 w-3.5 text-brand-light" />
            Fórmulas e Protocolos Salvos da Clínica:
          </div>
          <div className="flex flex-wrap gap-2">
            {protocols.map((proto) => (
              <button
                key={proto.id}
                type="button"
                onClick={() => handleApplyProtocol(proto.point_codes)}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>{proto.name}</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">
                  {proto.point_codes.length} pts
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ======================================================== */}
        {/* COLUNA ESQUERDA: PONTOS ESCOLHIDOS NESTA SESSÃO */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-brand-dark" />
              Prescrição de Pontos Aplicados ({selectedPoints.length})
            </span>
            {selectedPoints.length > 0 && !readOnly && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-red-600 hover:underline"
              >
                Limpar todos
              </button>
            )}
          </div>

          {selectedPoints.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white border border-dashed rounded-xl">
              Nenhum ponto prescrito para esta sessão.
              {!readOnly && " Selecione pontos no catálogo ao lado ou aplique uma fórmula pronta."}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {selectedPoints.map((item, index) => {
                const info = allPoints.find((p) => p.code === item.pointCode);

                return (
                  <div
                    key={index}
                    className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-sm"
                  >
                    {/* Linha de Identificação do Ponto */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-12 rounded bg-brand-dark text-white font-mono font-bold text-xs flex items-center justify-center">
                          {item.pointCode}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {info?.pinyin || item.pointCode} ({info?.name_pt || "Acuponto"})
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Meridiano do {info?.meridian || "Acupuntura"}
                            {info?.point_type ? ` • ${info.point_type}` : ""}
                          </span>
                        </div>
                      </div>

                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemovePoint(index)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Controles Clínicos: Lateralidade, Técnica e Tempo */}
                    {!readOnly && (
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                        <div>
                          <Label className="text-[10px] text-slate-500">Lateralidade:</Label>
                          <select
                            value={item.side}
                            onChange={(e) => handleUpdatePoint(index, "side", e.target.value)}
                            className="w-full h-7 px-1.5 rounded border border-slate-200 bg-slate-50 text-[11px]"
                          >
                            <option value="bilateral">Bilateral</option>
                            <option value="left">Esquerdo</option>
                            <option value="right">Direito</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-[10px] text-slate-500">Técnica:</Label>
                          <select
                            value={item.technique}
                            onChange={(e) => handleUpdatePoint(index, "technique", e.target.value)}
                            className="w-full h-7 px-1.5 rounded border border-slate-200 bg-slate-50 text-[11px]"
                          >
                            <option value="agulha">Agulha Sistêmica</option>
                            <option value="moxa">Moxabustão</option>
                            <option value="ventosa">Ventosa</option>
                            <option value="eletro">Eletroacupuntura</option>
                            <option value="laser">Laserterapia</option>
                            <option value="auriculo">Auriculoterapia</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-[10px] text-slate-500">Tempo (min):</Label>
                          <Input
                            type="number"
                            value={item.retentionMin}
                            onChange={(e) =>
                              handleUpdatePoint(index, "retentionMin", Number(e.target.value))
                            }
                            className="h-7 text-[11px] bg-slate-50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Salvar seleção atual como Novo Protocolo da Clínica */}
          {!readOnly && selectedPoints.length >= 2 && onSaveProtocol && (
            <div className="p-3 bg-slate-50 border rounded-xl space-y-2 mt-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                Salvar esta combinação de {selectedPoints.length} pontos como fórmula:
              </span>
              <div className="flex gap-2">
                <Input
                  value={protocolName}
                  onChange={(e) => setProtocolName(e.target.value)}
                  placeholder="Nome do protocolo (ex: Ansiedade e Insônia)"
                  className="h-8 text-xs bg-white"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!protocolName}
                  onClick={() => {
                    const codes = selectedPoints.map((p) => p.pointCode);
                    onSaveProtocol(protocolName, protocolDesc, codes);
                    setProtocolName("");
                  }}
                  className="h-8 text-xs bg-brand-dark hover:bg-brand-primary text-white shrink-0"
                >
                  Salvar Fórmula
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* COLUNA DIREITA: CATÁLOGO DE PONTOS COM BUSCA INTELIGENTE */}
        {/* ======================================================== */}
        {!readOnly && (
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Catálogo de Pontos
            </span>

            {/* Barra de Pesquisa */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código (E36, IG4), nome ou indicação..."
                className="pl-8 text-xs h-9 bg-white"
              />
            </div>

            {/* Seletor de Meridianos */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedMeridian("all")}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap border transition-all ${
                  selectedMeridian === "all"
                    ? "bg-brand-dark text-white border-brand-dark font-bold"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Todos
              </button>
              {meridians.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMeridian(m)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap border transition-all ${
                    selectedMeridian === m
                      ? "bg-brand-dark text-white border-brand-dark font-bold"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Lista dos Pontos Filtrados */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredPoints.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Nenhum ponto encontrado com esse filtro.
                </div>
              ) : (
                filteredPoints.slice(0, 30).map((pt) => {
                  const isAlreadySelected = selectedPoints.some(
                    (p) => p.pointCode === pt.code
                  );

                  return (
                    <div
                      key={pt.code}
                      onClick={() => !isAlreadySelected && handleAddPoint(pt.code)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                        isAlreadySelected
                          ? "bg-emerald-50 border-emerald-300 opacity-60 cursor-default"
                          : "bg-white border-slate-200 hover:border-brand-dark/40 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-brand-dark text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                            {pt.code}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {pt.pinyin}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({pt.name_pt})
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {pt.location}
                        </p>
                      </div>

                      {isAlreadySelected ? (
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Plus className="h-4 w-4 text-slate-400 shrink-0 hover:text-brand-dark" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
