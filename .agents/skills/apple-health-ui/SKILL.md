---
name: apple-health-ui
description: Reusable UI recipes, layout structures, and component code patterns following Apple Human Interface Guidelines and Apple Health aesthetics.
---

# Apple Health UI Skill & Component Patterns

Use this skill when developing frontend components, charts, and screens for SattvaHealth.

## 1. Metric Hero Card (e.g. Frecuencia Cardíaca / VFC / Glucosa)

```tsx
import React from "react";
import { Activity, TrendingDown } from "lucide-react";

interface HealthMetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  statusText: string;
  statusType?: "positive" | "warning" | "alert" | "neutral";
  categoryColor: "rose" | "amber" | "purple" | "emerald" | "cyan";
  icon: React.ReactNode;
}

export function HealthMetricCard({
  title,
  value,
  unit,
  statusText,
  statusType = "positive",
  categoryColor,
  icon,
}: HealthMetricCardProps) {
  const colorMap = {
    rose: { bg: "bg-rose-500/10", text: "text-rose-500", glow: "hover:border-rose-500/30" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-500", glow: "hover:border-amber-500/30" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", glow: "hover:border-purple-500/30" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "hover:border-emerald-500/30" },
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", glow: "hover:border-cyan-500/30" },
  };

  const currentTheme = colorMap[categoryColor];

  return (
    <div className={`group relative p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] ${currentTheme.glow} transition-all duration-200 active:scale-[0.98] cursor-pointer`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${currentTheme.bg} ${currentTheme.text}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline space-x-1.5 my-1">
        <span className="text-3xl font-semibold tracking-tight text-white font-mono">
          {value}
        </span>
        <span className="text-sm font-medium text-zinc-400">{unit}</span>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <TrendingDown className="w-3 h-3" />
          {statusText}
        </span>
      </div>
    </div>
  );
}
```

---

## 2. Biomarker Comparison Row (Exámenes de Sangre / Lab)

```tsx
import React from "react";

interface BiomarkerRowProps {
  name: string;
  currentValue: number;
  unit: string;
  personalBaseline: number; // Su media histórica
  standardMin: number;
  standardMax: number;
  lastDate: string;
}

export function BiomarkerRow({
  name,
  currentValue,
  unit,
  personalBaseline,
  standardMin,
  standardMax,
  lastDate,
}: BiomarkerRowProps) {
  // Cálculo de posición relativa en la barra
  const range = standardMax - standardMin;
  const percentage = Math.min(Math.max(((currentValue - standardMin) / range) * 100, 0), 100);
  const baselinePercentage = Math.min(Math.max(((personalBaseline - standardMin) / range) * 100, 0), 100);
  const delta = currentValue - personalBaseline;
  const isOptimal = currentValue >= standardMin && currentValue <= standardMax;

  return (
    <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.05] hover:bg-zinc-900/70 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-medium text-white">{name}</h4>
          <p className="text-xs text-zinc-500">Último control: {lastDate}</p>
        </div>
        <div className="text-right">
          <span className="text-base font-semibold text-white font-mono">{currentValue}</span>
          <span className="text-xs text-zinc-400 ml-1">{unit}</span>
          <p className="text-[11px] text-zinc-500">
            Línea base: {personalBaseline} {unit} ({delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)})
          </p>
        </div>
      </div>

      {/* Visual range gauge */}
      <div className="relative w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
        {/* Marcador de línea base personal */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-zinc-400 z-10" 
          style={{ left: `${baselinePercentage}%` }}
          title={`Línea base: ${personalBaseline}`}
        />
        {/* Barra de progreso */}
        <div 
          className={`h-full rounded-full ${isOptimal ? "bg-emerald-500" : "bg-rose-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
        <span>Min: {standardMin}</span>
        <span>Max: {standardMax}</span>
      </div>
    </div>
  );
}
```

---

## 3. Apple Health Area Chart Configuration (Recharts)

```tsx
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export function HeartRateSplineChart({ data }: { data: any[] }) {
  return (
    <div className="w-full h-64 p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="roseGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF2D55" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#FF2D55" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            domain={["dataMin - 5", "dataMax + 5"]} 
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-2xl">
                    <p className="text-xs text-zinc-400">{payload[0].payload.time}</p>
                    <p className="text-sm font-semibold text-white font-mono">
                      {payload[0].value} <span className="text-xs font-normal text-rose-400">lpm</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="bpm"
            stroke="#FF2D55"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#roseGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```
