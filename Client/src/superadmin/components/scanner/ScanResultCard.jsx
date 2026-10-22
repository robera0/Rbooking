// src/superadmin/components/scanner/ScanResultCard.jsx
// Full-bleed result of a validation: green VALID, amber ALREADY USED, red INVALID.
// Maps to the response of POST /api/superadmin/tickets/validate.

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Phone,
  Ticket,
  User,
  XCircle,
} from "lucide-react";
import { SCAN_STATUS, SCAN_STATUS_LABELS } from "../../constants";
import { formatBirr, formatDate, timeAgo } from "../../utils/format";

const TONES = {
  [SCAN_STATUS.valid]: {
    shell: "border-emerald-400/30 bg-emerald-400/[0.07]",
    icon: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
    title: "text-emerald-300",
    Icon: CheckCircle2,
  },
  [SCAN_STATUS.used]: {
    shell: "border-[#FF7A00]/30 bg-[#FF7A00]/[0.07]",
    icon: "border-[#FF7A00]/30 bg-[#FF7A00]/15 text-[#FF9A3D]",
    title: "text-[#FF9A3D]",
    Icon: Clock3,
  },
  [SCAN_STATUS.invalid]: {
    shell: "border-red-500/30 bg-red-500/[0.07]",
    icon: "border-red-500/30 bg-red-500/15 text-red-400",
    title: "text-red-400",
    Icon: XCircle,
  },
};

const Row = ({ label, value, icon: Icon }) => (
  <div className="min-w-0">
    <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
      {Icon ? <Icon className="h-3 w-3" aria-hidden="true" /> : null}
      {label}
    </p>
    <p className="mt-1 truncate text-sm font-bold text-white" title={value || "—"}>
      {value || "—"}
    </p>
  </div>
);

export default function ScanResultCard({ result }) {
  if (!result) return null;

  const status = result.status || SCAN_STATUS.invalid;
  const tone = TONES[status] || TONES[SCAN_STATUS.invalid];
  const { Icon } = tone;
  const ticket = result.ticket;

  return (
    <motion.section
      key={`${result.code}-${result.scannedAt}`}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      aria-live="polite"
      className={`rounded-[2rem] border p-5 ${tone.shell}`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${tone.icon}`}
          aria-hidden="true"
        >
          <Icon className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={`font-black uppercase tracking-tighter text-xl leading-none ${tone.title}`}
          >
            {SCAN_STATUS_LABELS[status] || status.toUpperCase()}
          </p>
          <p className="mt-1.5 truncate font-mono text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
            {result.code || ticket?.code || "—"}
          </p>
        </div>

        <span className="shrink-0 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
          {formatDate(result.scannedAt, "time")}
          <br />
          {timeAgo(result.scannedAt)}
        </span>
      </div>

      {status === SCAN_STATUS.invalid ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs font-semibold text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {result.reason || "This ticket could not be validated"}
        </p>
      ) : null}

      {status === SCAN_STATUS.used && ticket?.usedAt ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[#FF7A00]/20 bg-[#FF7A00]/[0.06] px-4 py-3 text-xs font-semibold text-[#FFB066]">
          <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Already used at {formatDate(ticket.usedAt, "datetime")} ·{" "}
          {timeAgo(ticket.usedAt)}
        </p>
      ) : null}

      {ticket ? (
        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/[0.06] pt-4 sm:grid-cols-2">
          <Row label="Buyer" value={ticket.buyerName || "No name"} icon={User} />
          <Row label="Phone" value={ticket.buyerPhone} icon={Phone} />
          <Row label="Event" value={ticket.eventName} icon={Ticket} />
          <Row
            label="Ticket type"
            value={`${ticket.ticketType} · ${formatBirr(ticket.amount)}`}
          />
          <Row label="Admin" value={ticket.adminName} icon={User} />
          <Row label="Event ID" value={ticket.eventId} />
        </div>
      ) : null}
    </motion.section>
  );
}
