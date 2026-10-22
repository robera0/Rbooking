// src/superadmin/components/users/UserDetailsDrawer.jsx
// Slide-over with a user's full profile and their recent tickets.
// Maps to GET /api/superadmin/users/:id (tickets: GET /api/superadmin/users/:id/tickets).

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Ticket,
  Clock3,
  Wallet,
} from "lucide-react";
import { ROLE_LABELS } from "../../constants";
import {
  formatBirr,
  formatDate,
  formatNumber,
  initials,
  timeAgo,
} from "../../utils/format";
import Drawer from "../common/Drawer";
import EmptyState from "../common/EmptyState";
import StatusChip from "../common/StatusChip";

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[#121417] px-4 py-3">
    <span
      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-gray-500"
      aria-hidden="true"
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-white">{value || "—"}</p>
    </div>
  </div>
);

export default function UserDetailsDrawer({ user, open, onClose }) {
  /* Keep the last user around so the exit animation still has content. */
  const [cachedUser, setCachedUser] = useState(user);

  useEffect(() => {
    if (user) setCachedUser(user);
  }, [user]);

  const active = user || cachedUser;
  if (!active) return null;

  const recentTickets = active.recentTickets || [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={active.fullName}
      subtitle={`${ROLE_LABELS[active.role] || "User"} · joined ${formatDate(
        active.joinedAt,
        "date",
      )}`}
      ariaLabel={`Details for ${active.fullName}`}
    >
      {/* Identity */}
      <div className="flex items-center gap-4">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[#FF7A00]/25 bg-[#FF7A00]/10 text-lg font-black tracking-tighter text-[#FF9A3D]"
          aria-hidden="true"
        >
          {active.avatar ? (
            <img src={active.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(active.fullName)
          )}
        </span>

        <div className="min-w-0">
          <p className="truncate font-black uppercase tracking-tighter text-lg text-white">
            {active.fullName}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StatusChip kind="role" value={active.role} />
            {active.linkedAdminId ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                {active.linkedAdminId}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Spend summary */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/[0.06] bg-[#121417] px-4 py-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            <Ticket className="h-3 w-3" aria-hidden="true" />
            Tickets Bought
          </p>
          <p className="mt-1.5 font-black tracking-tighter text-xl text-white">
            {formatNumber(active.ticketsBought)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#121417] px-4 py-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            <Wallet className="h-3 w-3" aria-hidden="true" />
            Total Spent
          </p>
          <p className="mt-1.5 truncate font-black tracking-tighter text-xl text-white">
            {formatBirr(active.totalSpent)}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 grid gap-2">
        <DetailRow label="Phone" value={active.phone} icon={Phone} />
        <DetailRow label="Email" value={active.email} icon={Mail} />
        <DetailRow label="City" value={active.city} icon={MapPin} />
        <DetailRow
          label="Joined"
          value={formatDate(active.joinedAt, "full")}
          icon={CalendarDays}
        />
        <DetailRow
          label="Last Active"
          value={timeAgo(active.lastActiveAt)}
          icon={Clock3}
        />
      </div>

      {/* Recent tickets */}
      <div className="mt-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
          Recent tickets · {recentTickets.length}
        </p>

        {recentTickets.length > 0 ? (
          <ul className="grid gap-2">
            {recentTickets.map((ticket) => (
              <li
                key={ticket.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-[#121417] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {ticket.eventName}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-gray-500">
                    {ticket.ticketType} · {formatDate(ticket.date, "short")} ·{" "}
                    {formatBirr(ticket.amount)}
                  </p>
                </div>

                <StatusChip kind="scan" value={ticket.status} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Ticket}
            title="No tickets yet"
            message="This account has not bought any tickets."
            className="py-10"
          />
        )}
      </div>

      <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-700">
        ID · {active.id}
      </p>
    </Drawer>
  );
}
