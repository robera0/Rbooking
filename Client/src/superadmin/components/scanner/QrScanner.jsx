// src/superadmin/components/scanner/QrScanner.jsx
// Camera QR reader built on html5-qrcode. Starts on mount, pauses after every
// decode (so the same QR isn't re-read while the result is on screen) and always
// stops + clears the instance on unmount. Reports a friendly message through
// onUnavailable() when the camera is missing or permission is denied.
// Maps to POST /api/superadmin/tickets/validate (the page calls it).

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, Loader2, Play, RotateCcw } from "lucide-react";

const READER_ID = "superadmin-qr-reader";

/* Turn browser/quirk errors into copy a human can act on. */
const toFriendlyMessage = (error) => {
  const name = error?.name || "";
  const raw = String(error?.message || "");

  if (name === "NotAllowedError" || /denied|permission/i.test(raw)) {
    return "Camera permission was denied. Allow camera access in your browser settings, or enter the ticket code manually.";
  }
  if (name === "NotFoundError" || /no camera|not found/i.test(raw)) {
    return "No camera was found on this device. Enter the ticket code manually below.";
  }
  if (name === "NotReadableError" || /in use|readable|track start/i.test(raw)) {
    return "The camera is busy in another app or tab. Close it and retry, or enter the code manually.";
  }
  if (name === "NotSupportedError" || /unsupported|not supported/i.test(raw)) {
    return "This browser does not support in-page QR scanning. Enter the ticket code manually below.";
  }
  return "The camera could not be started. Enter the ticket code manually below.";
};

const STATUS_LABELS = {
  starting: "Starting camera…",
  scanning: "Scanning",
  paused: "Paused",
  stopped: "Stopped",
  error: "Camera unavailable",
};

const STATUS_TONES = {
  starting: "border-white/10 bg-white/5 text-gray-300",
  scanning: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  paused: "border-[#FF7A00]/30 bg-[#FF7A00]/10 text-[#FF9A3D]",
  stopped: "border-white/10 bg-white/5 text-gray-400",
  error: "border-red-500/25 bg-red-500/10 text-red-400",
};

export default function QrScanner({ onDecode, onUnavailable, onReady }) {
  const instanceRef = useRef(null);
  const isRunningRef = useRef(false);
  const mountedRef = useRef(true);

  const [status, setStatus] = useState("starting");
  const [message, setMessage] = useState("");

  /* Keep the latest callbacks without restarting the camera. */
  const decodeRef = useRef(onDecode);
  const unavailableRef = useRef(onUnavailable);
  const readyRef = useRef(onReady);

  useEffect(() => {
    decodeRef.current = onDecode;
  }, [onDecode]);

  useEffect(() => {
    unavailableRef.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const disposeInstance = useCallback(async () => {
    const instance = instanceRef.current;
    if (!instance) return;

    try {
      if (isRunningRef.current) await instance.stop();
      instance.clear();
    } catch {
      /* already stopped / cleared — nothing to do */
    } finally {
      isRunningRef.current = false;
      instanceRef.current = null;
    }
  }, []);

  const handleDecode = useCallback((decodedText) => {
    const instance = instanceRef.current;

    if (instance && isRunningRef.current) {
      try {
        instance.pause(true);
        if (mountedRef.current) setStatus("paused");
      } catch {
        /* pausing is best-effort; the decode still goes through */
      }
    }

    decodeRef.current?.(decodedText);
  }, []);

  const start = useCallback(async () => {
    if (mountedRef.current) {
      setStatus("starting");
      setMessage("");
    }

    try {
      if (typeof Html5Qrcode === "undefined") {
        throw new Error("QR scanning is not supported in this browser");
      }

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        const error = new Error("No camera found on this device");
        error.name = "NotFoundError";
        throw error;
      }

      await disposeInstance();

      const instance = new Html5Qrcode(READER_ID);
      instanceRef.current = instance;

      await instance.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        handleDecode,
        () => {
          /* per-frame misses are normal — ignore them */
        },
      );

      isRunningRef.current = true;

      if (!mountedRef.current) {
        await disposeInstance();
        return;
      }

      setStatus("scanning");
      readyRef.current?.();
    } catch (error) {
      await disposeInstance();

      const friendly = toFriendlyMessage(error);

      if (mountedRef.current) {
        setStatus("error");
        setMessage(friendly);
      }

      unavailableRef.current?.(friendly);
    }
  }, [disposeInstance, handleDecode]);

  const stop = useCallback(async () => {
    await disposeInstance();
    if (mountedRef.current) setStatus("stopped");
  }, [disposeInstance]);

  const resume = useCallback(async () => {
    const instance = instanceRef.current;

    if (!instance || !isRunningRef.current) {
      await start();
      return;
    }

    try {
      instance.resume();
      if (mountedRef.current) setStatus("scanning");
    } catch {
      await start();
    }
  }, [start]);

  /* Auto-start once, and always clean the camera up on unmount. */
  useEffect(() => {
    void start();
    return () => {
      void disposeInstance();
    };
  }, [start, disposeInstance]);

  const tone = STATUS_TONES[status] || STATUS_TONES.stopped;
  const showOverlay = status === "starting" || status === "paused";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
          Camera
        </p>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${tone}`}
          role="status"
          aria-live="polite"
        >
          {status === "starting" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          )}
          {STATUS_LABELS[status] || status}
        </span>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#121417]">
        <div
          id={READER_ID}
          className="min-h-[260px] w-full [&_video]:w-full [&_video]:rounded-[1.5rem]"
        />

        {showOverlay ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#121417]/85 px-6 text-center backdrop-blur-sm">
            {status === "paused" ? (
              <>
                <CameraOff className="h-7 w-7 text-[#FF9A3D]" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
                  Paused · result captured
                </p>
                <p className="max-w-xs text-xs font-medium text-gray-500">
                  Tap “Scan next ticket” to read another code.
                </p>
              </>
            ) : (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-[#FF9A3D]" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">
                  Requesting camera…
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {status === "paused" ? (
          <button
            type="button"
            onClick={resume}
            aria-label="Scan next ticket"
            className="inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/40 bg-[#FF7A00]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#FF9A3D] transition-colors hover:bg-[#FF7A00]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Scan next ticket
          </button>
        ) : null}

        {status === "scanning" || status === "starting" ? (
          <button
            type="button"
            onClick={stop}
            aria-label="Stop camera"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-white/[0.16] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
          >
            <CameraOff className="h-4 w-4" aria-hidden="true" />
            Stop camera
          </button>
        ) : null}

        {status === "stopped" || status === "error" ? (
          <button
            type="button"
            onClick={start}
            aria-label="Start camera"
            className="inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/40 bg-[#FF7A00]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#FF9A3D] transition-colors hover:bg-[#FF7A00]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Retry camera
          </button>
        ) : null}
      </div>

      {message ? (
        <p
          role="alert"
          className="mt-3 rounded-2xl border border-[#FF7A00]/25 bg-[#FF7A00]/10 px-4 py-3 text-xs font-medium text-[#FFB066]"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
