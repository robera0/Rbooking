// src/superadmin/hooks/useCountdown.js
// Live 1-second countdown for pending-ticket expiry. Cleans up its interval on
// unmount and whenever the target changes. Maps to pendingTicket.expiresAt.

import { useEffect, useMemo, useState } from "react";

const toTimestamp = (target) => {
  if (!target) return null;
  const ms = target instanceof Date ? target.getTime() : new Date(target).getTime();
  return Number.isNaN(ms) ? null : ms;
};

/**
 * useCountdown(target)
 * @param {string|number|Date|null} target expiry timestamp
 * @returns {{ remainingMs:number, totalSeconds:number, minutes:number, seconds:number, expired:boolean, running:boolean }}
 */
export default function useCountdown(target) {
  const timestamp = useMemo(() => toTimestamp(target), [target]);

  const computeRemaining = () =>
    timestamp === null ? 0 : Math.max(0, timestamp - Date.now());

  const [remainingMs, setRemainingMs] = useState(computeRemaining);
  const [running, setRunning] = useState(() => computeRemaining() > 0);

  useEffect(() => {
    if (timestamp === null) {
      setRemainingMs(0);
      setRunning(false);
      return undefined;
    }

    setRemainingMs(Math.max(0, timestamp - Date.now()));

    const id = setInterval(() => {
      const next = Math.max(0, timestamp - Date.now());
      setRemainingMs(next);
      if (next <= 0) {
        setRunning(false);
        clearInterval(id);
      }
    }, 1000);

    setRunning(Math.max(0, timestamp - Date.now()) > 0);

    return () => clearInterval(id);
  }, [timestamp]);

  const totalSeconds = Math.ceil(remainingMs / 1000);

  return {
    remainingMs,
    totalSeconds,
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
    expired: remainingMs <= 0,
    running,
  };
}
