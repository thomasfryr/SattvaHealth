import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SattvaProvider } from "@/lib/context/sattva-context";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SattvaHealth — Inteligencia de Salud Longitudinal (Medicina 3.0)",
  description:
    "Plataforma preventiva e integral para el Paciente 0. Unificación de series temporales de wearables (Fitbit / Google Health) y exámenes clínicos estandarizados con IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${jakarta.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-black text-zinc-100 selection:bg-emerald-500/25 selection:text-white antialiased">
        <SattvaProvider>{children}</SattvaProvider>
      </body>
    </html>
  );
}
