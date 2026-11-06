import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Apple WWDC Fluid Interface Spring Presets
 * - Critically damped (bounce: 0): Default for UI transitions, sheets, modals, tabs.
 * - Momentum spring (bounce: 0.16): Used when gesture velocity or physical throw precedes motion.
 */
export const APPLE_SPRING_DEFAULT = {
  type: "spring" as const,
  bounce: 0,
  duration: 0.38,
};

export const APPLE_SPRING_SNAPPY = {
  type: "spring" as const,
  bounce: 0,
  duration: 0.28,
};

export const APPLE_SPRING_SHEET = {
  type: "spring" as const,
  damping: 32,
  stiffness: 380,
  mass: 0.8,
};

export function formatDateEs(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatShortDateEs(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
  }).format(date);
}
