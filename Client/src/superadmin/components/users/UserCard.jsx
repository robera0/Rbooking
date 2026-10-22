// src/superadmin/components/users/UserCard.jsx
// Card for one platform user: avatar (or initials fallback), contact details,
// join date, spend and role chip. The whole card is a button.
// Maps to GET /api/superadmin/users.

import { motion } from "framer-motion";
import { CalendarDays, Mail, Phone, Ticket } from "lucide-react";
import { ROLE_LABELS } from "../../constants";
import { formatBirr, formatDate, formatNumber, initials } from "../../utils/format";
import StatusChip from "../common/StatusChip";

export default function UserCard({ user, onSelect, index = 0 }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(user)}
      aria-label={`Open details for ${user.fullName}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.04, 0.32),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex w-full flex-col rounded-[2rem] border border-white/[0.06] bg-[#1C1F22] p-5 text-left transition-colors hover:border-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] text-sm font-black tracking-tighter text-gray-300"
            aria-hidden="true"
          >
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(user.fullName)
            )}
          </span>

          <div className="min-w-0">
            <h3 className="truncate font-black uppercase tracking-tighter text-base leading-tight text-white">
              {user.fullName}
            </h3>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
              {user.city || "—"}
            </p>
          </div>
        </div>

        <StatusChip kind="role" value={user.role} label={ROLE_LABELS[user.role]} />
      </div>

      <div className="mt-4 grid gap-2">
        <p className="inline-flex items-center gap-2 truncate text-xs font-medium text-gray-400">
          <Phone className="h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden="true" />
          {user.phone}
        </p>
        <p className="inline-flex items-center gap-2 truncate text-xs font-medium text-gray-400">
          <Mail className="h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden="true" />
          {user.email}
        </p>
        <p className="inline-flex items-center gap-2 text-xs font-medium text-gray-500">
          <CalendarDays
            className="h-3.5 w-3.5 shrink-0 text-gray-600"
            aria-hidden="true"
          />
          Joined {formatDate(user.joinedAt, "date")}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            <Ticket className="h-3 w-3" aria-hidden="true" />
            Tickets
          </p>
          <p className="mt-1.5 font-black tracking-tighter text-base text-white">
            {formatNumber(user.ticketsBought)}
          </p>
        </div>

        <div className="min-w-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Total Spent
          </p>
          <p className="mt-1.5 truncate font-black tracking-tighter text-base text-white">
            {formatBirr(user.totalSpent)}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
