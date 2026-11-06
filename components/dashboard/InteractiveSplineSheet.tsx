"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Info } from "lucide-react";
import {
  BiomarkerMetricKey,
  WearableBiomarkerDescriptor,
  WearableDailyMetric,
} from "@/lib/types/sattva";
import {
  APPLE_SPRING_SHEET,
  formatDateEs,
  formatShortDateEs,
} from "@/lib/utils";

interface InteractiveSplineSheetProps {
  descriptor: WearableBiomarkerDescriptor | null;
  series: WearableDailyMetric[];
  onClose: () => void;
}

function extractValue(item: WearableDailyMetric, key: BiomarkerMetricKey): number {
  switch (key) {
    case "resting_hr":
      return item.restingHr;
    case "hrv_rmssd":
      return item.hrvRmssd;
    case "sleep_hours":
      return item.sleepHours;
    case "spo2":
      return item.spo2;
    case "temp_variation":
      return item.tempVariation;
    case "steps":
      return item.steps;
  }
}

export function InteractiveSplineSheet({
  descriptor,
  series,
  onClose,
}: InteractiveSplineSheetProps) {
  const [windowDays, setWindowDays] = useState<30 | 90>(30);
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const filteredSeries = useMemo(() => {
    if (!descriptor) return [];
    return series.slice(-windowDays);
  }, [descriptor, series, windowDays]);

  const pointsData = useMemo(() => {
    if (!descriptor || filteredSeries.length === 0) return [];
    return filteredSeries.map((d) => ({
      date: d.date,
      value: extractValue(d, descriptor.key),
    }));
  }, [descriptor, filteredSeries]);

  if (!descriptor) return null;

  const activeIndex =
    scrubIndex !== null && scrubIndex < pointsData.length
      ? scrubIndex
      : pointsData.length - 1;
  const activePoint = pointsData[activeIndex] || {
    date: "",
    value: descriptor.personalBaseline,
  };

  const values = pointsData.map((p) => p.value);
  const rawMin = Math.min(...values, descriptor.personalRange[0]);
  const rawMax = Math.max(...values, descriptor.personalRange[1]);
  const padding = (rawMax - rawMin) * 0.18 || 1;
  const minVal = rawMin - padding;
  const maxVal = rawMax + padding;

  const width = 760;
  const height = 250;
  const chartLeft = 16;
  const chartRight = width - 16;
  const chartTop = 20;
  const chartBottom = height - 28;
  const usableWidth = chartRight - chartLeft;
  const usableHeight = chartBottom - chartTop;

  const toX = (idx: number) =>
    chartLeft +
    (pointsData.length > 1
      ? (idx / (pointsData.length - 1)) * usableWidth
      : usableWidth / 2);

  const toY = (val: number) =>
    chartBottom - ((val - minVal) / (maxVal - minVal || 1)) * usableHeight;

  // Build smooth SVG path
  const coordinates = pointsData.map((p, idx) => ({
    x: toX(idx),
    y: toY(p.value),
  }));

  const linePath = coordinates.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) * 0.45;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) * 0.55;
    const cy2 = pt.y;
    return `${acc} C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(
      1
    )},${cy2.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }, "");

  const areaPath =
    coordinates.length > 0
      ? `${linePath} L ${coordinates[coordinates.length - 1].x.toFixed(
          1
        )},${chartBottom} L ${coordinates[0].x.toFixed(1)},${chartBottom} Z`
      : "";

  const baselineY = toY(descriptor.personalBaseline);
  const bandTopY = toY(descriptor.personalRange[1]);
  const bandBottomY = toY(descriptor.personalRange[0]);

  // 1:1 Pointer scrubbing per Apple Fluid Interfaces skill
  const updateScrubFromPointer = (clientX: number) => {
    if (!svgRef.current || pointsData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(relX * (pointsData.length - 1));
    setScrubIndex(idx);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateScrubFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons > 0 || e.pointerType === "mouse") {
      updateScrubFromPointer(e.clientX);
    }
  };

  const avgPeriod =
    values.reduce((acc, v) => acc + v, 0) / (values.length || 1);
  const deltaFromBaseline = activePoint.value - descriptor.personalBaseline;
  const formattedDelta =
    descriptor.key === "steps"
      ? `${deltaFromBaseline >= 0 ? "+" : ""}${Math.round(deltaFromBaseline)}`
      : `${deltaFromBaseline >= 0 ? "+" : ""}${deltaFromBaseline.toFixed(1)}`;

  const activeCoord = coordinates[activeIndex] || { x: 0, y: 0 };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="spline-sheet-title"
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={APPLE_SPRING_SHEET}
          onClick={(e) => e.stopPropagation()}
          className="apple-material-elevated w-full max-w-3xl rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden"
        >
          {/* Sheet Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="spline-sheet-title"
                className="text-2xl font-semibold text-white tracking-tight"
              >
                {descriptor.label}
              </h2>
              <p className="mt-1 text-xs text-zinc-300">
                Corredor fisiológico personal: {descriptor.personalRange[0]} –{" "}
                {descriptor.personalRange[1]} {descriptor.unit} · Rango
                poblacional estándar: {descriptor.populationRange[0]} –{" "}
                {descriptor.populationRange[1]} {descriptor.unit}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar evolución de biomarcador"
              className="tactile-press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-zinc-300 hover:bg-white/[0.15] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Live Scrubbed Readout + Time Window Selector */}
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <div className="text-xs text-zinc-400">
                {activePoint.date ? formatDateEs(activePoint.date) : "Hoy"}
              </div>
              <div className="mt-1 flex items-baseline gap-2.5">
                <span className="font-mono text-4xl font-semibold text-white tabular-nums tracking-tight">
                  {descriptor.key === "steps"
                    ? activePoint.value.toLocaleString("es-CL")
                    : activePoint.value}
                </span>
                <span className="text-sm font-medium text-zinc-300">
                  {descriptor.unit}
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums"
                  style={{
                    backgroundColor: `${descriptor.accentHex}20`,
                    color: descriptor.accentHex,
                  }}
                >
                  {deltaFromBaseline >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formattedDelta} {descriptor.unit} vs línea base (
                  {descriptor.personalBaseline})
                </span>
              </div>
            </div>

            {/* Segmented Control (30d / 90d) */}
            <div className="inline-flex rounded-xl bg-zinc-900/90 p-1 border border-white/[0.08]">
              {([30, 90] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    setWindowDays(days);
                    setScrubIndex(null);
                  }}
                  className={`tactile-press rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    windowDays === days
                      ? "bg-white text-black"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {days} días
                </button>
              ))}
            </div>
          </div>

          {/* 1:1 Pointer-Scrubbable Spline Chart */}
          <div className="mt-5 relative select-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-60 overflow-visible cursor-crosshair touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setScrubIndex(null)}
            >
              <defs>
                <linearGradient
                  id={`spline-fill-${descriptor.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={descriptor.accentHex}
                    stopOpacity={0.36}
                  />
                  <stop
                    offset="100%"
                    stopColor={descriptor.accentHex}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>

              {/* Personal Baseline Corridor Band */}
              <rect
                x={chartLeft}
                y={Math.min(bandTopY, bandBottomY)}
                width={usableWidth}
                height={Math.abs(bandBottomY - bandTopY)}
                fill="rgba(255, 255, 255, 0.04)"
                rx={6}
              />

              {/* Personal Baseline Dashed Line */}
              <line
                x1={chartLeft}
                y1={baselineY}
                x2={chartRight}
                y2={baselineY}
                stroke="rgba(255, 255, 255, 0.28)"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={chartRight - 6}
                y={baselineY - 6}
                textAnchor="end"
                fill="rgba(255, 255, 255, 0.55)"
                fontSize="10"
                fontFamily="monospace"
              >
                Línea base personal ({descriptor.personalBaseline}{" "}
                {descriptor.unit})
              </text>

              {/* Gradient Area Fill */}
              <path
                d={areaPath}
                fill={`url(#spline-fill-${descriptor.key})`}
              />

              {/* Main Spline Curve */}
              <path
                d={linePath}
                fill="none"
                stroke={descriptor.accentHex}
                strokeWidth={2.5}
                strokeLinecap="round"
              />

              {/* Active Scrubber Vertical Guide & Point */}
              <line
                x1={activeCoord.x}
                y1={chartTop}
                x2={activeCoord.x}
                y2={chartBottom}
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth={1}
              />
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r={6}
                fill={descriptor.accentHex}
                stroke="#000000"
                strokeWidth={2}
              />

              {/* X-Axis Labels */}
              {[0, Math.floor((pointsData.length - 1) / 2), pointsData.length - 1].map(
                (idx) => {
                  const pt = pointsData[idx];
                  if (!pt) return null;
                  return (
                    <text
                      key={idx}
                      x={toX(idx)}
                      y={height - 6}
                      textAnchor={
                        idx === 0
                          ? "start"
                          : idx === pointsData.length - 1
                          ? "end"
                          : "middle"
                      }
                      fill="#a1a1aa"
                      fontSize="11"
                      fontFamily="monospace"
                    >
                      {formatShortDateEs(pt.date)}
                    </text>
                  );
                }
              )}
            </svg>
          </div>

          {/* Summary Stats & Clinical Context */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
            <div>
              <div className="text-xs text-zinc-400">
                Promedio ({windowDays} días)
              </div>
              <div className="mt-0.5 font-mono text-lg font-semibold text-white tabular-nums">
                {descriptor.key === "steps"
                  ? Math.round(avgPeriod).toLocaleString("es-CL")
                  : avgPeriod.toFixed(1)}{" "}
                <span className="text-xs font-normal text-zinc-400">
                  {descriptor.unit}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-400">Línea Base Paciente 0</div>
              <div className="mt-0.5 font-mono text-lg font-semibold text-emerald-400 tabular-nums">
                {descriptor.key === "steps"
                  ? descriptor.personalBaseline.toLocaleString("es-CL")
                  : descriptor.personalBaseline}{" "}
                <span className="text-xs font-normal text-zinc-400">
                  {descriptor.unit}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-400">Rango Óptimo Personal</div>
              <div className="mt-0.5 font-mono text-lg font-semibold text-zinc-200 tabular-nums">
                {descriptor.personalRange[0]} – {descriptor.personalRange[1]}{" "}
                <span className="text-xs font-normal text-zinc-400">
                  {descriptor.unit}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white/[0.04] p-4 text-xs text-zinc-300 leading-relaxed">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
            <p>{descriptor.clinicalInterpretation}</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
