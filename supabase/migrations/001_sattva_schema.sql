-- =============================================================================
-- SattvaHealth — Medicine 3.0 Database Schema & Storage Provisioning
-- =============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- 1. PROFILES TABLE (Patient 0 & Users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null,
  age integer check (age > 0 and age < 130),
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  gender text check (gender in ('male', 'female', 'other')),
  avatar_url text,
  onboarding_completed boolean default false,
  fitbit_connected boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. WEARABLE METRICS TABLE (Daily & Intraday High-Frequency Time Series)
create table if not exists public.wearable_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recorded_date date not null,
  strain_score numeric(4,1) not null check (strain_score >= 0 and strain_score <= 21),
  recovery_score integer not null check (recovery_score >= 0 and recovery_score <= 100),
  sleep_score integer not null check (sleep_score >= 0 and sleep_score <= 100),
  sleep_hours numeric(4,2),
  deep_sleep_pct integer,
  rem_sleep_pct integer,
  resting_hr numeric(5,1) not null,
  hrv_rmssd numeric(5,1) not null,
  spo2 numeric(4,1) not null,
  temp_variation numeric(4,2) default 0.0,
  steps integer default 0,
  active_calories integer default 0,
  intraday_timeseries jsonb default '[]'::jsonb,
  source text default 'fitbit',
  created_at timestamptz default now(),
  unique(user_id, recorded_date)
);

-- 3. CLINICAL DOCUMENTS TABLE (PDFs: Blood Work, Biochemistry, ECG, Holter)
create table if not exists public.clinical_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  document_type text not null check (document_type in ('blood_panel', 'biochemistry', 'lipid_profile', 'hormonal', 'ecg', 'holter', 'imaging', 'other')),
  laboratory_name text not null,
  physician_name text,
  document_date date not null,
  file_path text not null,
  file_url text not null,
  file_size_bytes integer,
  extraction_status text default 'verified' check (extraction_status in ('pending_review', 'verified', 'processing', 'error')),
  clinical_summary text,
  created_at timestamptz default now()
);

-- 4. BIOMARKERS TABLE (Standardized Clinical Indicators & Personal Baseline)
create table if not exists public.biomarkers (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.clinical_documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  name text not null,
  category text not null check (category in ('metabolic', 'cardiovascular', 'inflammatory', 'hormonal', 'hematologic', 'renal_hepatic', 'electrolytes', 'cardiac_electrophysiology')),
  numeric_value numeric(10,3) not null,
  unit text not null,
  ref_min numeric(10,3) not null,
  ref_max numeric(10,3) not null,
  personal_baseline numeric(10,3) not null,
  personal_sd numeric(10,3) default 1.0,
  status text not null check (status in ('optimal', 'baseline_drift', 'out_of_range')),
  user_verified boolean default true,
  measured_at date not null,
  created_at timestamptz default now()
);

-- Indexes for fast longitudinal time-series queries
create index if not exists idx_wearable_user_date on public.wearable_metrics(user_id, recorded_date desc);
create index if not exists idx_clinical_docs_user_date on public.clinical_documents(user_id, document_date desc);
create index if not exists idx_biomarkers_user_code_date on public.biomarkers(user_id, code, measured_at desc);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.wearable_metrics enable row level security;
alter table public.clinical_documents enable row level security;
alter table public.biomarkers enable row level security;

create policy "Users can view and update own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage own wearable metrics"
  on public.wearable_metrics for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own clinical documents"
  on public.clinical_documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own biomarkers"
  on public.biomarkers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Storage Bucket: medical-documents
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', false)
on conflict (id) do nothing;

create policy "Users can upload and read own medical PDFs"
  on storage.objects for all
  using (bucket_id = 'medical-documents' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'medical-documents' and auth.uid()::text = (storage.foldername(name))[1]);
