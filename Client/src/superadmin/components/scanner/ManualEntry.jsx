// src/superadmin/components/scanner/ManualEntry.jsx
// Keyboard entry for ticket codes — the fallback when there is no camera and a
// convenience for codes that are printed rather than shown on a screen.
// Maps to POST /api/superadmin/tickets/validate (the page calls it).

import { useState } from "react";
import { Hash, Loader2, Search } from "lucide-react";

/* Demo-only shortcuts, remove once the real API is wired. */
const DEMO_CODES = ["RBOOK-0001", "RBOOK-0003", "RBOOK-0008", "UNKNOWN-CODE"];

export default function ManualEntry({ onSubmit, busy = false, disabled = false }) {
  const [code, setCode] = useState("");

  const canSubmit = !busy && !disabled && code.trim().length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit?.(code.trim());
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label
        htmlFor="superadmin-manual-code"
        className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600"
      >
        <Hash className="h-3.5 w-3.5" aria-hidden="true" />
        Manual entry
      </label>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="superadmin-manual-code"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck="false"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          disabled={disabled}
          placeholder="e.g. RBOOK-0001"
          aria-label="Ticket code"
          className="h-12 w-full rounded-2xl border border-white/[0.06] bg-[#121417] px-4 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-white placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-600 focus:outline-none focus-visible:border-[#FF7A00]/50 focus-visible:ring-2 focus-visible:ring-[#FF7A00]/50 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Validate ticket code"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#FF7A00]/40 bg-[#FF7A00]/15 px-5 text-[11px] font-black uppercase tracking-[0.16em] text-[#FF9A3D] transition-colors hover:bg-[#FF7A00]/25 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4" aria-hidden="true" />
          )}
          Validate
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-700">
          Demo codes
        </span>
        {DEMO_CODES.map((demo) => (
          <button
            key={demo}
            type="button"
            disabled={disabled}
            onClick={() => setCode(demo)}
            aria-label={`Use demo code ${demo}`}
            className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.08em] text-gray-400 transition-colors hover:border-white/[0.14] hover:text-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
          >
            {demo}
          </button>
        ))}
      </div>
    </form>
  );
}
