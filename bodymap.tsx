"use client";
// Mapa corporal interativo (frente/costas) - AgendaZen. Silhueta SVG simplificada: substitua por arte anatômica final.
import { useState } from "react";
export type Marking = { id: string; view: "front" | "back"; x: number; y: number; kind: string; intensity: number; note?: string };
const KINDS: Record<string, string> = { dor: "#E5484D", contratura: "#E0A96D", edema: "#3E8EDE", limitacao: "#8E4EC6", lesao: "#0F4C5C" };
const BODY = "M50 4c6 0 9 4 9 10s-3 10-9 10-9-4-9-10 3-10 9-10zm-14 24h28l10 8 6 42-8 2-6-28v34l4 46h-10l-4-40-3 40H46l-3-40-4 40H29l4-46V52l-6 28-8-2 6-42z";
export default function BodyMap({ value, onChange, readOnly }: { value: Marking[]; onChange?: (m: Marking[]) => void; readOnly?: boolean }) {
  const [view, setView] = useState<"front" | "back">("front");
  const [kind, setKind] = useState("dor");
  const [intensity, setIntensity] = useState(5);
  function add(e: React.MouseEvent<SVGSVGElement>) {
    if (readOnly || !onChange) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
    onChange([...value, { id: crypto.randomUUID(), view, x, y, kind, intensity }]);
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["front", "back"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-3 py-1 rounded ${view === v ? "bg-[#0F4C5C] text-white" : "bg-slate-100"}`}>{v === "front" ? "Frente" : "Costas"}</button>
        ))}
        <select value={kind} onChange={e => setKind(e.target.value)} className="border rounded px-2">{Object.keys(KINDS).map(k => <option key={k}>{k}</option>)}</select>
        <input type="range" min={0} max={10} value={intensity} onChange={e => setIntensity(+e.target.value)} /> <span>{intensity}/10</span>
      </div>
      <svg viewBox="0 0 100 150" className="w-72 border rounded bg-white cursor-crosshair" onClick={add}>
        <path d={BODY} fill="#EEF4F4" stroke="#0F4C5C" strokeWidth={0.6} />
        {value.filter(m => m.view === view).map(m => (
          <g key={m.id} onClick={ev => { ev.stopPropagation(); if (!readOnly) onChange?.(value.filter(x => x.id !== m.id)); }}>
            <circle cx={m.x} cy={(m.y / 100) * 150} r={2 + m.intensity * 0.3} fill={KINDS[m.kind]} fillOpacity={0.75} />
          </g>
        ))}
      </svg>
      <p className="text-xs text-slate-500">Toque para marcar. Toque em uma marcação para remover. Para acupuntura, use a mesma base com a tabela acupuncture_points (x/y).</p>
    </div>
  );
}