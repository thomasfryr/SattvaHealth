import {
  ClinicalDocument,
  PreventiveCorrelationInsight,
  UserProfile,
  WearableBiomarkerDescriptor,
  WearableDailyMetric,
} from "@/lib/types/sattva";

export const DEFAULT_PATIENT_ZERO_PROFILE: UserProfile = {
  id: "patient-0-thomas",
  email: "thomas@sattvahealth.io",
  fullName: "Thomas Fry",
  age: 28,
  weightKg: 74.5,
  heightCm: 178,
  gender: "male",
  onboardingCompleted: false,
  fitbitConnected: true,
  dataSourceMode: "demo_patient_0",
  createdAt: "2026-01-15T09:00:00Z",
};

export const WEARABLE_BIOMARKER_DESCRIPTORS: WearableBiomarkerDescriptor[] = [
  {
    key: "resting_hr",
    label: "Frecuencia Cardíaca en Reposo",
    shortLabel: "FC Reposo",
    unit: "lpm",
    category: "cardio",
    accentHex: "#FF2D55",
    personalBaseline: 53.8,
    personalRange: [51, 56],
    populationRange: [60, 100],
    higherIsBetter: false,
    clinicalInterpretation:
      "Refleja eficiencia sistólica vagal y acondicionamiento cardiorrespiratorio. Elevaciones sostenidas de +3 a +5 lpm sobre tu línea base personal suelen anticipar estrés inflamatorio o deuda de recuperación 48h antes de síntomas.",
  },
  {
    key: "hrv_rmssd",
    label: "Variabilidad Cardíaca (VFC / RMSSD)",
    shortLabel: "VFC Nocturna",
    unit: "ms",
    category: "autonomic",
    accentHex: "#FF9500",
    personalBaseline: 76.4,
    personalRange: [68, 86],
    populationRange: [35, 95],
    higherIsBetter: true,
    clinicalInterpretation:
      "Medida directa del tono parasimpático (nervio vago). Una caída persistente bajo tu umbral personal de 68 ms se correlaciona con activación simpática, resistencia periférica a la insulina transitoria y elevación de cortisol.",
  },
  {
    key: "sleep_hours",
    label: "Arquitectura del Sueño Total",
    shortLabel: "Sueño Total",
    unit: "hrs",
    category: "sleep",
    accentHex: "#AF52DE",
    personalBaseline: 7.6,
    personalRange: [7.2, 8.2],
    populationRange: [6.5, 9.0],
    higherIsBetter: true,
    clinicalInterpretation:
      "Tiempo efectivo de descanso con proporción óptima de sueño profundo reparador (22%) y REM (24%). Déficits acumulados impactan directamente la sensibilidad a la glucosa en ayunas.",
  },
  {
    key: "spo2",
    label: "Saturación de Oxígeno Arterial",
    shortLabel: "SpO2 Nocturna",
    unit: "%",
    category: "clinical",
    accentHex: "#32ADE6",
    personalBaseline: 98.1,
    personalRange: [97.0, 99.0],
    populationRange: [95.0, 100.0],
    higherIsBetter: true,
    clinicalInterpretation:
      "Estabilidad respiratoria durante el sueño. Variaciones o caídas puntuales permiten descartar eventos de hipopnea o alteraciones ventilatorias nocturnas.",
  },
  {
    key: "temp_variation",
    label: "Variación de Temperatura Cutánea",
    shortLabel: "Temp. Basal",
    unit: "°C",
    category: "metabolic",
    accentHex: "#34C759",
    personalBaseline: 0.0,
    personalRange: [-0.25, 0.25],
    populationRange: [-0.8, 0.8],
    higherIsBetter: false,
    clinicalInterpretation:
      "Desviación térmica nocturna respecto a tu media móvil de 30 días. Desviaciones superiores a +0.4 °C actúan como marcador temprano de respuesta inmune innata o sobrecarga metabólica.",
  },
  {
    key: "steps",
    label: "Volumen de Movimiento Diario",
    shortLabel: "Pasos & Flujo",
    unit: "pasos",
    category: "metabolic",
    accentHex: "#34C759",
    personalBaseline: 9850,
    personalRange: [8200, 12500],
    populationRange: [5000, 10000],
    higherIsBetter: true,
    clinicalInterpretation:
      "Actividad contráctil muscular de baja intensidad (NEAT) que regula el transporte de glucosa independiente de insulina (GLUT4) y protege la función endotelial.",
  },
];

/**
 * Generates 90 days of deterministic, physiologically accurate time-series metrics
 * for Patient 0, including a subtle stress/metabolic drift window 35-55 days ago
 * that correlates with clinical blood work.
 */
export function generatePatientZeroWearableSeries(days = 90): WearableDailyMetric[] {
  const series: WearableDailyMetric[] = [];
  const baseDate = new Date("2026-11-05T12:00:00");

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Create a realistic physiological wave + a stress/drift period between day index 20..42 ago
    const isStressWindow = i >= 18 && i <= 42;
    const stressFactor = isStressWindow ? Math.sin(((i - 18) / 24) * Math.PI) : 0;

    const wave1 = Math.sin(i * 0.45);
    const wave2 = Math.cos(i * 0.23);

    const restingHr = Number(
      (53.4 + wave1 * 1.4 + wave2 * 0.8 + stressFactor * 4.8).toFixed(1)
    );
    const hrvRmssd = Number(
      (77.5 - wave1 * 4.5 + wave2 * 3.2 - stressFactor * 15.5).toFixed(1)
    );
    const sleepHours = Number(
      (7.65 + wave2 * 0.45 - wave1 * 0.25 - stressFactor * 1.15).toFixed(2)
    );
    const deepSleepPct = Math.round(22 + wave2 * 3 - stressFactor * 5);
    const remSleepPct = Math.round(24 + wave1 * 2 - stressFactor * 3);

    const sleepScore = Math.min(
      99,
      Math.max(58, Math.round((sleepHours / 8.0) * 88 + deepSleepPct * 0.5))
    );
    const recoveryScore = Math.min(
      98,
      Math.max(
        42,
        Math.round(
          ((hrvRmssd - 45) / 45) * 55 + ((65 - restingHr) / 15) * 35 + 12
        )
      )
    );
    const strainScore = Number(
      Math.min(
        20.4,
        Math.max(7.2, 13.8 + wave1 * 2.8 - wave2 * 1.6 + (i % 7 === 0 ? -3.1 : 1.1))
      ).toFixed(1)
    );
    const spo2 = Number((98.2 + wave2 * 0.5 - stressFactor * 0.7).toFixed(1));
    const tempVariation = Number(
      (wave1 * 0.11 + stressFactor * 0.34).toFixed(2)
    );
    const steps = Math.round(
      9900 + wave1 * 1850 + wave2 * 1100 - stressFactor * 2100
    );
    const activeCalories = Math.round(steps * 0.048 + strainScore * 32);

    series.push({
      date: dateStr,
      strainScore,
      recoveryScore,
      sleepScore,
      sleepHours,
      deepSleepPct,
      remSleepPct,
      restingHr,
      hrvRmssd,
      spo2,
      tempVariation,
      steps,
      activeCalories,
    });
  }

  return series;
}

export const INITIAL_CLINICAL_DOCUMENTS: ClinicalDocument[] = [
  {
    id: "doc-metabolic-2026-10",
    title: "Perfil Bioquímico & Metabólico de Precisión",
    documentType: "biochemistry",
    laboratoryName: "Clínica Alemana — Laboratorio Clínico",
    physicianName: "Dr. Sebastián Valdés (Medicina Interna & Longevidad)",
    documentDate: "2026-10-18",
    fileName: "Perfil_Bioquimico_Metabolico_Oct2026.pdf",
    fileUrl: "/api/clinical/sample-pdf?id=doc-metabolic-2026-10",
    fileSizeBytes: 428500,
    extractionStatus: "verified",
    clinicalSummary:
      "Todos los marcadores caen dentro del rango de referencia poblacional clásico; sin embargo, el motor Sattva detecta una deriva de +1.8σ en Glucosa Basal (93 mg/dL vs tu línea base personal de 83 mg/dL) e Insulina Basal (7.4 uUI/mL vs 4.8 uUI/mL), coincidiendo con las 3 semanas previas de reducción de sueño profundo y caída de VFC.",
    createdAt: "2026-10-18T15:30:00Z",
    biomarkers: [
      {
        id: "bio-glu-2026-10",
        documentId: "doc-metabolic-2026-10",
        code: "GLU_FAST",
        name: "Glucosa en Ayunas",
        category: "metabolic",
        numericValue: 93,
        unit: "mg/dL",
        refMin: 70,
        refMax: 99,
        personalBaseline: 83,
        personalSd: 3.5,
        status: "baseline_drift",
        userVerified: true,
        measuredAt: "2026-10-18",
        historicalValues: [
          { date: "2025-11-10", value: 81 },
          { date: "2026-04-12", value: 83 },
          { date: "2026-07-20", value: 85 },
          { date: "2026-10-18", value: 93 },
        ],
      },
      {
        id: "bio-ins-2026-10",
        documentId: "doc-metabolic-2026-10",
        code: "INS_FAST",
        name: "Insulina Basal",
        category: "metabolic",
        numericValue: 7.4,
        unit: "µUI/mL",
        refMin: 2.6,
        refMax: 24.9,
        personalBaseline: 4.8,
        personalSd: 0.9,
        status: "baseline_drift",
        userVerified: true,
        measuredAt: "2026-10-18",
        historicalValues: [
          { date: "2025-11-10", value: 4.5 },
          { date: "2026-04-12", value: 4.8 },
          { date: "2026-07-20", value: 5.1 },
          { date: "2026-10-18", value: 7.4 },
        ],
      },
      {
        id: "bio-hba1c-2026-10",
        documentId: "doc-metabolic-2026-10",
        code: "HBA1C",
        name: "Hemoglobina Glicosilada (HbA1c)",
        category: "metabolic",
        numericValue: 5.1,
        unit: "%",
        refMin: 4.0,
        refMax: 5.6,
        personalBaseline: 5.0,
        personalSd: 0.15,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-10-18",
        historicalValues: [
          { date: "2025-11-10", value: 4.9 },
          { date: "2026-04-12", value: 5.0 },
          { date: "2026-10-18", value: 5.1 },
        ],
      },
      {
        id: "bio-hscrp-2026-10",
        documentId: "doc-metabolic-2026-10",
        code: "HS_CRP",
        name: "PCR Ultrasensible (hs-CRP)",
        category: "inflammatory",
        numericValue: 1.15,
        unit: "mg/L",
        refMin: 0.0,
        refMax: 3.0,
        personalBaseline: 0.45,
        personalSd: 0.2,
        status: "baseline_drift",
        userVerified: true,
        measuredAt: "2026-10-18",
        historicalValues: [
          { date: "2025-11-10", value: 0.4 },
          { date: "2026-04-12", value: 0.45 },
          { date: "2026-07-20", value: 0.52 },
          { date: "2026-10-18", value: 1.15 },
        ],
      },
      {
        id: "bio-vitd-2026-10",
        documentId: "doc-metabolic-2026-10",
        code: "VIT_D25",
        name: "25-Hidroxi Vitamina D",
        category: "hormonal",
        numericValue: 48.5,
        unit: "ng/mL",
        refMin: 30.0,
        refMax: 100.0,
        personalBaseline: 46.0,
        personalSd: 4.0,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-10-18",
      },
    ],
  },
  {
    id: "doc-lipid-2026-09",
    title: "Panel Lipídico Avanzado & Partículas ApoB",
    documentType: "lipid_profile",
    laboratoryName: "RedSalud UC Christus — Unidad Cardiovascular",
    physicianName: "Dra. Carolina Méndez (Cardiología Preventiva)",
    documentDate: "2026-09-05",
    fileName: "Panel_Lipidico_ApoB_Sep2026.pdf",
    fileUrl: "/api/clinical/sample-pdf?id=doc-lipid-2026-09",
    fileSizeBytes: 389200,
    extractionStatus: "verified",
    clinicalSummary:
      "Perfil aterogénico sobresaliente. Apolipoproteína B (68 mg/dL) y Triglicéridos (64 mg/dL) en percentil óptimo de Medicina 3.0 (< 70 mg/dL). Relación TG/HDL de 1.08 confirma excelente flexibilidad oxidativa lipídica.",
    createdAt: "2026-09-05T11:15:00Z",
    biomarkers: [
      {
        id: "bio-apob-2026-09",
        documentId: "doc-lipid-2026-09",
        code: "APOB",
        name: "Apolipoproteína B (ApoB)",
        category: "cardiovascular",
        numericValue: 68,
        unit: "mg/dL",
        refMin: 40,
        refMax: 100,
        personalBaseline: 71,
        personalSd: 4.0,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-09-05",
      },
      {
        id: "bio-ldl-2026-09",
        documentId: "doc-lipid-2026-09",
        code: "LDL_C",
        name: "Colesterol LDL Directo",
        category: "cardiovascular",
        numericValue: 84,
        unit: "mg/dL",
        refMin: 0,
        refMax: 115,
        personalBaseline: 88,
        personalSd: 5.5,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-09-05",
      },
      {
        id: "bio-hdl-2026-09",
        documentId: "doc-lipid-2026-09",
        code: "HDL_C",
        name: "Colesterol HDL",
        category: "cardiovascular",
        numericValue: 59,
        unit: "mg/dL",
        refMin: 40,
        refMax: 90,
        personalBaseline: 57,
        personalSd: 3.0,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-09-05",
      },
      {
        id: "bio-tg-2026-09",
        documentId: "doc-lipid-2026-09",
        code: "TRIG",
        name: "Triglicéridos en Ayunas",
        category: "cardiovascular",
        numericValue: 64,
        unit: "mg/dL",
        refMin: 30,
        refMax: 150,
        personalBaseline: 69,
        personalSd: 6.0,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-09-05",
      },
    ],
  },
  {
    id: "doc-holter-2026-07",
    title: "Holter de Ritmo Cardíaco 24h & Autonomía Vagal",
    documentType: "holter",
    laboratoryName: "Instituto de Cardiología & Electrofisiología",
    physicianName: "Dr. Matías Echeverría (Electrofisiología)",
    documentDate: "2026-07-20",
    fileName: "Holter_Arritmias_24h_Jul2026.pdf",
    fileUrl: "/api/clinical/sample-pdf?id=doc-holter-2026-07",
    fileSizeBytes: 612000,
    extractionStatus: "verified",
    clinicalSummary:
      "Ritmo sinusal constante durante las 24 horas de registro. Ausencia de pausas patológicas o bloqueos AV. SDNN global de 164 ms confirma alta reserva autonómica parasimpática coincidente con los registros de tu wearable.",
    createdAt: "2026-07-20T18:00:00Z",
    biomarkers: [
      {
        id: "bio-holter-hr-2026-07",
        documentId: "doc-holter-2026-07",
        code: "HOLTER_MIN_HR",
        name: "FC Mínima Nocturna (Holter)",
        category: "cardiac_electrophysiology",
        numericValue: 46,
        unit: "lpm",
        refMin: 42,
        refMax: 65,
        personalBaseline: 47,
        personalSd: 2.0,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-07-20",
      },
      {
        id: "bio-holter-sdnn-2026-07",
        documentId: "doc-holter-2026-07",
        code: "HOLTER_SDNN",
        name: "SDNN 24 Horas (Variabilidad Global)",
        category: "cardiac_electrophysiology",
        numericValue: 164,
        unit: "ms",
        refMin: 100,
        refMax: 220,
        personalBaseline: 158,
        personalSd: 10.0,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-07-20",
      },
      {
        id: "bio-holter-qtc-2026-07",
        documentId: "doc-holter-2026-07",
        code: "ECG_QTC",
        name: "Intervalo QTc Medio (Bazett)",
        category: "cardiac_electrophysiology",
        numericValue: 408,
        unit: "ms",
        refMin: 350,
        refMax: 440,
        personalBaseline: 406,
        personalSd: 6.0,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-07-20",
      },
    ],
  },
  {
    id: "doc-hemograma-2026-04",
    title: "Hemograma Completo & Cinética de Hierro",
    documentType: "blood_panel",
    laboratoryName: "Clínica Las Condes — Laboratorio Hematológico",
    physicianName: "Dr. Sebastián Valdés",
    documentDate: "2026-04-12",
    fileName: "Hemograma_Cinetica_Hierro_Abr2026.pdf",
    fileUrl: "/api/clinical/sample-pdf?id=doc-hemograma-2026-04",
    fileSizeBytes: 315400,
    extractionStatus: "verified",
    clinicalSummary:
      "Serie roja y transporte de oxígeno en niveles óptimos para transporte aeróbico. Hemoglobina en 15.4 g/dL y Ferritina en 88 ng/mL sin signos de sobrecarga férrica ni inflamación aguda.",
    createdAt: "2026-04-12T10:20:00Z",
    biomarkers: [
      {
        id: "bio-hgb-2026-04",
        documentId: "doc-hemograma-2026-04",
        code: "HGB",
        name: "Hemoglobina",
        category: "hematologic",
        numericValue: 15.4,
        unit: "g/dL",
        refMin: 13.5,
        refMax: 17.5,
        personalBaseline: 15.2,
        personalSd: 0.3,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-04-12",
      },
      {
        id: "bio-ferr-2026-04",
        documentId: "doc-hemograma-2026-04",
        code: "FERR",
        name: "Ferritina Sérica",
        category: "hematologic",
        numericValue: 88,
        unit: "ng/mL",
        refMin: 30,
        refMax: 250,
        personalBaseline: 85,
        personalSd: 8.0,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-04-12",
      },
      {
        id: "bio-wbc-2026-04",
        documentId: "doc-hemograma-2026-04",
        code: "WBC",
        name: "Recuento de Leucocitos",
        category: "hematologic",
        numericValue: 5.4,
        unit: "10³/µL",
        refMin: 4.0,
        refMax: 10.5,
        personalBaseline: 5.3,
        personalSd: 0.4,
        status: "optimal",
        userVerified: true,
        measuredAt: "2026-04-12",
      },
    ],
  },
];

export const PREVENTIVE_CORRELATION_INSIGHTS: PreventiveCorrelationInsight[] = [
  {
    id: "corr-sleep-glucose-oct",
    title: "Deuda de Sueño Profundo → Deriva Temprana en Glucosa e Insulina Basal",
    severity: "drift_warning",
    wearableSignal: {
      metric: "Sueño Total & VFC Nocturna",
      change: "-1.1 hrs de sueño y -15 ms en VFC promedio",
      window: "28 Sep – 17 Oct (20 días previos al examen)",
    },
    clinicalSignal: {
      biomarker: "Glucosa en Ayunas (93 mg/dL) e Insulina (7.4 µUI/mL)",
      value: "93 mg/dL (Rango lab tradicional: < 100 mg/dL)",
      personalBaseline: "83 mg/dL (Tu línea base de 12 meses)",
      zScore: "+2.8σ sobre tu media individual",
    },
    mechanismExplanation:
      "Aunque un laboratorio tradicional etiqueta 93 mg/dL como 'normal', para tu fisiología representa un salto de +10 mg/dL. La caída sostenida de tu VFC bajo 65 ms durante esas 3 semanas refleja hiperactividad simpática nocturna, que inhibe la captación periférica de glucosa y eleva la gluconeogénesis hepática matinal.",
    preventiveAction:
      "Estabilizar la ventana de sueño por encima de 7h 30m durante 21 días y adelantar la última ingesta calórica 3 horas antes de dormir antes de repetir glucemia e insulina de control.",
  },
  {
    id: "corr-rhr-hscrp-oct",
    title: "Elevación de FC en Reposo (+4.6 lpm) → Rebote en PCR Ultrasensible (hs-CRP)",
    severity: "drift_warning",
    wearableSignal: {
      metric: "FC en Reposo & Temp. Cutánea",
      change: "58.2 lpm (+4.4 lpm) y +0.32 °C nocturnos",
      window: "02 Oct – 18 Oct",
    },
    clinicalSignal: {
      biomarker: "PCR Ultrasensible (hs-CRP)",
      value: "1.15 mg/L",
      personalBaseline: "0.45 mg/L",
      zScore: "+3.5σ sobre tu línea base endotelial",
    },
    mechanismExplanation:
      "Tu wearable detectó el incremento de tono inflamatorio subclínico dos semanas antes de la toma de muestra sanguínea mediante el aumento simultáneo de temperatura cutánea basal y frecuencia cardíaca mínima nocturna.",
    preventiveAction:
      "Priorizar sesiones aeróbicas en Zona 2 (130-142 lpm) y evitar picos de Strain > 17.5 cuando el Recovery Score diario amanezca por debajo de 60%.",
  },
  {
    id: "corr-neat-apob-sep",
    title: "Volumen Aeróbico Consistente → ApoB y Triglicéridos en Percentil 5 Óptimo",
    severity: "optimal",
    wearableSignal: {
      metric: "Movimiento Diario & Strain Aeróbico",
      change: "10,240 pasos/día y FC Reposo de 53 lpm",
      window: "Jul – Sep (Trimestre previo a Panel Lipídico)",
    },
    clinicalSignal: {
      biomarker: "Apolipoproteína B (68 mg/dL) y TG (64 mg/dL)",
      value: "68 mg/dL (Meta Medicina 3.0: < 70 mg/dL)",
      personalBaseline: "71 mg/dL",
      zScore: "-0.75σ (Mejora continua)",
    },
    mechanismExplanation:
      "La constancia en movimiento diario de baja intensidad y la alta densidad mitocondrial reflejada en tu FC de reposo (53 lpm) mantienen una depuración acelerada de lipoproteínas remanentes y partículas ApoB.",
    preventiveAction:
      "Mantener el piso actual de > 8,500 pasos diarios y repetir control de ApoB cada 6 meses.",
  },
];
