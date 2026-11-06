export type GenderType = "male" | "female" | "other";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  age: number;
  weightKg: number;
  heightCm: number;
  gender: GenderType;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  fitbitConnected: boolean;
  dataSourceMode: "demo_patient_0" | "fitbit_live";
  createdAt: string;
}

export type BiomarkerMetricKey =
  | "resting_hr"
  | "hrv_rmssd"
  | "sleep_hours"
  | "spo2"
  | "temp_variation"
  | "steps";

export interface WearableDailyMetric {
  date: string; // YYYY-MM-DD
  strainScore: number; // 0 - 21.0
  recoveryScore: number; // 0 - 100%
  sleepScore: number; // 0 - 100%
  sleepHours: number; // e.g., 7.8
  deepSleepPct: number; // e.g., 22
  remSleepPct: number; // e.g., 24
  restingHr: number; // bpm, e.g., 54
  hrvRmssd: number; // ms, e.g., 78
  spo2: number; // %, e.g., 98.2
  tempVariation: number; // °C delta from baseline, e.g., -0.1
  steps: number; // e.g., 10450
  activeCalories: number; // kcal
}

export interface WearableBiomarkerDescriptor {
  key: BiomarkerMetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  category: "cardio" | "autonomic" | "sleep" | "metabolic" | "clinical";
  accentHex: string;
  personalBaseline: number;
  personalRange: [number, number];
  populationRange: [number, number];
  higherIsBetter: boolean;
  clinicalInterpretation: string;
}

export type DocumentCategory =
  | "blood_panel"
  | "biochemistry"
  | "lipid_profile"
  | "hormonal"
  | "ecg"
  | "holter";

export type BiomarkerDomain =
  | "metabolic"
  | "cardiovascular"
  | "inflammatory"
  | "hormonal"
  | "hematologic"
  | "renal_hepatic"
  | "cardiac_electrophysiology";

export interface ExtractedBiomarker {
  id: string;
  documentId: string;
  code: string;
  name: string;
  category: BiomarkerDomain;
  numericValue: number;
  unit: string;
  refMin: number;
  refMax: number;
  personalBaseline: number;
  personalSd: number;
  status: "optimal" | "baseline_drift" | "out_of_range";
  userVerified: boolean;
  measuredAt: string; // YYYY-MM-DD
  historicalValues?: { date: string; value: number }[];
}

export interface ClinicalDocument {
  id: string;
  title: string;
  documentType: DocumentCategory;
  laboratoryName: string;
  physicianName: string;
  documentDate: string; // YYYY-MM-DD
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  extractionStatus: "pending_review" | "verified";
  clinicalSummary: string;
  biomarkers: ExtractedBiomarker[];
  createdAt: string;
}

export interface PreventiveCorrelationInsight {
  id: string;
  title: string;
  severity: "optimal" | "drift_warning" | "action_required";
  wearableSignal: {
    metric: string;
    change: string;
    window: string;
  };
  clinicalSignal: {
    biomarker: string;
    value: string;
    personalBaseline: string;
    zScore: string;
  };
  mechanismExplanation: string;
  preventiveAction: string;
}
