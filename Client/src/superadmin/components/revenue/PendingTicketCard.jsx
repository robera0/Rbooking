// src/superadmin/components/revenue/PendingTicketCard.jsx
// One pending ticket awaiting super-admin review: buyer, event, amount, live
// expiry countdown, verification issue and Approve/Reject actions.
// Maps to GET /api/superadmin/pending-tickets + the approve/reject PATCH endpoints.

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { ISSUE_LABELS } from "../../constants";
import { formatBirr, formatDate, timeAgo, truncate } from "../../utils/format";
import ExpiryCountdown from "./ExpiryCountdown";

export default function PendingTicketCard({
  ticket,
  index = 0,
  busy = false,
  pendingAction = null,
  onApprove,
  onReject,
}) {
  const hasBuyerName = Boolean(ticket.buyerName && ticket.buyerName.trim());
  const hasIssue = Boolean(ticket.issue);

  const windowMinutes = Math.max(
    1,
    Math.round(
      (new Date(ticket.expiresAt).getTime() -
        new Date(ticket.boughtAt).getTime()) /
        60000,
    ),
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        delay: Math.min(index * 0.04, 0.24),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={[
        "rounded-[1.5rem] border bg-[#1C1F22] p-4",
        hasIssue
          ? "border-red-500/20"
          : "border-white/[0.06] hover:border-white/[0.1]",
      ].join(" ")}
    >
      {/* Buyer + issue badge */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Buyer
          </p>
          <p
            className={[
              "mt-1 truncate text-sm font-black uppercase tracking-tight",
              hasBuyerName ? "text-white" : "text-gray-500",
            ].join(" ")}
            title={hasBuyerName ? ticket.buyerName : "No name"}
          >
            {hasBuyerName ? ticket.buyerName : "No name"}
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {ticket.buyerPhone}
          </p>
        </div>

        {hasIssue ? (
          <span className="inline-flex max-w-[14rem] items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">{ISSUE_LABELS[ticket.issue] || "Issue"}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified
          </span>
        )}
      </div>

      {/* Event + amount */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Event
          </p>
          <p
            className="mt-1 truncate text-sm font-bold text-white"
            title={ticket.eventName}
          >
            {truncate(ticket.eventName, 34)}
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#FF9A3D]">
            {ticket.ticketType} · ×{ticket.quantity}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Amount
          </p>
          <p className="mt-1 font-black tracking-tighter text-base text-white">
            {formatBirr(ticket.amount)}
          </p>
          <p className="mt-1 text-[11px] font-medium text-gray-500">
            {formatDate(ticket.boughtAt, "datetime")} · {timeAgo(ticket.boughtAt)}
          </p>
        </div>
      </div>

      {/* Live countdown */}
      <div className="mt-4">
        <ExpiryCountdown
          expiresAt={ticket.expiresAt}
          windowMinutes={windowMinutes}
        />
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onApprove?.(ticket)}
          disabled={busy}
          aria-label={`Approve ticket ${ticket.reference}`}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300 transition-colors hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
        >
          {busy && pendingAction === "approve" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          )}
          Approve
        </button>

        <button
          type="button"
          onClick={() => onReject?.(ticket)}
          disabled={busy}
          aria-label={`Reject ticket ${ticket.reference}`}
          className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
        >
          {busy && pendingAction === "reject" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <XCircle className="h-4 w-4" aria-hidden="true" />
          )}
          Reject
        </button>

        <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
          {ticket.reference}
        </span>
      </div>
    </motion.article>
  );
}
