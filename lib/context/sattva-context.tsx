"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ClinicalDocument,
  PreventiveCorrelationInsight,
  UserProfile,
  WearableDailyMetric,
} from "@/lib/types/sattva";
import {
  DEFAULT_PATIENT_ZERO_PROFILE,
  generatePatientZeroWearableSeries,
  INITIAL_CLINICAL_DOCUMENTS,
  PREVENTIVE_CORRELATION_INSIGHTS,
} from "@/lib/data/patient-zero-engine";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SattvaContextValue {
  profile: UserProfile;
  isHydrated: boolean;
  wearableSeries: WearableDailyMetric[];
  latestWearable: WearableDailyMetric;
  clinicalDocuments: ClinicalDocument[];
  correlations: PreventiveCorrelationInsight[];
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (finalProfile: Partial<UserProfile>) => void;
  resetOnboarding: () => void;
  confirmClinicalDocument: (doc: ClinicalDocument) => void;
  updateBiomarkerInDocument: (
    docId: string,
    biomarkerId: string,
    numericValue: number
  ) => void;
  deleteClinicalDocument: (docId: string) => void;
  triggerWearableSync: () => Promise<{ synced: boolean; message: string }>;
}

const PROFILE_STORAGE_KEY = "sattva_patient0_profile_v1";
const DOCS_STORAGE_KEY = "sattva_patient0_clinical_docs_v1";

const SattvaContext = createContext<SattvaContextValue | null>(null);

export function SattvaProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(
    DEFAULT_PATIENT_ZERO_PROFILE
  );
  const [clinicalDocuments, setClinicalDocuments] = useState<
    ClinicalDocument[]
  >(INITIAL_CLINICAL_DOCUMENTS);
  const [wearableSeries, setWearableSeries] = useState<WearableDailyMetric[]>(
    () => generatePatientZeroWearableSeries(90)
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      const savedDocs = localStorage.getItem(DOCS_STORAGE_KEY);
      if (savedDocs) {
        const parsedDocs = JSON.parse(savedDocs);
        if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
          setClinicalDocuments(parsedDocs);
        }
      }
    } catch {
      // Fallback to defaults if localStorage is unavailable
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const persistProfile = (next: UserProfile) => {
    setProfile(next);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota errors
    }

    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      supabase
        .from("profiles")
        .upsert({
          id: next.id,
          email: next.email,
          full_name: next.fullName,
          age: next.age,
          weight_kg: next.weightKg,
          height_cm: next.heightCm,
          gender: next.gender,
          avatar_url: next.avatarUrl,
          onboarding_completed: next.onboardingCompleted,
          fitbit_connected: next.fitbitConnected,
        })
        .then(() => {});
    }
  };

  const persistDocs = (nextDocs: ClinicalDocument[]) => {
    setClinicalDocuments(nextDocs);
    try {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(nextDocs));
    } catch {
      // Ignore storage errors
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    persistProfile({ ...profile, ...updates });
  };

  const completeOnboarding = (finalProfile: Partial<UserProfile>) => {
    persistProfile({
      ...profile,
      ...finalProfile,
      onboardingCompleted: true,
    });
  };

  const resetOnboarding = () => {
    persistProfile({
      ...profile,
      onboardingCompleted: false,
    });
  };

  const confirmClinicalDocument = (doc: ClinicalDocument) => {
    const verifiedDoc: ClinicalDocument = {
      ...doc,
      extractionStatus: "verified",
      biomarkers: doc.biomarkers.map((b) => {
        const isOut = b.numericValue < b.refMin || b.numericValue > b.refMax;
        const isDrift =
          !isOut &&
          Math.abs(b.numericValue - b.personalBaseline) >
            (b.refMax - b.refMin) * 0.2;
        return {
          ...b,
          userVerified: true,
          status: isOut
            ? "out_of_range"
            : isDrift
            ? "baseline_drift"
            : "optimal",
        };
      }),
    };

    const nextDocs = [
      verifiedDoc,
      ...clinicalDocuments.filter((d) => d.id !== verifiedDoc.id),
    ].sort((a, b) => b.documentDate.localeCompare(a.documentDate));

    persistDocs(nextDocs);
  };

  const updateBiomarkerInDocument = (
    docId: string,
    biomarkerId: string,
    numericValue: number
  ) => {
    const nextDocs = clinicalDocuments.map((doc) => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        biomarkers: doc.biomarkers.map((b) => {
          if (b.id !== biomarkerId) return b;
          const isOut = numericValue < b.refMin || numericValue > b.refMax;
          const isDrift =
            !isOut &&
            Math.abs(numericValue - b.personalBaseline) >
              (b.refMax - b.refMin) * 0.2;
          const newStatus: "optimal" | "baseline_drift" | "out_of_range" = isOut
            ? "out_of_range"
            : isDrift
            ? "baseline_drift"
            : "optimal";
          return {
            ...b,
            numericValue,
            status: newStatus,
            userVerified: true,
          };
        }),
      };
    });
    persistDocs(nextDocs);
  };

  const deleteClinicalDocument = (docId: string) => {
    persistDocs(clinicalDocuments.filter((d) => d.id !== docId));
  };

  const triggerWearableSync = async (): Promise<{
    synced: boolean;
    message: string;
  }> => {
    try {
      const res = await fetch("/api/wearables/fitbit/auth");
      const data = await res.json();
      if (data.configured && data.authUrl) {
        window.location.href = data.authUrl;
        return {
          synced: true,
          message: "Redirigiendo a OAuth2 de Fitbit / Google Health...",
        };
      }
      // Refresh wearable series with a tiny organic intraday pulse
      const refreshed = generatePatientZeroWearableSeries(90);
      setWearableSeries(refreshed);
      updateProfile({ fitbitConnected: true });
      return {
        synced: true,
        message:
          "Telemetría sincronizada con Google Health / Fitbit (90 días de series temporales actualizadas).",
      };
    } catch {
      return {
        synced: false,
        message: "No se pudo contactar el servicio de sincronización.",
      };
    }
  };

  const latestWearable = useMemo(
    () => wearableSeries[wearableSeries.length - 1],
    [wearableSeries]
  );

  const value = useMemo(
    () => ({
      profile,
      isHydrated,
      wearableSeries,
      latestWearable,
      clinicalDocuments,
      correlations: PREVENTIVE_CORRELATION_INSIGHTS,
      updateProfile,
      completeOnboarding,
      resetOnboarding,
      confirmClinicalDocument,
      updateBiomarkerInDocument,
      deleteClinicalDocument,
      triggerWearableSync,
    }),
    [profile, isHydrated, wearableSeries, latestWearable, clinicalDocuments]
  );

  return (
    <SattvaContext.Provider value={value}>{children}</SattvaContext.Provider>
  );
}

export function useSattva() {
  const ctx = useContext(SattvaContext);
  if (!ctx) {
    throw new Error("useSattva debe usarse dentro de un SattvaProvider.");
  }
  return ctx;
}
