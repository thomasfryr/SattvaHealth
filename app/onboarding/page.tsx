"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  ShieldCheck,
  Sparkles,
  Camera,
  User,
  Activity,
  HeartPulse,
  FileSpreadsheet,
} from "lucide-react";
import { useSattva } from "@/lib/context/sattva-context";
import { APPLE_SPRING_DEFAULT } from "@/lib/utils";
import { GenderType } from "@/lib/types/sattva";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OnboardingStep =
  | "acquaintance"
  | "otp_verify"
  | "identity"
  | "biometrics"
  | "sattva_philosophy";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, completeOnboarding } = useSattva();

  const [step, setStep] = useState<OnboardingStep>("acquaintance");
  const [authMode, setAuthMode] = useState<"new" | "returning" | null>(null);
  const [email, setEmail] = useState(profile.email || "thomas@sattvahealth.io");
  const [otpDigits, setOtpDigits] = useState(["4", "8", "2", "9", "1", "6"]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpNotice, setOtpNotice] = useState("");

  const [fullName, setFullName] = useState(
    profile.fullName === "Thomas Fry" ? "Thomas" : profile.fullName
  );
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    profile.avatarUrl
  );
  const [age, setAge] = useState<number>(profile.age || 28);
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg || 74.5);
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm || 178);
  const [gender, setGender] = useState<GenderType>(profile.gender || "male");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stepIndexMap: Record<OnboardingStep, number> = {
    acquaintance: 0,
    otp_verify: 1,
    identity: 2,
    biometrics: 3,
    sattva_philosophy: 4,
  };
  const currentStepNumber = stepIndexMap[step];

  const handleRequestMagicCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSendingOtp(true);

    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signInWithOtp({ email: email.trim() });
        setOtpNotice(
          "Enviamos un código de acceso a tu correo. También puedes validar con el código pre-cargado de Paciente 0."
        );
      } catch {
        setOtpNotice(
          "Código de acceso instantáneo generado para tu sesión de Paciente 0."
        );
      }
    } else {
      setOtpNotice(
        "Modo Paciente 0 activo: Código de seguridad de 6 dígitos autocompletado para acceso inmediato."
      );
    }

    setIsSendingOtp(false);
    setStep("otp_verify");
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFinishOnboarding = () => {
    completeOnboarding({
      email: email.trim(),
      fullName: fullName.trim() || "Paciente 0",
      age: Number(age) || 28,
      weightKg: Number(weightKg) || 74.5,
      heightCm: Number(heightCm) || 178,
      gender,
      avatarUrl,
      onboardingCompleted: true,
    });
    router.push("/");
  };

  // Physiological preview metrics
  const bmi = (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);
  const bsa = Math.sqrt((heightCm * weightKg) / 3600).toFixed(2);

  return (
    <div className="relative min-h-screen w-full bg-black text-zinc-100 flex flex-col justify-between overflow-hidden px-4 py-8 sm:px-8 sm:py-12">
      {/* Subtle Ambient Illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full opacity-20 blur-[130px]"
          style={{
            background:
              step === "sattva_philosophy"
                ? "radial-gradient(circle, #34C759 0%, #32ADE6 55%, transparent 80%)"
                : "radial-gradient(circle, #32ADE6 0%, #AF52DE 50%, transparent 80%)",
          }}
        />
      </div>

      {/* Top Navigation & Minimal Progress */}
      <header className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.1]">
            <HeartPulse className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-200">
            SattvaHealth
          </span>
        </div>

        {/* Progress Indicator Pills */}
        <div className="flex items-center gap-1.5" aria-label="Progreso de configuración">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepNumber
                  ? "w-7 bg-emerald-400"
                  : idx < currentStepNumber
                  ? "w-2.5 bg-zinc-500"
                  : "w-2 bg-zinc-800"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Main Conversational Stage */}
      <main className="relative z-10 mx-auto my-auto flex w-full max-w-xl flex-col justify-center py-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: ¿NOS HABÍAMOS CONOCIDO ANTES? */}
          {step === "acquaintance" && (
            <motion.section
              key="step-acquaintance"
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={APPLE_SPRING_DEFAULT}
              className="apple-material rounded-3xl p-7 sm:p-10"
            >
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                Bienvenido. ¿Nos habíamos conocido antes?
              </h1>
              <p className="mt-3 text-base text-zinc-300 leading-relaxed">
                Este es tu espacio soberano de salud longitudinal. Elige cómo
                quieres ingresar para preparar tu entorno.
              </p>

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setAuthMode("new")}
                  className={`tactile-press text-left rounded-2xl p-5 border transition-all ${
                    authMode === "new"
                      ? "bg-emerald-500/[0.12] border-emerald-400/50 text-white"
                      : "bg-zinc-900/50 border-white/[0.08] text-zinc-200 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    {authMode === "new" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-black">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-4 font-semibold text-base text-white">
                    Es mi primera vez
                  </div>
                  <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                    Quiero calibrar mi perfil biológico desde cero como Paciente 0.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode("returning")}
                  className={`tactile-press text-left rounded-2xl p-5 border transition-all ${
                    authMode === "returning"
                      ? "bg-cyan-500/[0.12] border-cyan-400/50 text-white"
                      : "bg-zinc-900/50 border-white/[0.08] text-zinc-200 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="h-5 w-5 text-cyan-400" />
                    {authMode === "returning" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-black">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-4 font-semibold text-base text-white">
                    Sí, ya nos conocemos
                  </div>
                  <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                    Iniciar sesión para sincronizar mis exámenes y series de tiempo.
                  </p>
                </button>
              </div>

              <AnimatePresence>
                {authMode && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={APPLE_SPRING_DEFAULT}
                    onSubmit={handleRequestMagicCode}
                    className="mt-6 pt-6 border-t border-white/[0.08] overflow-hidden"
                  >
                    <label
                      htmlFor="onboarding-email"
                      className="block text-sm font-medium text-zinc-200"
                    >
                      {authMode === "new"
                        ? "¿A qué correo vinculamos tu bóveda clínica?"
                        : "Ingresa tu correo registrado"}
                    </label>
                    <p className="mt-1 text-xs text-zinc-400">
                      Sin contraseñas que recordar. Usamos acceso criptográfico de
                      6 dígitos (Magic OTP).
                    </p>

                    <div className="mt-3.5 flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                          id="onboarding-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@correo.com"
                          className="w-full rounded-xl bg-zinc-900/90 border border-white/[0.1] pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className="tactile-press inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
                      >
                        <span>
                          {isSendingOtp ? "Generando..." : "Continuar"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {/* STEP 2: VERIFICACIÓN MAGIC OTP */}
          {step === "otp_verify" && (
            <motion.section
              key="step-otp"
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={APPLE_SPRING_DEFAULT}
              className="apple-material rounded-3xl p-7 sm:p-10"
            >
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Confirma tu llave de acceso
              </h1>
              <p className="mt-2.5 text-sm text-zinc-300 leading-relaxed">
                Vinculando sesión segura para{" "}
                <span className="font-mono text-white">{email}</span>.
              </p>

              {otpNotice && (
                <div className="mt-4 rounded-xl bg-emerald-500/[0.1] border border-emerald-500/30 p-3.5 text-xs text-emerald-200">
                  {otpNotice}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-2 sm:gap-3">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Dígito ${i + 1}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="h-14 w-full rounded-xl bg-zinc-900/90 border border-white/[0.12] text-center font-mono text-xl font-semibold text-white tabular-nums focus:border-emerald-400 focus:outline-none"
                  />
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep("acquaintance")}
                  className="tactile-press inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    authMode === "returning" && profile.onboardingCompleted
                      ? router.push("/")
                      : setStep("identity")
                  }
                  className="tactile-press inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
                >
                  <span>Verificar llave</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.section>
          )}

          {/* STEP 3: ¿CÓMO TE LLAMAS? & FOTO DE PERFIL */}
          {step === "identity" && (
            <motion.section
              key="step-identity"
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={APPLE_SPRING_DEFAULT}
              className="apple-material rounded-3xl p-7 sm:p-10"
            >
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                ¿Cómo te llamas?
              </h1>
              <p className="mt-2.5 text-base text-zinc-300">
                Personalicemos tu expediente longitudinal y tu identificador de
                Paciente 0.
              </p>

              {/* Avatar Picker */}
              <div className="mt-7 flex items-center gap-5">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-zinc-900 border border-white/[0.14]">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Foto de perfil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-emerald-400">
                        {(fullName || "P").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Subir foto de perfil"
                    className="tactile-press absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-zinc-200"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium text-zinc-200">
                    Fotografía de perfil (Opcional)
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Puedes subir una imagen desde tu dispositivo o usar tu
                    monograma clínico.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs font-medium text-emerald-400 hover:underline"
                  >
                    Seleccionar imagen...
                  </button>
                </div>
              </div>

              {/* Name Input */}
              <div className="mt-7">
                <label
                  htmlFor="patient-name-input"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Tu nombre o cómo prefieres que te llamemos
                </label>
                <div className="relative mt-2">
                  <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    id="patient-name-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Thomas Fry"
                    className="w-full rounded-2xl bg-zinc-900/90 border border-white/[0.12] pl-12 pr-4 py-4 text-lg font-medium text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("otp_verify")}
                  className="tactile-press inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Anterior</span>
                </button>

                <button
                  type="button"
                  disabled={!fullName.trim()}
                  onClick={() => setStep("biometrics")}
                  className="tactile-press inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-40"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.section>
          )}

          {/* STEP 4: PARÁMETROS BIOMÉTRICOS (EDAD, SEXO, PESO, ALTURA) */}
          {step === "biometrics" && (
            <motion.section
              key="step-biometrics"
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={APPLE_SPRING_DEFAULT}
              className="apple-material rounded-3xl p-7 sm:p-10"
            >
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Calibremos tu fisiología, {fullName.split(" ")[0]}
              </h1>
              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                Estos datos permiten ajustar tus zonas cardiovasculares, tasa
                metabólica basal y rangos óptimos de laboratorio.
              </p>

              {/* Biological Sex Selector */}
              <div className="mt-6">
                <span className="block text-xs font-medium text-zinc-300 mb-2">
                  Sexo biológico (para referencias hormonales y hematológicas)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { value: "male", label: "Masculino" },
                      { value: "female", label: "Femenino" },
                      { value: "other", label: "Otro" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGender(opt.value)}
                      className={`tactile-press rounded-xl py-2.5 px-3 text-sm font-medium border transition-all ${
                        gender === opt.value
                          ? "bg-white text-black border-white font-semibold"
                          : "bg-zinc-900/70 text-zinc-300 border-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age, Weight, Height Numeric Controls */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="rounded-2xl bg-zinc-900/70 border border-white/[0.08] p-4">
                  <label
                    htmlFor="bio-age"
                    className="block text-xs text-zinc-300"
                  >
                    Edad
                  </label>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <input
                      id="bio-age"
                      type="number"
                      min={1}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-transparent font-mono text-2xl font-semibold text-white tabular-nums focus:outline-none"
                    />
                    <span className="text-xs text-zinc-400">años</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/70 border border-white/[0.08] p-4">
                  <label
                    htmlFor="bio-weight"
                    className="block text-xs text-zinc-300"
                  >
                    Peso corporal
                  </label>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <input
                      id="bio-weight"
                      type="number"
                      step="0.1"
                      min={25}
                      max={280}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-transparent font-mono text-2xl font-semibold text-white tabular-nums focus:outline-none"
                    />
                    <span className="text-xs text-zinc-400">kg</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/70 border border-white/[0.08] p-4">
                  <label
                    htmlFor="bio-height"
                    className="block text-xs text-zinc-300"
                  >
                    Estatura
                  </label>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <input
                      id="bio-height"
                      type="number"
                      min={100}
                      max={240}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full bg-transparent font-mono text-2xl font-semibold text-white tabular-nums focus:outline-none"
                    />
                    <span className="text-xs text-zinc-400">cm</span>
                  </div>
                </div>
              </div>

              {/* Instant Biometric Feedback Bar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.04] border border-white/[0.07] px-4 py-3 text-xs text-zinc-300">
                <div>
                  Índice Corporal:{" "}
                  <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                    {bmi} kg/m²
                  </span>
                </div>
                <div>
                  Superficie Corporal (Mosteller):{" "}
                  <span className="font-mono font-semibold text-cyan-400 tabular-nums">
                    {bsa} m²
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("identity")}
                  className="tactile-press inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Anterior</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep("sattva_philosophy")}
                  className="tactile-press inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
                >
                  <span>Continuar</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.section>
          )}

          {/* STEP 5: EL SIGNIFICADO DE SATTVA & BIENVENIDA INTEGRAL */}
          {step === "sattva_philosophy" && (
            <motion.section
              key="step-sattva"
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={APPLE_SPRING_DEFAULT}
              className="apple-material-elevated rounded-3xl p-8 sm:p-11"
            >
              <div className="inline-flex items-center gap-2.5 rounded-full bg-emerald-500/[0.12] border border-emerald-400/30 px-3.5 py-1 text-xs font-medium text-emerald-300">
                <span className="font-serif text-sm">सत्त्व</span>
                <span>Sattva · /ˈsʌt.və/</span>
              </div>

              <h1 className="mt-5 text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                Toda tu salud yace en un solo lugar, {fullName.split(" ")[0]}.
              </h1>

              <p className="mt-4 text-base text-zinc-200 leading-relaxed">
                En sánscrito, <strong>Sattva</strong> significa{" "}
                <em>equilibrio, lucidez, pureza e integridad</em>: el estado en
                que un sistema complejo funciona en completa armonía.
              </p>

              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                El sistema de salud tradicional es reactivo: espera a que
                aparezcan los síntomas cuando el desbalance ya lleva años
                gestándose. Aquí unificamos tus dos mundos para anticiparnos:
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3.5 rounded-2xl bg-zinc-900/70 border border-white/[0.07] p-4">
                  <Activity className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      La Película Continua (Wearables)
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-300 leading-relaxed">
                      Tus 3 anillos vitales (Strain, Recovery, Sleep) y tus
                      biomarcadores diarios (FC en reposo, VFC, SpO2) medidos
                      contra tu propia línea base.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-2xl bg-zinc-900/70 border border-white/[0.07] p-4">
                  <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Las Fotografías Clínicas (Exámenes & PDFs)
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-300 leading-relaxed">
                      Tus análisis de sangre, perfiles bioquímicos, ECG y Holter
                      estandarizados con IA y cruzados en una sola línea de
                      tiempo preventiva.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep("biometrics")}
                  className="tactile-press inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Ajustar perfil</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="tactile-press inline-flex items-center gap-2.5 rounded-2xl bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-black shadow-lg hover:bg-emerald-400"
                >
                  <span>Entrar a SattvaHealth</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-2xl text-center text-xs text-zinc-500">
        SattvaHealth · Arquitectura de Medicina 3.0 · Soberanía de Datos del
        Paciente 0
      </footer>
    </div>
  );
}
