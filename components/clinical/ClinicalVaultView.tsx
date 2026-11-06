"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  Building2,
  X,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { useSattva } from "@/lib/context/sattva-context";
import {
  ClinicalDocument,
  DocumentCategory,
  ExtractedBiomarker,
} from "@/lib/types/sattva";
import {
  APPLE_SPRING_DEFAULT,
  APPLE_SPRING_SHEET,
  formatDateEs,
} from "@/lib/utils";

const CATEGORY_LABELS: Record<DocumentCategory | "all", string> = {
  all: "Todos los exámenes",
  biochemistry: "Perfil Bioquímico & Metabólico",
  lipid_profile: "Panel Lipídico & Cardio",
  blood_panel: "Hemograma & Hematología",
  hormonal: "Perfil Hormonal",
  holter: "Holter 24h",
  ecg: "Electrocardiograma (ECG)",
};

export function ClinicalVaultView() {
  const {
    clinicalDocuments,
    confirmClinicalDocument,
    updateBiomarkerInDocument,
  } = useSattva();

  const [selectedCategory, setSelectedCategory] = useState<
    DocumentCategory | "all"
  >("all");
  const [selectedDocId, setSelectedDocId] = useState<string>(
    clinicalDocuments[0]?.id || ""
  );

  // Upload & HITL Review State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] =
    useState<DocumentCategory>("biochemistry");
  const [uploadLab, setUploadLab] = useState("Clínica Alemana");
  const [uploadDate, setUploadDate] = useState("2026-11-05");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [draftDocument, setDraftDocument] = useState<ClinicalDocument | null>(
    null
  );
  const [extractionEngineLabel, setExtractionEngineLabel] = useState("");

  // PDF Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<ClinicalDocument | null>(null);

  // Inline Biomarker Edit State
  const [editingBioId, setEditingBioId] = useState<string | null>(null);
  const [editingBioVal, setEditingBioVal] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredDocs = clinicalDocuments.filter((doc) =>
    selectedCategory === "all" ? true : doc.documentType === selectedCategory
  );

  const activeDoc =
    filteredDocs.find((d) => d.id === selectedDocId) ||
    filteredDocs[0] ||
    clinicalDocuments[0];

  const handleRunExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExtracting(true);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append(
        "title",
        uploadTitle.trim() ||
          CATEGORY_LABELS[uploadCategory] ||
          "Examen Clínico"
      );
      formData.append("documentType", uploadCategory);
      formData.append("laboratoryName", uploadLab.trim() || "Laboratorio Central");
      formData.append("documentDate", uploadDate);

      const res = await fetch("/api/clinical/extract", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.document) {
        setDraftDocument(data.document);
        setExtractionEngineLabel(
          data.engine === "gemini-2.0-flash-vision"
            ? "Gemini 2.0 Vision Multimodal"
            : "Motor Clínico Estandarizado Sattva"
        );
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDraftBiomarkerChange = (bioId: string, newVal: number) => {
    if (!draftDocument) return;
    setDraftDocument({
      ...draftDocument,
      biomarkers: draftDocument.biomarkers.map((b) =>
        b.id === bioId ? { ...b, numericValue: newVal } : b
      ),
    });
  };

  const handleConfirmDraft = () => {
    if (!draftDocument) return;
    confirmClinicalDocument(draftDocument);
    setSelectedDocId(draftDocument.id);
    setDraftDocument(null);
    setIsUploadOpen(false);
    setSelectedFile(null);
    setUploadTitle("");
  };

  const renderBiomarkerGauge = (bio: ExtractedBiomarker, docId: string) => {
    const span = bio.refMax - bio.refMin || 1;
    const minBound = bio.refMin - span * 0.15;
    const maxBound = bio.refMax + span * 0.15;
    const totalWindow = maxBound - minBound || 1;

    const valuePct = Math.min(
      98,
      Math.max(2, ((bio.numericValue - minBound) / totalWindow) * 100)
    );
    const baselinePct = Math.min(
      98,
      Math.max(2, ((bio.personalBaseline - minBound) / totalWindow) * 100)
    );
    const refLeftPct = Math.max(0, ((bio.refMin - minBound) / totalWindow) * 100);
    const refWidthPct = Math.min(
      100 - refLeftPct,
      ((bio.refMax - bio.refMin) / totalWindow) * 100
    );

    const delta = bio.numericValue - bio.personalBaseline;
    const deltaFormatted = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} ${
      bio.unit
    }`;

    const isDrift = bio.status === "baseline_drift";
    const isOut = bio.status === "out_of_range";
    const accentColor = isOut
      ? "#FF3B30"
      : isDrift
      ? "#FFCC00"
      : "#34C759";

    const isEditing = editingBioId === bio.id;

    return (
      <div
        key={bio.id}
        className="py-5 first:pt-0 last:pb-0 border-b last:border-b-0 border-white/[0.07]"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-semibold text-cyan-400 bg-cyan-500/[0.12] px-2 py-0.5 rounded-md">
                {bio.code}
              </span>
              <h4 className="text-base font-semibold text-white">{bio.name}</h4>
              {isDrift && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/[0.14] px-2.5 py-0.5 text-xs font-medium text-amber-300">
                  <AlertTriangle className="h-3 w-3" />
                  Deriva de tu línea base
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Rango lab tradicional: {bio.refMin} – {bio.refMax} {bio.unit} · Tu
              línea base personal:{" "}
              <span className="font-mono text-zinc-200 tabular-nums">
                {bio.personalBaseline} {bio.unit}
              </span>
            </p>
          </div>

          {/* Numeric Readout & Inline Edit */}
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={editingBioVal}
                  onChange={(e) => setEditingBioVal(e.target.value)}
                  aria-label={`Editar valor de ${bio.name}`}
                  className="w-24 rounded-lg bg-zinc-900 border border-emerald-400 px-2.5 py-1 font-mono text-sm text-white tabular-nums focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const parsed = Number(editingBioVal);
                    if (!Number.isNaN(parsed)) {
                      updateBiomarkerInDocument(docId, bio.id, parsed);
                    }
                    setEditingBioId(null);
                  }}
                  aria-label="Guardar valor editado"
                  className="rounded-lg bg-emerald-500 p-1.5 text-black hover:bg-emerald-400"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingBioId(bio.id);
                  setEditingBioVal(String(bio.numericValue));
                }}
                title="Clic para ajustar valor manualmente"
                className="text-right group"
              >
                <div className="flex items-baseline justify-end gap-1.5">
                  <span
                    className="font-mono text-2xl font-semibold tabular-nums"
                    style={{ color: accentColor }}
                  >
                    {bio.numericValue}
                  </span>
                  <span className="text-xs text-zinc-300">{bio.unit}</span>
                </div>
                <div className="font-mono text-xs text-zinc-400 tabular-nums group-hover:text-zinc-200">
                  {deltaFormatted} vs tu media
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Visual Range & Personal Baseline Gauge */}
        <div className="mt-3.5 relative h-2.5 w-full rounded-full bg-zinc-900 overflow-hidden">
          {/* Standard Lab Reference Corridor */}
          <div
            className="absolute top-0 bottom-0 bg-white/[0.08] rounded-full"
            style={{
              left: `${refLeftPct}%`,
              width: `${refWidthPct}%`,
            }}
          />
          {/* Personal Baseline Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10"
            style={{ left: `${baselinePct}%` }}
            title={`Tu línea base personal: ${bio.personalBaseline} ${bio.unit}`}
          />
          {/* Current Value Dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full z-20 border-2 border-black"
            style={{
              left: `${valuePct}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Bóveda de Exámenes Clínicos & Biomarcadores
          </h2>
          <p className="mt-1 text-sm text-zinc-300">
            Tus informes en PDF estandarizados por fecha, especialidad y
            comparados contra tu línea base personal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDraftDocument(null);
            setIsUploadOpen(true);
          }}
          className="tactile-press inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400 shrink-0"
        >
          <FileUp className="h-4 w-4" />
          <span>Subir Examen PDF</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <SlidersHorizontal className="h-4 w-4 text-zinc-400 shrink-0 mr-1" />
        {(
          [
            "all",
            "biochemistry",
            "lipid_profile",
            "blood_panel",
            "holter",
            "ecg",
          ] as const
        ).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setSelectedCategory(cat);
              const firstMatch = clinicalDocuments.find((d) =>
                cat === "all" ? true : d.documentType === cat
              );
              if (firstMatch) setSelectedDocId(firstMatch.id);
            }}
            className={`tactile-press whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all ${
              selectedCategory === cat
                ? "bg-white text-black font-semibold"
                : "bg-zinc-900/70 text-zinc-300 border border-white/[0.08] hover:border-white/20 hover:text-white"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Master-Detail Split Layout (No nested cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chronological Document List */}
        <div className="lg:col-span-5 apple-material rounded-3xl divide-y divide-white/[0.08] overflow-hidden">
          {filteredDocs.map((doc) => {
            const isSelected = activeDoc?.id === doc.id;
            const driftCount = doc.biomarkers.filter(
              (b) => b.status !== "optimal"
            ).length;

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDocId(doc.id)}
                className={`tactile-press w-full text-left p-5 transition-colors flex items-start justify-between gap-4 ${
                  isSelected
                    ? "bg-white/[0.07]"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Calendar className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="font-mono tabular-nums">
                      {formatDateEs(doc.documentDate)}
                    </span>
                    <span>·</span>
                    <span className="truncate">{doc.laboratoryName}</span>
                  </div>

                  <h3 className="mt-1.5 text-base font-semibold text-white truncate">
                    {doc.title}
                  </h3>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-zinc-300">
                      {doc.biomarkers.length} indicadores tipificados
                    </span>
                    {driftCount > 0 ? (
                      <span className="rounded-md bg-amber-500/[0.15] px-2 py-0.5 text-xs font-medium text-amber-300">
                        {driftCount} con deriva de línea base
                      </span>
                    ) : (
                      <span className="rounded-md bg-emerald-500/[0.14] px-2 py-0.5 text-xs font-medium text-emerald-300">
                        100% en rango personal
                      </span>
                    )}
                  </div>
                </div>

                <FileText
                  className={`h-5 w-5 shrink-0 mt-1 ${
                    isSelected ? "text-emerald-400" : "text-zinc-500"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Column: Selected Document Standardized Biomarkers & PDF Actions */}
        {activeDoc && (
          <div className="lg:col-span-7 apple-material rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div>
                <h3 className="text-2xl font-semibold text-white tracking-tight">
                  {activeDoc.title}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                    {activeDoc.laboratoryName}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                    <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                    {formatDateEs(activeDoc.documentDate)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Tipificado y Verificado
                  </span>
                </div>
              </div>

              {/* Original PDF View & Download Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(activeDoc)}
                  className="tactile-press inline-flex items-center gap-2 rounded-xl bg-white/[0.08] border border-white/[0.12] px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/[0.14]"
                >
                  <Eye className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Visualizar PDF</span>
                </button>

                <a
                  href={`${activeDoc.fileUrl}${
                    activeDoc.fileUrl.includes("?") ? "&" : "?"
                  }download=1`}
                  download={activeDoc.fileName}
                  className="tactile-press inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Descargar Original</span>
                </a>
              </div>
            </div>

            {/* AI Preventive Synthesis */}
            <p className="mt-5 text-sm text-zinc-200 leading-relaxed bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06]">
              {activeDoc.clinicalSummary}
            </p>

            {/* Standardized Biomarkers List */}
            <div className="mt-6">
              {activeDoc.biomarkers.map((bio) =>
                renderBiomarkerGauge(bio, activeDoc.id)
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: UPLOAD & HUMAN-IN-THE-LOOP (HITL) EXTRACTION REVIEW */}
      <AnimatePresence>
        {isUploadOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsUploadOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="upload-modal-title"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={APPLE_SPRING_SHEET}
              onClick={(e) => e.stopPropagation()}
              className="apple-material-elevated w-full max-w-2xl rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3
                    id="upload-modal-title"
                    className="text-2xl font-semibold text-white tracking-tight"
                  >
                    {draftDocument
                      ? "Revisión Asistida de Biomarcadores (Human-in-the-Loop)"
                      : "Ingesta y Estandarización de Examen en PDF"}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-300">
                    {draftDocument
                      ? `Extraído mediante ${extractionEngineLabel}. Verifica o ajusta cualquier valor antes de consolidarlo en tu línea de tiempo.`
                      : "Sube tu archivo PDF (Sangre, Perfil Bioquímico, Panel Lipídico, ECG o Holter) para extraer sus indicadores automáticamente."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  aria-label="Cerrar ventana de carga"
                  className="rounded-full bg-white/[0.08] p-2 text-zinc-300 hover:bg-white/[0.16] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!draftDocument ? (
                <form onSubmit={handleRunExtraction} className="mt-6 space-y-4">
                  {/* File Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border border-dashed border-white/20 bg-zinc-900/60 p-6 text-center hover:border-emerald-400/60 transition-colors"
                  >
                    <FileUp className="mx-auto h-8 w-8 text-emerald-400" />
                    <div className="mt-2 text-sm font-medium text-white">
                      {selectedFile
                        ? selectedFile.name
                        : "Selecciona tu archivo PDF clínico (o procesa una plantilla de prueba)"}
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      Soporta reportes de laboratorio en PDF de cualquier clínica
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="doc-title-input"
                        className="block text-xs font-medium text-zinc-300"
                      >
                        Nombre del estudio
                      </label>
                      <input
                        id="doc-title-input"
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Ej. Control Bioquímico Trimestral"
                        className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-white/[0.1] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="doc-cat-select"
                        className="block text-xs font-medium text-zinc-300"
                      >
                        Tipo de examen
                      </label>
                      <select
                        id="doc-cat-select"
                        value={uploadCategory}
                        onChange={(e) =>
                          setUploadCategory(e.target.value as DocumentCategory)
                        }
                        className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-white/[0.1] px-3.5 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
                      >
                        <option value="biochemistry">
                          Perfil Bioquímico & Metabólico
                        </option>
                        <option value="lipid_profile">
                          Panel Lipídico & Cardio
                        </option>
                        <option value="blood_panel">Hemograma Completo</option>
                        <option value="holter">Holter de Ritmo 24h</option>
                        <option value="ecg">Electrocardiograma (ECG)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="doc-lab-input"
                        className="block text-xs font-medium text-zinc-300"
                      >
                        Laboratorio o Clínica emisora
                      </label>
                      <input
                        id="doc-lab-input"
                        type="text"
                        value={uploadLab}
                        onChange={(e) => setUploadLab(e.target.value)}
                        className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-white/[0.1] px-3.5 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="doc-date-input"
                        className="block text-xs font-medium text-zinc-300"
                      >
                        Fecha de toma de muestra
                      </label>
                      <input
                        id="doc-date-input"
                        type="date"
                        value={uploadDate}
                        onChange={(e) => setUploadDate(e.target.value)}
                        className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-white/[0.1] px-3.5 py-2.5 font-mono text-sm text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.06]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isExtracting}
                      className="tactile-press inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>
                        {isExtracting
                          ? "Extrayendo e interpretando..."
                          : "Leer y Estandarizar con IA"}
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={APPLE_SPRING_DEFAULT}
                  className="mt-6 space-y-5"
                >
                  <div className="rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/30 p-4 text-xs text-emerald-200 leading-relaxed">
                    {draftDocument.clinicalSummary}
                  </div>

                  <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                    {draftDocument.biomarkers.map((bio) => (
                      <div
                        key={bio.id}
                        className="py-3.5 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {bio.name}{" "}
                            <span className="font-mono text-xs text-cyan-400">
                              [{bio.code}]
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400">
                            Rango ref: {bio.refMin} – {bio.refMax} {bio.unit} ·
                            Línea base personal: {bio.personalBaseline}{" "}
                            {bio.unit}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={bio.numericValue}
                            onChange={(e) =>
                              handleDraftBiomarkerChange(
                                bio.id,
                                Number(e.target.value)
                              )
                            }
                            aria-label={`Valor extraído para ${bio.name}`}
                            className="w-24 rounded-xl bg-zinc-900 border border-white/[0.15] px-3 py-1.5 text-right font-mono text-sm font-semibold text-white tabular-nums focus:border-emerald-400 focus:outline-none"
                          />
                          <span className="w-14 text-xs text-zinc-300">
                            {bio.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setDraftDocument(null)}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.06]"
                    >
                      Volver a subir
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmDraft}
                      className="tactile-press inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirmar e Integrar al Historial</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EMBEDDED ORIGINAL PDF VIEWER */}
      <AnimatePresence>
        {previewDoc && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pdf-viewer-title"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={APPLE_SPRING_SHEET}
              onClick={(e) => e.stopPropagation()}
              className="apple-material-elevated flex h-[85vh] w-full max-w-4xl flex-col rounded-3xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
                <div>
                  <h3
                    id="pdf-viewer-title"
                    className="text-base font-semibold text-white"
                  >
                    {previewDoc.title} — {previewDoc.fileName}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {previewDoc.laboratoryName} ·{" "}
                    {formatDateEs(previewDoc.documentDate)}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href={`${previewDoc.fileUrl}${
                      previewDoc.fileUrl.includes("?") ? "&" : "?"
                    }download=1`}
                    download={previewDoc.fileName}
                    className="tactile-press inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Descargar PDF</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    aria-label="Cerrar visor PDF"
                    className="rounded-full bg-white/[0.08] p-2 text-zinc-300 hover:bg-white/[0.15] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-zinc-950">
                <iframe
                  src={previewDoc.fileUrl}
                  title={`Documento original ${previewDoc.title}`}
                  className="h-full w-full border-0"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
