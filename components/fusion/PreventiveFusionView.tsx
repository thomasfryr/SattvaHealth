"use client";

import React, { useState, useRef } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  GitCompareArrows,
  Activity,
  FlaskConical,
  ArrowRight,
} from "lucide-react";
import { useSattva } from "@/lib/context/sattva-context";
import { formatDateEs, formatShortDateEs } from "@/lib/utils";

type FusionWearableStream = "hrv_rmssd" | "resting_hr" | "sleep_hours";

export function PreventiveFusionView() {
  const { wearableSeries, clinicalDocuments, correlations } = useSattva();
  const [activeStream, setActiveStream] =
    useState<FusionWearableStream>("hrv_rmssd");
  const [scrubIdx, setScrubIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const series90 = wearableSeries.slice(-90);
  const streamMeta: Record<
    FusionWearableStream,
    { label: string; unit: string; color: string; baseline: number }
  > = {
    hrv_rmssd: {
      label: "VFC Nocturna (RMSSD)",
      unit: "ms",
      color: "#FF9500",
      baseline: 76.4,
    },
    resting_hr: {
      label: "FC en Reposo",
      unit: "lpm",
      color: "#FF2D55",
      baseline: 53.8,
    },
    sleep_hours: {
      label: "Sueño Total",
      unit: "hrs",
      color: "#AF52DE",
      baseline: 7.6,
    },
  };

  const currentMeta = streamMeta[activeStream];

  const values = series90.map((d) =>
    activeStream === "hrv_rmssd"
      ? d.hrvRmssd
      : activeStream === "resting_hr"
      ? d.restingHr
      : d.sleepHours
  );

  const minV = Math.min(...values) * 0.94;
  const maxV = Math.max(...values) * 1.06;

  const width = 880;
  const height = 270;
  const left = 24;
  const right = width - 24;
  const top = 28;
  const bottom = height - 48;
  const usableW = right - left;
  const usableH = bottom - top;

  const toX = (i: number) =>
    left + (series90.length > 1 ? (i / (series90.length - 1)) * usableW : 0);
  const toY = (v: number) =>
    bottom - ((v - minV) / (maxV - minV || 1)) * usableH;

  const points = values.map((v, i) => ({ x: toX(i), y: toY(v) }));
  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) * 0.45;
    const cx2 = prev.x + (pt.x - prev.x) * 0.55;
    return `${acc} C ${cx1.toFixed(1)},${prev.y.toFixed(1)} ${cx2.toFixed(
      1
    )},${pt.y.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }, "");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(
          1
        )},${bottom} L ${points[0].x.toFixed(1)},${bottom} Z`
      : "";

  const baselineY = toY(currentMeta.baseline);

  // Locate clinical documents falling within or near the 90-day window
  const clinicalPins = clinicalDocuments
    .map((doc) => {
      const idx = series90.findIndex((d) => d.date === doc.documentDate);
      return idx >= 0 ? { doc, idx, x: toX(idx) } : null;
    })
    .filter(
      (
        item
      ): item is {
        doc: (typeof clinicalDocuments)[number];
        idx: number;
        x: number;
      } => item !== null
    );

  const selectedIndex =
    scrubIdx !== null && scrubIdx < series90.length
      ? scrubIdx
      : series90.length - 1;
  const activeDay = series90[selectedIndex];
  const activeVal = values[selectedIndex];
  const activePt = points[selectedIndex] || { x: 0, y: 0 };

  const handlePointer = (clientX: number) => {
    if (!svgRef.current || series90.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rel = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setScrubIdx(Math.round(rel * (series90.length - 1)));
  };

  return (
    <div className="space-y-8">
      {/* Header & Stream Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Fusión Longitudinal: Wearable × Clínica
          </h2>
          <p className="mt-1 text-sm text-zinc-300 max-w-2xl">
            Cruza tu película continua de signos vitales con las fotografías de
            alta definición de tus exámenes clínicos para detectar desviaciones
            antes de que existan síntomas.
          </p>
        </div>

        {/* Stream Selector */}
        <div className="inline-flex rounded-2xl bg-zinc-900/90 p-1 border border-white/[0.08] self-start">
          {(
            [
              { key: "hrv_rmssd", label: "VFC (HRV)" },
              { key: "resting_hr", label: "FC Reposo" },
              { key: "sleep_hours", label: "Sueño" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveStream(item.key)}
              className={`tactile-press rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeStream === item.key
                  ? "bg-white text-black"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Synchronized Dual Timeline Surface */}
      <section className="apple-material rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="text-xs text-zinc-400">
              Lectura sincronizada ·{" "}
              {activeDay ? formatDateEs(activeDay.date) : "Hoy"}
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span
                className="font-mono text-3xl font-semibold tabular-nums"
                style={{ color: currentMeta.color }}
              >
                {activeVal} {currentMeta.unit}
              </span>
              <span className="text-xs text-zinc-300">
                {currentMeta.label} (Línea base: {currentMeta.baseline}{" "}
                {currentMeta.unit})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-zinc-300">
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: currentMeta.color }}
              />
              Serie continua wearable (90d)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              Hito de examen clínico en PDF
            </span>
          </div>
        </div>

        {/* Interactive Dual SVG */}
        <div className="mt-5 select-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-64 overflow-visible cursor-crosshair touch-none"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              handlePointer(e.clientX);
            }}
            onPointerMove={(e) => {
              if (e.buttons > 0 || e.pointerType === "mouse") {
                handlePointer(e.clientX);
              }
            }}
            onPointerLeave={() => setScrubIdx(null)}
          >
            <defs>
              <linearGradient
                id="fusion-area-grad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={currentMeta.color}
                  stopOpacity={0.32}
                />
                <stop
                  offset="100%"
                  stopColor={currentMeta.color}
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>

            {/* Highlighted Stress/Drift Window (Days 48 to 72 in the 90-day array) */}
            <rect
              x={toX(48)}
              y={top}
              width={toX(72) - toX(48)}
              height={usableH}
              fill="rgba(255, 204, 0, 0.06)"
              rx={8}
            />
            <text
              x={(toX(48) + toX(72)) / 2}
              y={top + 14}
              textAnchor="middle"
              fill="#FFCC00"
              fontSize="10"
              fontFamily="monospace"
            >
              Ventana de deuda vagal / sueño (-19% VFC)
            </text>

            {/* Personal Baseline Line */}
            <line
              x1={left}
              y1={baselineY}
              x2={right}
              y2={baselineY}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeDasharray="4 4"
            />

            {/* Wearable Area & Curve */}
            <path d={areaPath} fill="url(#fusion-area-grad)" />
            <path
              d={linePath}
              fill="none"
              stroke={currentMeta.color}
              strokeWidth={2.4}
              strokeLinecap="round"
            />

            {/* Clinical Exam Milestone Pins */}
            {clinicalPins.map(({ doc, x }) => (
              <g key={doc.id}>
                <line
                  x1={x}
                  y1={top}
                  x2={x}
                  y2={bottom + 14}
                  stroke="#32ADE6"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                />
                <circle
                  cx={x}
                  cy={bottom + 14}
                  r={6}
                  fill="#32ADE6"
                  stroke="#000"
                  strokeWidth={2}
                />
                <text
                  x={x}
                  y={bottom + 32}
                  textAnchor="middle"
                  fill="#32ADE6"
                  fontSize="10"
                  fontWeight="600"
                >
                  {formatShortDateEs(doc.documentDate)} ·{" "}
                  {doc.title.slice(0, 18)}…
                </text>
              </g>
            ))}

            {/* Active Scrubber */}
            <line
              x1={activePt.x}
              y1={top}
              x2={activePt.x}
              y2={bottom}
              stroke="rgba(255, 255, 255, 0.35)"
            />
            <circle
              cx={activePt.x}
              cy={activePt.y}
              r={5.5}
              fill={currentMeta.color}
              stroke="#000"
              strokeWidth={2}
            />
          </svg>
        </div>
      </section>

      {/* Preventive Correlation Insights List */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          Hallazgos de Correlación Preventiva (Paciente 0)
        </h3>

        <div className="apple-material rounded-3xl divide-y divide-white/[0.08]">
          {correlations.map((item) => {
            const isWarning = item.severity !== "optimal";
            return (
              <article key={item.id} className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {isWarning ? (
                      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    )}
                    <h4 className="text-lg font-semibold text-white">
                      {item.title}
                    </h4>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 font-mono text-xs font-medium tabular-nums ${
                      isWarning
                        ? "bg-amber-500/[0.15] text-amber-300"
                        : "bg-emerald-500/[0.14] text-emerald-300"
                    }`}
                  >
                    {item.clinicalSignal.zScore}
                  </span>
                </div>

                {/* Crossed Signals Row */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                  <div className="md:col-span-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                      <Activity className="h-3.5 w-3.5" />
                      <span>Señal Continua (Wearable · {item.wearableSignal.window})</span>
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-white">
                      {item.wearableSignal.metric}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-zinc-300 tabular-nums">
                      {item.wearableSignal.change}
                    </div>
                  </div>

                  <div className="md:col-span-1 flex justify-center">
                    <GitCompareArrows className="h-5 w-5 text-zinc-500" />
                  </div>

                  <div className="md:col-span-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
                      <FlaskConical className="h-3.5 w-3.5" />
                      <span>Impacto Bioquímico en Sangre</span>
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-white">
                      {item.clinicalSignal.biomarker}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-zinc-300 tabular-nums">
                      Línea base personal: {item.clinicalSignal.personalBaseline}
                    </div>
                  </div>
                </div>

                {/* Mechanism & Action */}
                <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
                  {item.mechanismExplanation}
                </p>

                <div className="mt-4 flex items-start gap-2.5 text-xs font-medium text-emerald-300">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Protocolo Preventivo Sugerido: {item.preventiveAction}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
