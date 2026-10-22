// src/superadmin/pages/RevenuePage.jsx
// Revenue tab: platform summary cards, an "issues only" toggle and one
// accordion card per admin that expands into their pending ticket queue.
// Maps to GET /api/superadmin/admins, GET /api/superadmin/pending-tickets and
// PATCH /api/superadmin/pending-tickets/:id/{approve|reject}.

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Coins, Ticket, Wallet } from "lucide-react";
import {
  approveTicket,
  getAdmins,
  getPendingTickets,
  rejectTicket,
} from "../services/superadmin.service";
import { ISSUES } from "../constants";
import { formatBirr, formatNumber } from "../utils/format";
import StatCard from "../components/common/StatCard";
import EmptyState from "../components/common/EmptyState";
import AdminRevenueCard from "../components/revenue/AdminRevenueCard";

const SkeletonBlock = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-[1.5rem] border border-white/[0.06] bg-[#1C1F22] ${className}`}
  />
);

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [admins, setAdmins] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [onlyIssues, setOnlyIssues] = useState(false);
  const [expandedAdminId, setExpandedAdminId] = useState(null);
  const [busy, setBusy] = useState({ id: null, action: null });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [adminsResponse, ticketsResponse] = await Promise.all([
          getAdmins(),
          getPendingTickets(),
        ]);
        if (!active) return;
        setAdmins(adminsResponse.admins);
        setTickets(ticketsResponse.tickets);
      } catch {
        if (active) setError("Could not load revenue data. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  /* ── summary ── */
  const summary = useMemo(() => {
    const totalRevenue = admins.reduce(
      (sum, admin) => sum + Number(admin.revenue || 0),
      0,
    );
    const pendingValue = tickets.reduce(
      (sum, ticket) => sum + Number(ticket.amount || 0),
      0,
    );
    const withIssues = tickets.filter((ticket) => Boolean(ticket.issue)).length;

    return {
      totalRevenue,
      pendingCount: tickets.length,
      pendingValue,
      withIssues,
    };
  }, [admins, tickets]);

  /* ── per-admin pending queues ── */
  const ticketsByAdmin = useMemo(() => {
    const map = new Map();
    admins.forEach((admin) => map.set(admin.id, []));
    tickets.forEach((ticket) => {
      if (!map.has(ticket.adminId)) map.set(ticket.adminId, []);
      map.get(ticket.adminId).push(ticket);
    });
    return map;
  }, [admins, tickets]);

  const visibleTicketsFor = useCallback(
    (adminId) => {
      const list = ticketsByAdmin.get(adminId) || [];
      if (!onlyIssues) return list;
      return list.filter((ticket) => Boolean(ticket.issue));
    },
    [ticketsByAdmin, onlyIssues],
  );

  /* ── actions ── */
  const handleApprove = useCallback(async (ticket) => {
    setBusy({ id: ticket.id, action: "approve" });
    try {
      const response = await approveTicket(ticket.id);
      if (!response.success) {
        toast.error(response.message || "Could not approve this ticket");
        return;
      }
      setTickets((previous) =>
        previous.filter((item) => item.id !== ticket.id),
      );
      toast.success(
        `Approved ${ticket.reference} · ${ticket.buyerName || "No name"}`,
      );
    } catch {
      toast.error("Could not approve this ticket");
    } finally {
      setBusy({ id: null, action: null });
    }
  }, []);

  const handleReject = useCallback(async (ticket) => {
    setBusy({ id: ticket.id, action: "reject" });
    try {
      const response = await rejectTicket(
        ticket.id,
        ticket.issue || ISSUES.paymentNotVerified,
      );
      if (!response.success) {
        toast.error(response.message || "Could not reject this ticket");
        return;
      }
      setTickets((previous) =>
        previous.filter((item) => item.id !== ticket.id),
      );
      toast(`Rejected ${ticket.reference}`, { icon: "🚫" });
    } catch {
      toast.error("Could not reject this ticket");
    } finally {
      setBusy({ id: null, action: null });
    }
  }, []);

  return (
    <div>
      {/* Header + toggle */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-black uppercase tracking-tighter text-2xl text-white sm:text-3xl">
            Revenue
          </h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Platform earnings · pending approvals
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={onlyIssues}
          onClick={() => setOnlyIssues((value) => !value)}
          aria-label="Show only tickets with verification issues"
          className="inline-flex items-center gap-3 rounded-full border border-white/[0.06] bg-[#1C1F22] px-4 py-2.5 transition-colors hover:border-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
        >
          <span
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
              onlyIssues ? "bg-[#FF7A00]" : "bg-white/10"
            }`}
            aria-hidden="true"
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
                onlyIssues ? "left-[1.15rem]" : "left-0.5"
              }`}
            />
          </span>

          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-300">
            Show only tickets with issues
          </span>
        </button>
      </div>

      {/* Summary */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <SkeletonBlock className="h-[7.5rem]" />
            <SkeletonBlock className="h-[7.5rem]" />
            <SkeletonBlock className="h-[7.5rem]" />
            <SkeletonBlock className="h-[7.5rem]" />
          </>
        ) : (
          <>
            <StatCard
              label="Total Revenue"
              value={formatBirr(summary.totalRevenue)}
              hint={`${formatNumber(admins.length)} admins`}
              icon={Wallet}
              tone="accent"
              delay={0}
            />
            <StatCard
              label="Total Pending"
              value={formatNumber(summary.pendingCount)}
              hint="awaiting approval"
              icon={Ticket}
              delay={0.05}
            />
            <StatCard
              label="Pending Value"
              value={formatBirr(summary.pendingValue)}
              hint="held in pending tickets"
              icon={Coins}
              delay={0.1}
            />
            <StatCard
              label="Tickets With Issues"
              value={formatNumber(summary.withIssues)}
              hint="need a closer look"
              icon={AlertTriangle}
              tone={summary.withIssues > 0 ? "danger" : "success"}
              delay={0.15}
            />
          </>
        )}
      </div>

      {/* Admin cards */}
      <div className="mt-8">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
          Per admin
        </p>

        {loading ? (
          <div className="grid gap-4">
            <SkeletonBlock className="h-[13rem]" />
            <SkeletonBlock className="h-[13rem]" />
            <SkeletonBlock className="h-[13rem]" />
          </div>
        ) : error ? (
          <EmptyState
            icon={AlertTriangle}
            title="Something went wrong"
            message={error}
          />
        ) : admins.length > 0 ? (
          <div className="grid gap-4">
            {admins.map((admin, index) => {
              const allTickets = ticketsByAdmin.get(admin.id) || [];
              const hasIssue = allTickets.some((ticket) =>
                Boolean(ticket.issue),
              );

              return (
                <AdminRevenueCard
                  key={admin.id}
                  admin={admin}
                  tickets={visibleTicketsFor(admin.id)}
                  pendingCount={allTickets.length}
                  hasIssue={hasIssue}
                  expanded={expandedAdminId === admin.id}
                  onToggle={(id) =>
                    setExpandedAdminId((current) =>
                      current === id ? null : id,
                    )
                  }
                  onApprove={handleApprove}
                  onReject={handleReject}
                  busyId={busy.id}
                  busyAction={busy.action}
                  index={index}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Wallet}
            title="No admins yet"
            message="Once admins create events, their revenue shows up here."
          />
        )}
      </div>
    </div>
  );
}
