// src/superadmin/components/scanner/RecentScans.jsx
// Last 10 scans, newest first, with Valid / Used / Invalid counters for the
// whole session. Maps to nothing yet — will become a real endpoint such as
// GET /api/superadmin/tickets/scans?limit=10.

import { motion } from "framer-motion";
import { ScanLine, Trash2 } from "lucide-react";
import { SCAN_STATUS, SCAN_STATUS_LABELS } from "../../constants";
import { timeAgo } from "../../utils/format";
import EmptyState from "../common/EmptyState";
import StatusChip from "../common/StatusChip";

export default function RecentScans({ scans = [], onClear }) {
  const counters = {
    valid: scans.filter((scan) => scan.status === SCAN_STATUS.valid).length,
    used: scans.filter((scan) => scan.status === SCAN_STATUS.used).length,
    invalid: scans.filter((scan) => scan.status === SCAN_STATUS.invalid).length,
  };

  const visible = scans.slice(0, 10);

  return (
    <section className="rounded-[2rem] border border-white/[0.06] bg-[#1C1F22] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-black uppercase tracking-tighter text-lg text-white">
            Recent scans
          </h3>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Newest first · last 10
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
            Valid {counters.valid}
          </span>
          <span className="rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FF9A3D]">
            Used {counters.used}
          </span>
          <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-red-400">
            Invalid {counters.invalid}
          </span>

          {scans.length > 0 && onClear ? (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear recent scans"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-gray-500 transition-colors hover:border-red-500/30 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        {visible.length > 0 ? (
          <ul className="grid gap-2">
            {visible.map((scan, index) => (
              <motion.li
                key={`${scan.code}-${scan.scannedAt}-${index}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.2) }}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-[#121417] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-bold uppercase tracking-[0.1em] text-white">
                    {scan.code || scan.ticket?.code || "—"}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-medium text-gray-500">
                    {scan.ticket?.buyerName || "No name"} ·{" "}
                    {scan.ticket?.eventName || scan.reason || "Unknown code"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600 sm:inline">
                    {timeAgo(scan.scannedAt)}
                  </span>
                  <StatusChip
                    kind="scan"
                    value={scan.status}
                    label={SCAN_STATUS_LABELS[scan.status]}
                  />
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={ScanLine}
            title="No scans yet"
            message="Scan a QR code or type a ticket code — results appear here."
            className="py-10"
          />
        )}
      </div>
    </section>
  );
}
