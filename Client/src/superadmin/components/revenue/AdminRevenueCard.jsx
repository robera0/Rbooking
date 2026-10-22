// src/superadmin/components/revenue/AdminRevenueCard.jsx
// Per-admin revenue summary that expands (accordion) into that admin's pending
// tickets. Pending badge is orange, red + pulsing when a ticket has an issue.
// Maps to GET /api/superadmin/admins + GET /api/superadmin/pending-tickets.

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronDown, Ticket, User } from "lucide-react";
import { formatBirr, formatNumber, initials } from "../../utils/format";
import EmptyState from "../common/EmptyState";
import PendingTicketCard from "./PendingTicketCard";

export default function AdminRevenueCard({
  admin,
  tickets = [],
  pendingCount = 0,
  hasIssue = false,
  expanded = false,
  onToggle,
  onApprove,
  onReject,
  busyId = null,
  busyAction = null,
  index = 0,
}) {
  const panelId = `admin-panel-${admin.id}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={[
        "overflow-hidden rounded-[2rem] border bg-[#1C1F22] transition-colors",
        hasIssue ? "border-red-500/20" : "border-white/[0.06]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onToggle?.(admin.id)}
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={`${admin.name} — ${pendingCount} pending tickets${
          expanded ? ", expanded" : ", collapsed"
        }`}
        className="w-full rounded-[2rem] p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] text-sm font-black tracking-tighter text-gray-300"
              aria-hidden="true"
            >
              {admin.avatar ? (
                <img
                  src={admin.avatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(admin.name)
              )}
            </span>

            <div className="min-w-0">
              <h3 className="truncate font-black uppercase tracking-tighter text-lg leading-none text-white">
                {admin.name}
              </h3>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                <User className="h-3.5 w-3.5" aria-hidden="true" />
                {admin.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em]",
                hasIssue
                  ? "animate-pulse border-red-500/40 bg-red-500/10 text-red-400"
                  : "border-[#FF7A00]/30 bg-[#FF7A00]/10 text-[#FF9A3D]",
              ].join(" ")}
            >
              <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
              {pendingCount} pending
            </span>

            <ChevronDown
              className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
              Revenue
            </p>
            <p className="mt-1.5 truncate font-black tracking-tighter text-lg text-white">
              {formatBirr(admin.revenue)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
              Tickets Sold
            </p>
            <p className="mt-1.5 truncate font-black tracking-tighter text-lg text-white">
              {formatNumber(admin.ticketsSold)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
              Events
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 font-black tracking-tighter text-lg text-white">
              <CalendarDays className="h-4 w-4 text-gray-500" aria-hidden="true" />
              {formatNumber(admin.eventsCount)}
            </p>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="panel"
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] p-5">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                Pending tickets · {tickets.length}
              </p>

              {tickets.length > 0 ? (
                <div className="grid gap-3">
                  {tickets.map((ticket, ticketIndex) => (
                    <PendingTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      index={ticketIndex}
                      busy={busyId === ticket.id}
                      pendingAction={busyId === ticket.id ? busyAction : null}
                      onApprove={onApprove}
                      onReject={onReject}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Ticket}
                  title="No pending tickets"
                  message={
                    hasIssue
                      ? "This admin has pending tickets, but none with a verification issue."
                      : "Every ticket from this admin has been reviewed."
                  }
                  className="py-10"
                />
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
