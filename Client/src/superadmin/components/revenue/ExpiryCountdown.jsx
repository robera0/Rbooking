// src/superadmin/components/revenue/ExpiryCountdown.jsx
// Live mm:ss countdown for a pending ticket, coloured/pulsed by the expiry tone.
// Maps to pendingTicket.expiresAt from GET /api/superadmin/pending-tickets.

import { Timer, TimerOff } from "lucide-react";
import useCountdown from "../../hooks/useCountdown";
import {
  expiryProgress,
  formatCountdown,
  getExpiryTone,
} from "../../utils/expiry";

export default function ExpiryCountdown({
  expiresAt,
  windowMinutes = 60,
  className = "",
}) {
  const { remainingMs, expired } = useCountdown(expiresAt);

  const minutes = expired ? 0 : Math.max(1, Math.ceil(remainingMs / 60000));
  const tone = getExpiryTone(minutes);
  const progress = expired ? 0 : expiryProgress(expiresAt, windowMinutes);
  const Icon = expired ? TimerOff : Timer;

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`Expiry: ${tone.label}`}
      className={`rounded-2xl border p-3 ${tone.chipClass} ${tone.glowClass} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          <Icon className={`h-3.5 w-3.5 ${tone.textClass}`} aria-hidden="true" />
          Time to expire
        </span>

        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${tone.textClass} ${
            tone.pulse ? "animate-pulse" : ""
          }`}
        >
          {tone.pulse ? (
            <span
              className="h-1.5 w-1.5 rounded-full bg-current"
              aria-hidden="true"
            />
          ) : null}
          {tone.label}
        </span>
      </div>

      <p
        className={`mt-2 font-black leading-none tracking-tighter tabular-nums text-2xl ${tone.textClass}`}
      >
        {formatCountdown(remainingMs)}
      </p>

      <div
        className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${tone.trackClass}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${tone.barClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        {tone.hint}
      </p>
    </div>
  );
}
