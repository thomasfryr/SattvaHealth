"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, ShieldAlert, Moon, ArrowUpRight } from "lucide-react";
import {
  BiomarkerMetricKey,
  WearableDailyMetric,
} from "@/lib/types/sattva";
import { APPLE_SPRING_DEFAULT } from "@/lib/utils";

interface VitalTriadRingsProps {
  metric: WearableDailyMetric;
  series30d: WearableDailyMetric[];
  onSelectMetric: (key: BiomarkerMetricKey) => void;
}

interface CircleGaugeProps {
  title: string;
  subtitle: string;
  displayValue: string;
  unitLabel: string;
  percentage: number;
  strokeColor: string;
  trackColor: string;
  baselineDeltaText: string;
  detailLine: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function VitalCircleGauge({
  title,
  subtitle,
  displayValue,
  unitLabel,
  percentage,
  strokeColor,
  trackColor,
  baselineDeltaText,
  detailLine,
  icon,
  onClick,
}: CircleGaugeProps) {
  const size = 168;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(4, percentage));
  const strokeDashoffset =
    circumference - (clampedPct / 100) * circumference;

  return (
    <button
      type="button"
      onClick={onClick}
      className="tactile-press group relative flex flex-col items-center text-left w-full rounded-3xl p-6 transition-colors hover:bg-white/[0.03] focus:outline-none"
    >
      {/* Top Row: Label + Action Hint */}
      <div className="flex w-full items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08]"
            style={{ backgroundColor: trackColor, color: strokeColor }}
          >
            {icon}
          </span>
          <div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="text-xs text-zinc-400">{subtitle}</p>
          </div>
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.05] text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {/* Circular Gauge SVG */}
      <div className="relative my-2 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 transform"
          aria-label={`${title}: ${displayValue} ${unitLabel}`}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Animated Progress Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ ...APPLE_SPRING_DEFAULT, duration: 0.7 }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-3xl font-semibold text-white tabular-nums tracking-tight">
            {displayValue}
          </span>
          <span className="mt-0.5 text-xs font-medium text-zinc-300">
            {unitLabel}
          </span>
        </div>
      </div>

      {/* Bottom Context */}
      <div className="mt-4 w-full pt-3.5 border-t border-white/[0.07] flex items-center justify-between text-xs">
        <span className="text-zinc-300 font-medium">{detailLine}</span>
        <span
          className="font-mono font-medium tabular-nums"
          style={{ color: strokeColor }}
        >
          {baselineDeltaText}
        </span>
      </div>
    </button>
  );
}

export function VitalTriadRings({
  metric,
  series30d,
  onSelectMetric,
}: VitalTriadRingsProps) {
  const avgStrain =
    series30d.reduce((acc, d) => acc + d.strainScore, 0) /
    (series30d.length || 1);
  const avgRecovery =
    series30d.reduce((acc, d) => acc + d.recoveryScore, 0) /
    (series30d.length || 1);
  const avgSleep =
    series30d.reduce((acc, d) => acc + d.sleepScore, 0) /
    (series30d.length || 1);

  const strainDelta = metric.strainScore - avgStrain;
  const recoveryDelta = Math.round(metric.recoveryScore - avgRecovery);
  const sleepDelta = Math.round(metric.sleepScore - avgSleep);

  return (
    <section
      aria-label="Tríada Vital del Wearable"
      className="apple-material rounded-3xl p-3 sm:p-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
        {/* 1. STRAIN CIRCLE */}
        <VitalCircleGauge
          title="Strain"
          subtitle="Carga Cardiovascular"
          displayValue={metric.strainScore.toFixed(1)}
          unitLabel="de 21.0 máx"
          percentage={(metric.strainScore / 21) * 100}
          strokeColor="#FF2D55"
          trackColor="rgba(255, 45, 85, 0.14)"
          baselineDeltaText={`${strainDelta >= 0 ? "+" : ""}${strainDelta.toFixed(
            1
          )} vs 30d`}
          detailLine={`${metric.activeCalories.toLocaleString("es-CL")} kcal activas`}
          icon={<Flame className="h-4 w-4" />}
          onClick={() => onSelectMetric("resting_hr")}
        />

        {/* 2. RECOVERY CIRCLE */}
        <VitalCircleGauge
          title="Recovery"
          subtitle="Disponibilidad Autonómica"
          displayValue={`${metric.recoveryScore}%`}
          unitLabel="tono vagal óptimo"
          percentage={metric.recoveryScore}
          strokeColor="#34C759"
          trackColor="rgba(52, 199, 89, 0.14)"
          baselineDeltaText={`${
            recoveryDelta >= 0 ? "+" : ""
          }${recoveryDelta}% vs 30d`}
          detailLine={`VFC ${metric.hrvRmssd} ms · FC ${metric.restingHr} lpm`}
          icon={<ShieldAlert className="h-4 w-4" />}
          onClick={() => onSelectMetric("hrv_rmssd")}
        />

        {/* 3. SLEEP CIRCLE */}
        <VitalCircleGauge
          title="Sleep"
          subtitle="Eficiencia & Arquitectura"
          displayValue={`${metric.sleepScore}%`}
          unitLabel={`${metric.sleepHours} hrs totales`}
          percentage={metric.sleepScore}
          strokeColor="#AF52DE"
          trackColor="rgba(175, 82, 222, 0.15)"
          baselineDeltaText={`${sleepDelta >= 0 ? "+" : ""}${sleepDelta}% vs 30d`}
          detailLine={`Profundo ${metric.deepSleepPct}% · REM ${metric.remSleepPct}%`}
          icon={<Moon className="h-4 w-4" />}
          onClick={() => onSelectMetric("sleep_hours")}
        />
      </div>
    </section>
  );
}
