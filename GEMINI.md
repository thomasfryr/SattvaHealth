# SattvaHealth — Project Directives & Engineering Standards

## 1. Vision & Core Philosophy
**SattvaHealth** is an all-in-one personal health intelligence platform designed for **Medicine 3.0** (proactive, predictive, and personalized).
- **Patient 0 Centric**: Built around the user's complete longitudinal health data.
- **Data Fusion**: Unifies high-frequency time-series data from wearables (Fitbit / Google Health) with discrete, high-resolution clinical data (Blood work, biochemistry, ECG, Holter PDFs extracted via AI).
- **Proactive Baseline Tracking**: Detect shifts and velocity of change against the patient's **personal baseline**, rather than waiting for values to fall out of generic, population-wide reference ranges.

---

## 2. Design System & Aesthetics: Apple Human Interface Guidelines (HIG)
**Mandatory Aesthetic Standard**: All web and mobile interfaces MUST adhere to Apple's design philosophy and Apple Health design tokens:
- **Cleanliness & Breathing Room**: Generous padding, structured whitespace, zero visual clutter.
- **Surfaces & Vibrancy**: Dark mode base in pure black (`#000000`) or deep zinc (`#09090b`), translucent floating surfaces (`bg-zinc-900/60` with `backdrop-blur-xl`), and hairline borders (`border-white/[0.08]`).
- **Apple Health Semantic Palette**:
  - Heart / Cardio / ECG: `#FF2D55` (Cardio Rose)
  - VFC (HRV) / Autonomic: `#FF9500` (Orange/Amber)
  - Sleep & Recovery: `#AF52DE` (Lavender/Purple)
  - Metabolic / Blood Biomarkers (Optimal): `#34C759` (Apple Mint Green)
  - Anomalies / Drift Warning: `#FFCC00` (Warning Gold) / `#FF3B30` (Coral Red)
  - Clinical Data / Reports: `#32ADE6` (Clinical Cyan)
- **Micro-interactions**: Spring physics (`framer-motion`), tactile active states (`active:scale-[0.98]`).
- **Data Visualization**: Elegant minimal charts (gradient area fills, glowing sparklines, no aggressive gridlines, floating iOS widget-style tooltips).
- Reference rule file: `.agents/rules/apple-design-system.md`.

---

## 3. Recommended Technology Stack
- **Frontend (Web)**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Radix UI / Shadcn primitives, Framer Motion.
- **Charts / Viz**: Recharts / Tremor customized with Apple Health aesthetic.
- **Backend & Database**: Supabase (PostgreSQL, Storage for PDFs, Auth, Edge Functions, Timescale/Time-series extensions).
- **AI / Ingestion Engine**: Gemini Vision / LLM structured extraction (JSON Schema for biomarker normalization).
- **Wearable Integration**: Fitbit Web API (OAuth2) / Google Health Connect.
