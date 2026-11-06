"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  Activity,
  FileSpreadsheet,
  GitCompareArrows,
  RefreshCw,
  Sliders,
  ArrowUpRight,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Watch,
  Flame,
  Moon,
  Wind,
  Thermometer,
  Footprints,
} from "lucide-react";
import { useSattva } from "@/lib/context/sattva-context";
import { WEARABLE_BIOMARKER_DESCRIPTORS } from "@/lib/data/patient-zero-engine";
import {
  BiomarkerMetricKey,
  WearableBiomarkerDescriptor,
  WearableDailyMetric,
} from "@/lib/types/sattva";
import { VitalTriadRings } from "@/components/dashboard/VitalTriadRings";
import { InteractiveSplineSheet } from "@/components/dashboard/InteractiveSplineSheet";
import { ClinicalVaultView } from "@/components/clinical/ClinicalVaultView";
import { PreventiveFusionView } from "@/components/fusion/PreventiveFusionView";
import { APPLE_SPRING_DEFAULT, formatDateEs } from "@/lib/utils";

type ActiveTab = "wearable" | "clinical" | "fusion";

function getRawMetricValue(
  metric: WearableDailyMetric,
  key: BiomarkerMetricKey
): number {
  switch (key) {
    case "resting_hr":
      return metric.restingHr;
    case "hrv_rmssd":
      return metric.hrvRmssd;
    case "sleep_hours":
      return metric.sleepHours;
    case "spo2":
      return metric.spo2;
    case "temp_variation":
      return metric.tempVariation;
    case "steps":
      return metric.steps;
  }
}

function getBiomarkerIcon(key: BiomarkerMetricKey) {
  switch (key) {
    case "resting_hr":
      return <HeartPulse className="h-4 w-4" />;
    case "hrv_rmssd":
      return <Activity className="h-4 w-4" />;
    case "sleep_hours":
      return <Moon className="h-4 w-4" />;
    case "spo2":
      return <Wind className="h-4 w-4" />;
    case "temp_variation":
      return <Thermometer className="h-4 w-4" />;
    case "steps":
      return <Footprints className="h-4 w-4" />;
  }
}

export default function SattvaDashboardPage() {
  const {
    profile,
    wearableSeries,
    latestWearable,
    clinicalDocuments,
    correlations,
    triggerWearableSync,
  } = useSattva();

  const [activeTab, setActiveTab] = useState<ActiveTab>("wearable");
  const [selectedBiomarkerKey, setSelectedBiomarkerKey] =
    useState<BiomarkerMetricKey | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncBannerText, setSyncBannerText] = useState<string | null>(null);
  const [showGuideSteps, setShowGuideSteps] = useState(true);

  const selectedDescriptor: WearableBiomarkerDescriptor | null =
    WEARABLE_BIOMARKER_DESCRIPTORS.find(
      (d) => d.key === selectedBiomarkerKey
    ) || null;

  const series30d = wearableSeries.slice(-30);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    const res = await triggerWearableSync();
    setSyncBannerText(res.message);
    setIsSyncing(false);
    setTimeout(() => setSyncBannerText(null), 5000);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-20">
      {/* Subtle Ambient Top Light */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-80 opacity-20 blur-[120px]"
        style={{
          background:
            activeTab === "wearable"
              ? "radial-gradient(circle at 50% 0%, #FF2D55 0%, #34C759 50%, transparent 80%)"
              : activeTab === "clinical"
              ? "radial-gradient(circle at 50% 0%, #32ADE6 0%, #34C759 50%, transparent 80%)"
              : "radial-gradient(circle at 50% 0%, #FF9500 0%, #AF52DE 50%, transparent 80%)",
        }}
      />

      {/* Sticky Translucent Apple Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
          {/* Brand & Patient 0 Status */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/[0.14] border border-emerald-400/30">
              <HeartPulse className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight text-white">
                  SattvaHealth
                </span>
                <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-300">
                  Paciente 0
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {profile.fullName} · {profile.age} años · {profile.weightKg} kg
                · {profile.heightCm} cm
              </p>
            </div>
          </div>

          {/* Segmented Navigation Tabs (Wearable | Clínico | Fusión) */}
          <nav
            aria-label="Secciones principales de SattvaHealth"
            className="flex items-center rounded-2xl bg-zinc-900/90 p-1 border border-white/[0.08]"
          >
            <button
              type="button"
              onClick={() => setActiveTab("wearable")}
              className={`tactile-press flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "wearable"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              <Watch className="h-3.5 w-3.5" />
              <span>Wearable</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("clinical")}
              className={`tactile-press flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "clinical"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Exámenes PDF ({clinicalDocuments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("fusion")}
              className={`tactile-press flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "fusion"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              <span>Cruce Preventivo</span>
            </button>
          </nav>

          {/* Right Actions: Sync Google Health/Fitbit & Onboarding Link */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="tactile-press inline-flex items-center gap-2 rounded-xl bg-white/[0.07] border border-white/[0.1] px-3.5 py-2 text-xs font-medium text-zinc-200 hover:bg-white/[0.12] hover:text-white"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-emerald-400 ${
                  isSyncing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">
                Google Health / Fitbit
              </span>
            </button>

            <Link
              href="/onboarding"
              className="tactile-press inline-flex items-center gap-1.5 rounded-xl bg-white/[0.07] border border-white/[0.1] px-3.5 py-2 text-xs font-medium text-zinc-200 hover:bg-white/[0.12] hover:text-white"
            >
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span>Onboarding / Perfil</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-8 sm:px-8 space-y-8">
        {/* Sync Toast Notification */}
        <AnimatePresence>
          {syncBannerText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={APPLE_SPRING_DEFAULT}
              className="rounded-2xl bg-emerald-500/[0.12] border border-emerald-400/30 px-4 py-3 text-xs font-medium text-emerald-200 flex items-center justify-between"
            >
              <span>{syncBannerText}</span>
              <button
                type="button"
                onClick={() => setSyncBannerText(null)}
                className="text-emerald-300 underline ml-4"
              >
                Cerrar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guided Step-by-Step Companion Banner */}
        {showGuideSteps && (
          <section
            aria-label="Guía paso a paso de SattvaHealth"
            className="apple-material rounded-3xl p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <Compass className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-semibold text-white">
                  Recorrido Guiado de Salud Integral (Sattva)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideSteps(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Ocultar guía
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("wearable")}
                className={`tactile-press text-left rounded-2xl p-4 border transition-all ${
                  activeTab === "wearable"
                    ? "bg-white/[0.07] border-emerald-400/40"
                    : "bg-transparent border-white/[0.06] hover:bg-white/[0.03]"
                }`}
              >
                <div className="text-xs font-semibold text-emerald-400">
                  Paso 1 · Telemetría Wearable (Esta pestaña)
                </div>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                  Revisa tus 3 círculos vitales (Strain, Recovery, Sleep) y haz
                  clic en cualquier biomarcador en bruto abajo para ver su
                  gráfico evolutivo.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("clinical")}
                className={`tactile-press text-left rounded-2xl p-4 border transition-all ${
                  activeTab === "clinical"
                    ? "bg-white/[0.07] border-cyan-400/40"
                    : "bg-transparent border-white/[0.06] hover:bg-white/[0.03]"
                }`}
              >
                <div className="text-xs font-semibold text-cyan-400">
                  Paso 2 · Bóveda Clínica en PDF (Otra pestaña)
                </div>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                  Sube tus PDFs de sangre, perfiles bioquímicos, ECG o Holter.
                  La IA tipifica cada indicador manteniendo el archivo original
                  descargable.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("fusion")}
                className={`tactile-press text-left rounded-2xl p-4 border transition-all ${
                  activeTab === "fusion"
                    ? "bg-white/[0.07] border-amber-400/40"
                    : "bg-transparent border-white/[0.06] hover:bg-white/[0.03]"
                }`}
              >
                <div className="text-xs font-semibold text-amber-400">
                  Paso 3 · Cruce Preventivo Longitudinal
                </div>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                  Analiza cómo las variaciones en tu sueño y VFC anticipan
                  cambios en tu glucosa, inflamación o perfil lipídico.
                </p>
              </button>
            </div>
          </section>
        )}

        {/* TAB 1: WEARABLE INTELLIGENCE (3 CIRCLES + RAW BIOMARKERS + CROSS PREVIEW) */}
        {activeTab === "wearable" && (
          <motion.div
            key="tab-wearable"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={APPLE_SPRING_DEFAULT}
            className="space-y-8"
          >
            {/* Section Title & Origin Distinction */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                  Estado Fisiológico Continuo
                </h1>
                <p className="mt-1.5 text-sm text-zinc-300">
                  Datos recopilados automáticamente desde tu wearable (Google
                  Health / Fitbit) · Actualizado al{" "}
                  <span className="font-mono text-white tabular-nums">
                    {formatDateEs(latestWearable.date)}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("clinical")}
                className="tactile-press inline-flex items-center gap-2 rounded-2xl bg-cyan-500/[0.12] border border-cyan-400/30 px-4 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/[0.2] self-start"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Ver información clínica y PDFs en su pestaña →</span>
              </button>
            </div>

            {/* THE 3 VITAL CIRCLES: STRAIN, RECOVERY, SLEEP */}
            <VitalTriadRings
              metric={latestWearable}
              series30d={series30d}
              onSelectMetric={(key) => setSelectedBiomarkerKey(key)}
            />

            {/* RAW BIOMARKERS MATRIX (Click any to open evolution spline chart) */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">
                    Biomarcadores en Bruto del Wearable
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Haz clic en cualquier indicador para desplegar su curva de
                    evolución histórica y línea base personal.
                  </p>
                </div>
              </div>

              <div className="apple-material rounded-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:gap-px bg-white/[0.06] overflow-hidden">
                {WEARABLE_BIOMARKER_DESCRIPTORS.map((desc) => {
                  const currentVal = getRawMetricValue(
                    latestWearable,
                    desc.key
                  );
                  const delta = currentVal - desc.personalBaseline;
                  const deltaStr =
                    desc.key === "steps"
                      ? `${delta >= 0 ? "+" : ""}${Math.round(delta)}`
                      : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}`;

                  // Mini 14-day sparkline points
                  const recent14 = wearableSeries
                    .slice(-14)
                    .map((d) => getRawMetricValue(d, desc.key));
                  const min14 = Math.min(...recent14);
                  const max14 = Math.max(...recent14);
                  const sparkPoints = recent14
                    .map((v, idx) => {
                      const x = (idx / 13) * 100;
                      const y =
                        26 - ((v - min14) / (max14 - min14 || 1)) * 20;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ");

                  return (
                    <button
                      key={desc.key}
                      type="button"
                      onClick={() => setSelectedBiomarkerKey(desc.key)}
                      className="tactile-press group bg-zinc-950/90 p-6 text-left transition-colors hover:bg-zinc-900/90 focus:outline-none flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-xl"
                            style={{
                              backgroundColor: `${desc.accentHex}1F`,
                              color: desc.accentHex,
                            }}
                          >
                            {getBiomarkerIcon(desc.key)}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {desc.shortLabel}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs text-zinc-400 group-hover:text-white">
                          <span>Evolución</span>
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>

                      <div className="my-5 flex items-end justify-between gap-4">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono text-3xl font-semibold text-white tabular-nums tracking-tight">
                              {desc.key === "steps"
                                ? currentVal.toLocaleString("es-CL")
                                : currentVal}
                            </span>
                            <span className="text-xs font-medium text-zinc-400">
                              {desc.unit}
                            </span>
                          </div>
                          <div className="mt-1 font-mono text-xs text-zinc-400 tabular-nums">
                            Línea base: {desc.personalBaseline} {desc.unit} (
                            <span style={{ color: desc.accentHex }}>
                              {deltaStr}
                            </span>
                            )
                          </div>
                        </div>

                        {/* Clean Mini Trend Polyline */}
                        <svg
                          width="96"
                          height="30"
                          viewBox="0 0 100 30"
                          className="overflow-visible shrink-0"
                          aria-hidden="true"
                        >
                          <polyline
                            fill="none"
                            stroke={desc.accentHex}
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={sparkPoints}
                          />
                        </svg>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                        <span>
                          Corredor personal: {desc.personalRange[0]} –{" "}
                          {desc.personalRange[1]} {desc.unit}
                        </span>
                        <span className="text-zinc-300 font-medium">
                          Ver gráfico 90d
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* INTEGRATED CROSS-ANALYSIS SUMMARY ON MAIN SCREEN */}
            <section className="apple-material rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">
                    Síntesis Preventiva: Cruce Wearable + Exámenes Clínicos
                  </h2>
                  <p className="mt-1 text-sm text-zinc-300">
                    Correlación activa entre tus 90 días de biometría continua y
                    tus {clinicalDocuments.length} exámenes de laboratorio
                    tipificados.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("fusion")}
                  className="tactile-press inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 shrink-0 self-start"
                >
                  <GitCompareArrows className="h-4 w-4" />
                  <span>Abrir Línea de Tiempo de Fusión</span>
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
                {correlations.map((corr, idx) => (
                  <div
                    key={corr.id}
                    className={`${idx > 0 ? "pt-5 md:pt-0 md:pl-6" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      {corr.severity === "optimal" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      <span className="font-mono text-xs font-semibold text-zinc-300 tabular-nums">
                        {corr.clinicalSignal.zScore}
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-semibold text-white">
                      {corr.title}
                    </h3>

                    <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                      <strong>Wearable:</strong> {corr.wearableSignal.change} (
                      {corr.wearableSignal.window})
                    </p>
                    <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                      <strong>Laboratorio:</strong>{" "}
                      {corr.clinicalSignal.biomarker}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* TAB 2: CLINICAL VAULT & PDF STANDARDIZATION */}
        {activeTab === "clinical" && (
          <motion.div
            key="tab-clinical"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={APPLE_SPRING_DEFAULT}
          >
            <ClinicalVaultView />
          </motion.div>
        )}

        {/* TAB 3: PREVENTIVE LONGITUDINAL FUSION */}
        {activeTab === "fusion" && (
          <motion.div
            key="tab-fusion"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={APPLE_SPRING_DEFAULT}
          >
            <PreventiveFusionView />
          </motion.div>
        )}
      </main>

      {/* Interactive Evolution Spline Modal when any Raw Biomarker is clicked */}
      {selectedDescriptor && (
        <InteractiveSplineSheet
          descriptor={selectedDescriptor}
          series={wearableSeries}
          onClose={() => setSelectedBiomarkerKey(null)}
        />
      )}
    </div>
  );
}
