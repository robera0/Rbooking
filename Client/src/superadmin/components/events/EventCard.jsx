// src/superadmin/components/events/EventCard.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { ImageOff, MapPin, User } from "lucide-react";
import StatusChip from "../common/StatusChip";
import { EVENT_STATUS } from "../../constants";
import {
  formatBirr,
  formatDate,
  formatNumber,
  percent,
} from "../../utils/format";

const BAR_TONES = {
  [EVENT_STATUS.soldOut]: "bg-[#FF7A00]",
  [EVENT_STATUS.ended]: "bg-red-500/80",
  [EVENT_STATUS.draft]: "bg-gray-400/60",
};

export default function EventCard({ event, index = 0 }) {
  const [posterFailed, setPosterFailed] = useState(false);

  // Extract poster/image from pictures array or nested venue pictures
  const posterUrl =
    event.poster ||
    event.pictures?.[0] ||
    event.links?.venues?.pictures?.[0] ||
    "";

  const showPoster = Boolean(posterUrl) && !posterFailed;

  // Extract fields safely based on your API response
  const adminName =
    typeof event.adminId === "object"
      ? event.adminId?.organizationName
      : event.adminName || "Admin";

  const venueName = event.links?.venues?.name || event.venue || "Venue";
  const venueCity = event.links?.venues?.city || event.city || "";

  // Date parsing from dates.start.dateTime or localDate
  const eventDate =
    event.dates?.start?.dateTime || event.date || new Date().toISOString();

  // Price calculation from priceRanges (find minimum active price)
  const activePrices = (event.priceRanges || []).filter((p) => p.isActive);
  const entryFrom =
    event.entryFrom ??
    (activePrices.length > 0 ? Math.min(...activePrices.map((p) => p.min)) : 0);

  // Tickets sold/total capacity calculation
  const totalCapacity =
    event.total ??
    (event.priceRanges || []).reduce((acc, p) => acc + (p.capacity || 0), 0);
  const ticketsSold = event.sold ?? 0;

  const soldPercent = percent(ticketsSold, totalCapacity);
  const remaining = Math.max(0, Number(totalCapacity) - Number(ticketsSold));
  const barTone = BAR_TONES[event.status] || "bg-[#5EC750]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex flex-col overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#1C1F22] transition-colors hover:border-white/[0.12]"
    >
      {/* Poster */}
      <div className="relative h-44 w-full overflow-hidden bg-[#15181B]">
        {showPoster ? (
          <img
            src={posterUrl}
            alt={`${event.name} poster`}
            loading="lazy"
            onError={() => setPosterFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#242931] via-[#1B1F24] to-[#15181B] text-gray-600">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
              {event.category || "Event"}
            </span>
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1C1F22] via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Date badge */}
        <div className="absolute left-3 top-3 rounded-2xl border border-white/10 bg-black/65 px-3 py-2 text-center backdrop-blur-md">
          <p className="font-black leading-none tracking-tighter text-lg text-white">
            {formatDate(eventDate, "dayNumber")}
          </p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            {formatDate(eventDate, "month")}
          </p>
        </div>

        {event.status === EVENT_STATUS.published ? (
          <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300 backdrop-blur-md">
            {formatDate(eventDate, "time")}
          </span>
        ) : (
          <StatusChip
            value={event.status}
            className="absolute right-3 top-3 backdrop-blur-md"
          />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF7A00]/10 text-[#FF9A3D]"
            aria-hidden="true"
          >
            <User className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-[#FF9A3D]">
            {adminName}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 font-black uppercase leading-tight tracking-tighter text-lg text-white">
          {event.name}
        </h3>

        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {venueName} {venueCity ? `· ${venueCity}` : ""}
          </span>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
              Entry From
            </p>
            <p className="mt-1.5 font-black tracking-tighter text-base text-white">
              {formatBirr(entryFrom)}
            </p>
          </div>

          <div className="min-w-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
              Tickets Sold
            </p>
            <p className="mt-1.5 font-black tracking-tighter text-base text-white">
              {formatNumber(ticketsSold)}
              <span className="text-sm text-gray-500">
                /{formatNumber(totalCapacity)}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]"
            role="progressbar"
            aria-valuenow={soldPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${soldPercent}% of tickets sold`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${soldPercent}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${barTone}`}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
            <span>{soldPercent}% sold</span>
            <span>{formatNumber(remaining)} left</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
