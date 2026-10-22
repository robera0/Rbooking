// src/superadmin/pages/ScannerPage.jsx
// Scanner tab: super-admin scoped ticket validation for ANY event (optional
// event dropdown, "All events" by default), camera + manual entry, result card
// and the recent-scan log.
// Maps to POST /api/superadmin/tickets/validate and GET /api/superadmin/events.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CameraOff, ChevronDown, ScanLine, ShieldAlert } from "lucide-react";
import { getEvents, validateTicket } from "../services/superadmin.service";
import { SCAN_STATUS } from "../constants";
import QrScanner from "../components/scanner/QrScanner";
import ManualEntry from "../components/scanner/ManualEntry";
import ScanResultCard from "../components/scanner/ScanResultCard";
import RecentScans from "../components/scanner/RecentScans";
import EmptyState from "../components/common/EmptyState";

/* Ignore the same camera decode for a moment so one QR isn't read twice. */
const CAMERA_COOLDOWN_MS = 2000;

export default function ScannerPage() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventId, setEventId] = useState("all");

  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [scans, setScans] = useState([]);

  const [cameraIssue, setCameraIssue] = useState("");
  const [cameraKey, setCameraKey] = useState(0);

  const cooldownRef = useRef(new Map());
  const validatingRef = useRef(false);

  /* ── event scope options ── */
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await getEvents();
        if (!active) return;
        setEvents(response.events);
      } catch {
        if (active) setEvents([]);
      } finally {
        if (active) setLoadingEvents(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const eventOptions = useMemo(
    () => events.map((event) => ({ id: event.id, name: event.name })),
    [events],
  );

  /* ── validation ── */
  const validate = useCallback(
    async (rawCode) => {
      const code = String(rawCode || "").trim();
      if (!code || validatingRef.current) return;

      validatingRef.current = true;
      setValidating(true);

      try {
        const response = await validateTicket(
          code,
          eventId === "all" ? null : eventId,
        );
        const entry = { ...response, code };

        setResult(entry);
        setScans((previous) => [entry, ...previous]);

        if (response.status === SCAN_STATUS.valid) {
          toast.success(`${code} · valid`);
        } else if (response.status === SCAN_STATUS.used) {
          toast(`${code} · already used`, { icon: "⚠️" });
        } else {
          toast.error(`${code} · invalid`);
        }
      } catch {
        toast.error("Could not validate this ticket");
      } finally {
        validatingRef.current = false;
        setValidating(false);
      }
    },
    [eventId],
  );

  const handleDecode = useCallback(
    (decodedText) => {
      const key = String(decodedText || "").trim().toUpperCase();
      const now = Date.now();
      const lastSeen = cooldownRef.current.get(key) || 0;

      if (now - lastSeen < CAMERA_COOLDOWN_MS) return;
      cooldownRef.current.set(key, now);

      void validate(decodedText);
    },
    [validate],
  );

  const handleManualSubmit = useCallback(
    (code) => {
      void validate(code);
    },
    [validate],
  );

  const handleUnavailable = useCallback((message) => {
    setCameraIssue(message);
  }, []);

  const handleReady = useCallback(() => {
    setCameraIssue("");
  }, []);

  const retryCamera = useCallback(() => {
    setCameraIssue("");
    setCameraKey((key) => key + 1);
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-black uppercase tracking-tighter text-2xl text-white sm:text-3xl">
            Scanner
          </h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Validate tickets for any event
          </p>
        </div>

        {/* Event scope */}
        <div className="w-full sm:w-80">
          <label
            htmlFor="superadmin-scanner-event"
            className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600"
          >
            Event scope
          </label>

          <div className="relative">
            <select
              id="superadmin-scanner-event"
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
              disabled={loadingEvents}
              aria-label="Limit scans to one event"
              className="h-12 w-full appearance-none rounded-2xl border border-white/[0.06] bg-[#1C1F22] px-4 pr-11 text-sm font-bold text-white focus:outline-none focus-visible:border-[#FF7A00]/50 focus-visible:ring-2 focus-visible:ring-[#FF7A00]/50 disabled:opacity-50"
            >
              <option value="all">
                {loadingEvents ? "Loading events…" : "All events"}
              </option>
              {eventOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>

            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* Left: camera or fallback */}
        <section className="rounded-[2rem] border border-white/[0.06] bg-[#1C1F22] p-4 sm:p-5">
          {cameraIssue ? (
            <div>
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-[#FF7A00]/25 bg-[#FF7A00]/10 p-4"
              >
                <CameraOff
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#FF9A3D]"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-black uppercase tracking-tighter text-sm text-[#FFB066]">
                    Camera unavailable
                  </p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-[#FFB066]/80">
                    {cameraIssue}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={retryCamera}
                aria-label="Retry camera access"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-white/[0.16] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
              >
                Retry camera
              </button>

              <div className="mt-5 border-t border-white/[0.06] pt-5">
                <ManualEntry onSubmit={handleManualSubmit} busy={validating} />
              </div>
            </div>
          ) : (
            <QrScanner
              key={cameraKey}
              onDecode={handleDecode}
              onUnavailable={handleUnavailable}
              onReady={handleReady}
            />
          )}
        </section>

        {/* Right: result, manual entry, recent scans */}
        <div className="grid content-start gap-5">
          <div>
            {result ? (
              <ScanResultCard result={result} />
            ) : (
              <EmptyState
                icon={ScanLine}
                title="Waiting for a scan"
                message="Point the camera at a ticket QR code, or validate a code manually."
                className="py-12"
              />
            )}
          </div>

          {cameraIssue ? null : (
            <section className="rounded-[2rem] border border-white/[0.06] bg-[#1C1F22] p-4 sm:p-5">
              <ManualEntry onSubmit={handleManualSubmit} busy={validating} />
            </section>
          )}

          {validating ? (
            <p
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500"
            >
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Checking ticket…
            </p>
          ) : null}

          <RecentScans scans={scans} onClear={() => setScans([])} />
        </div>
      </div>
    </div>
  );
}
