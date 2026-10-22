// src/superadmin/utils/format.js
// Display helpers: currency (Birr), dates pinned to Africa/Addis_Ababa, relative
// time and avatar initials. No endpoint mapping — purely presentational.

import { CURRENCY, LOCALE, TIMEZONE } from "../constants";

/* Safely coerce anything into a Date (or null). */
const toDate = (input) => {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  if (input === null || input === undefined || input === "") return null;
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/* Cached Intl formatters keep list rendering cheap. */
const formatterCache = new Map();
const formatter = (options) => {
  const key = JSON.stringify(options);
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, ...options }),
    );
  }
  return formatterCache.get(key);
};

export const formatNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-US");
};

/* formatBirr(12500) -> "12,500 Birr" */
export const formatBirr = (value, { withCurrency = true } = {}) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  const formatted = safe.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return withCurrency ? `${formatted} ${CURRENCY}` : formatted;
};

/* Compact display for huge revenue numbers: 1,240,000 -> "1.24M" */
export const formatCompactBirr = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return `0 ${CURRENCY}`;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M ${CURRENCY}`;
  if (abs >= 10_000) return `${(n / 1_000).toFixed(1)}K ${CURRENCY}`;
  return formatBirr(n);
};

/*
 * formatDate(value, variant)
 *   "datetime"  -> "12 Oct 2026 • 18:30"
 *   "date"      -> "12 Oct 2026"
 *   "short"     -> "12 Oct"
 *   "time"      -> "18:30"
 *   "full"      -> "Monday, 12 October 2026"
 *   "day"       -> "MON"
 *   "dayNumber" -> "12"
 *   "month"     -> "OCT"
 */
export const formatDate = (input, variant = "datetime") => {
  const date = toDate(input);
  if (!date) return "—";

  try {
    switch (variant) {
      case "date":
        return formatter({
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date);
      case "short":
        return formatter({ day: "numeric", month: "short" }).format(date);
      case "time":
        return formatter({
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(date);
      case "full":
        return formatter({
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);
      case "day":
        return formatter({ weekday: "short" }).format(date).toUpperCase();
      case "dayNumber":
        return formatter({ day: "2-digit" }).format(date);
      case "month":
        return formatter({ month: "short" }).format(date).toUpperCase();
      case "datetime":
      default:
        return `${formatter({
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date)} • ${formatter({
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(date)}`;
    }
  } catch {
    return date.toISOString();
  }
};

/* past -> "12 min ago" · future -> "in 4 min" · <45s -> "just now" */
export const timeAgo = (input) => {
  const date = toDate(input);
  if (!date) return "—";

  const diffMs = Date.now() - date.getTime();
  const isFuture = diffMs < 0;
  const seconds = Math.floor(Math.abs(diffMs) / 1000);

  if (seconds < 45) return "just now";

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let value;
  if (minutes < 60) value = `${Math.max(1, minutes)} min`;
  else if (hours < 24) value = `${hours} hr`;
  else if (days < 30) value = `${days} day${days === 1 ? "" : "s"}`;
  else value = `${Math.floor(days / 30)} mo`;

  return isFuture ? `in ${value}` : `${value} ago`;
};

/* "Hana Bekele" -> "HB" · "Selam" -> "SE" · "" -> "?" */
export const initials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

/* Clamp long text for card titles / drawer rows. */
export const truncate = (value, max = 44) => {
  if (!value || typeof value !== "string") return "";
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

/* Safe percentage for progress bars. */
export const percent = (part, total) => {
  const p = Number(part);
  const t = Number(total);
  if (!Number.isFinite(p) || !Number.isFinite(t) || t <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((p / t) * 100)));
};
