// src/superadmin/utils/expiry.js
// Expiry math + tone mapping for pending tickets (countdown colors and pulse).
// Maps to the `expiresAt` field of GET /api/superadmin/pending-tickets.

import { EXPIRY_THRESHOLDS } from "../constants";

/* Raw milliseconds between now and expiresAt (negative when already expired). */
export const remainingMs = (expiresAt) => {
  if (!expiresAt) return 0;
  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) return 0;
  return target - Date.now();
};

export const isExpired = (expiresAt) => remainingMs(expiresAt) <= 0;

/* Whole minutes left, rounded UP so 43s left reads as "1 min left". 0 == expired. */
export const minutesLeft = (expiresAt) => {
  const ms = remainingMs(expiresAt);
  if (ms <= 0) return 0;
  return Math.ceil(ms / 60000);
};

/* Whole seconds left (used by the live countdown). 0 == expired. */
export const secondsLeft = (expiresAt) => {
  const ms = remainingMs(expiresAt);
  if (ms <= 0) return 0;
  return Math.ceil(ms / 1000);
};

/* mm:ss label for the live countdown. */
export const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

/*
 * getExpiryTone(minutesLeft) -> visual tone descriptor.
 *   > 10 min -> calm     (green / gray, steady)
 *   5-10 min -> warning  (orange)
 *   < 5 min  -> critical (red, pulsing)
 *   0 / past -> expired  ("EXPIRED")
 */
export const getExpiryTone = (minutes) => {
  const value = Number.isFinite(minutes) ? minutes : 0;

  if (value <= 0) {
    return {
      key: "expired",
      label: "EXPIRED",
      hint: "hold timed out",
      textClass: "text-red-500",
      chipClass: "border-red-500/30 bg-red-500/10 text-red-400",
      trackClass: "bg-red-500/15",
      barClass: "bg-red-500",
      glowClass: "shadow-[0_0_18px_-6px_rgba(239,68,68,0.75)]",
      pulse: false,
    };
  }

  if (value > EXPIRY_THRESHOLDS.calmAbove) {
    return {
      key: "calm",
      label: `${value} min left`,
      hint: "minutes left to expire",
      textClass: "text-emerald-400",
      chipClass: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      trackClass: "bg-emerald-400/15",
      barClass: "bg-emerald-400",
      glowClass: "shadow-[0_0_18px_-6px_rgba(94,199,80,0.6)]",
      pulse: false,
    };
  }

  if (value > EXPIRY_THRESHOLDS.warningAbove) {
    return {
      key: "warning",
      label: `${value} min left`,
      hint: "minutes left to expire",
      textClass: "text-[#FF9A3D]",
      chipClass: "border-[#FF7A00]/30 bg-[#FF7A00]/10 text-[#FF9A3D]",
      trackClass: "bg-[#FF7A00]/15",
      barClass: "bg-[#FF7A00]",
      glowClass: "shadow-[0_0_18px_-6px_rgba(255,122,0,0.7)]",
      pulse: false,
    };
  }

  return {
    key: "critical",
    label: `${value} min left`,
    hint: "minutes left to expire",
    textClass: "text-red-400",
    chipClass: "border-red-500/30 bg-red-500/10 text-red-400",
    trackClass: "bg-red-500/15",
    barClass: "bg-red-500",
    glowClass: "shadow-[0_0_22px_-4px_rgba(239,68,68,0.85)]",
    pulse: true,
  };
};

/* Progress (0-100) of the remaining window, used for the countdown bar. */
export const expiryProgress = (expiresAt, windowMinutes = 60) => {
  const ms = remainingMs(expiresAt);
  if (ms <= 0) return 0;
  const windowMs = windowMinutes * 60000;
  return Math.max(0, Math.min(100, Math.round((ms / windowMs) * 100)));
};
