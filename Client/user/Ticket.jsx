// src/user/Ticket.jsx
// Posh-style ticket wallet: filter pills and compact ticket cards.
// Maps to GET /api/auth/tickets_home and the ticket detail routes.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, MoveRight, Ticket as TicketIcon } from "lucide-react";
import { eventService } from "../src/Context/ApiEvent";
import { useService } from "@/Context/ServiceContext";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import {
  eventDateLabel,
  eventImageUrl,
  eventVenueLabel,
} from "./components/EventTile";
import toast from "react-hot-toast";
import { isPostponed } from "@/lib/postponed";

const STATUS_STYLES = {
  paid: {
    label: "Paid",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  },
  pending: {
    label: "Pending",
    className: "border-orange-500/25 bg-orange-500/10 text-orange-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-500/25 bg-red-500/10 text-red-400",
  },
};

const FALLBACK_STATUS = {
  label: "Upcoming",
  className: "border-white/10 bg-white/[0.04] text-gray-400",
};

/* ── Live countdown for pending, unverified tickets ── */
const CountdownTimer = ({ expiresAt }) => {
  const calcRemaining = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, total: 0 };
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      total: diff,
    };
  }, [expiresAt]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => clearInterval(id);
  }, [calcRemaining]);

  if (remaining.total <= 0) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-400">
        Expired
      </span>
    );
  }

  const urgencyColor =
    remaining.h >= 6 ? "#FACC15" : remaining.h >= 1 ? "#FB923C" : "#F87171";
  const pad = (value) => String(value).padStart(2, "0");

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold tabular-nums"
      style={{ color: urgencyColor }}
    >
      <Clock size={11} />
      {pad(remaining.h)}:{pad(remaining.m)}:{pad(remaining.s)}
    </span>
  );
};

const FilterPill = ({ label, active, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] ${
      active
        ? "bg-[#FF7A00] text-black"
        : "border border-white/[0.08] bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-white"
    }`}
  >
    {label}
    {count != null && (
      <span
        className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
          active ? "bg-black/15 text-black" : "bg-white/[0.06] text-gray-500"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const TicketCardSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1C1F22]">
    <div className="flex gap-4 p-4">
      <div className="h-24 w-20 shrink-0 rounded-xl bg-white/[0.05]" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-2.5 w-1/3 rounded bg-white/[0.05]" />
        <div className="h-3.5 w-3/4 rounded bg-white/[0.05]" />
        <div className="h-2.5 w-1/2 rounded bg-white/[0.03]" />
      </div>
    </div>
    <div className="h-12 border-t border-white/[0.06]" />
  </div>
);

/* ── Saved club RSVP, kept in localStorage by the club RSVP flow ── */
const CLUB_RSVP_KEY = "clubRsvpReservation";
const DEFAULT_RSVP_BAND =
  "linear-gradient(120deg, #0EA5E9 0%, #7C3AED 38%, #F97316 100%)";

const readClubReservation = () => {
  try {
    return JSON.parse(localStorage.getItem(CLUB_RSVP_KEY) || "null");
  } catch {
    return null;
  }
};

const ClubRsvpCard = ({ reservation, index, onOpen }) => {
  const band = reservation.theme?.bandGradient ?? DEFAULT_RSVP_BAND;
  const rows = [
    ["Seat type", reservation.pass],
    ["Table", reservation.table],
    ["Total", reservation.total],
  ].filter(([, value]) => value != null && value !== "");

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#15171A]"
    >
      <div className="p-4" style={{ background: band }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/60">
              Paysso · Club RSVP
            </p>
            <h2 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-tight text-black">
              {reservation.club}
            </h2>
            <p className="mt-1 line-clamp-1 text-[11px] text-black/70">
              {[reservation.date, reservation.venue].filter(Boolean).join(" · ")}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-black/20 bg-black/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-black">
            Paid
          </span>
        </div>
      </div>

      <dl className="divide-y divide-white/[0.06] px-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2.5">
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
              {label}
            </dt>
            <dd className="text-[12px] font-semibold text-gray-100">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-600">
          <TicketIcon size={12} />#
          {String(reservation._id || "RSVP").slice(-8).toUpperCase()}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-full bg-[#FF7A00] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121417]"
        >
          View RSVP
          <MoveRight size={13} />
        </button>
      </div>
    </motion.article>
  );
};

const TicketHome = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoggedIn, API_URL } = useService();
  const { tickets, ticketLoading, ticketsError, ticketIsError } =
    eventService();
  const [hasAlerted, setHasAlerted] = useState(false);
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(Date.now());
  const [savedClubReservation, setSavedClubReservation] =
    useState(readClubReservation);

  useEffect(() => {
    const handleStorage = () => setSavedClubReservation(readClubReservation());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Refetch whenever the wallet is opened so a fresh purchase shows up.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
  }, [queryClient]);

  useEffect(() => {
    if (ticketIsError && !isLoggedIn && !hasAlerted) {
      toast.error(getFriendlyErrorMessage(ticketsError), { duration: 3000 });
      setHasAlerted(true);
    }
  }, [ticketIsError, isLoggedIn, hasAlerted, ticketsError]);

  const allTickets = useMemo(
    () => (tickets?.events ? tickets.events : []),
    [tickets],
  );

  // A saved club RSVP is shown first, alongside the purchased tickets.
  const combinedTickets = useMemo(() => {
    if (!savedClubReservation) return allTickets;
    return [
      {
        ...savedClubReservation,
        type: "club-rsvp",
        _id: savedClubReservation.id || "club-rsvp",
        status: savedClubReservation.status || "paid",
      },
      ...allTickets,
    ];
  }, [allTickets, savedClubReservation]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? combinedTickets
        : combinedTickets.filter(
            (ticket) => ticket?.status?.toLowerCase().trim() === filter,
          ),
    [combinedTickets, filter],
  );

  const counts = useMemo(
    () => ({
      all: combinedTickets.length,
      paid: combinedTickets.filter(
        (ticket) => ticket?.status?.toLowerCase().trim() === "paid",
      ).length,
      pending: combinedTickets.filter(
        (ticket) => ticket?.status?.toLowerCase().trim() === "pending",
      ).length,
      cancelled: combinedTickets.filter(
        (ticket) => ticket?.status?.toLowerCase().trim() === "cancelled",
      ).length,
    }),
    [combinedTickets],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#121417] pb-28 text-white">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="pt-10 sm:pt-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF7A00]">
            Your collection
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Tickets
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            {combinedTickets.length === 0
              ? "No tickets purchased yet"
              : `${combinedTickets.length} ticket${
                  combinedTickets.length === 1 ? "" : "s"
                } ready when you are`}
          </p>
        </header>

        {/* ── Filters ────────────────────────────────────────────────── */}
        {combinedTickets.length > 0 && (
          <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
            <FilterPill
              label="All"
              active={filter === "all"}
              count={counts.all}
              onClick={() => setFilter("all")}
            />
            <FilterPill
              label="Paid"
              active={filter === "paid"}
              count={counts.paid}
              onClick={() => setFilter("paid")}
            />
            <FilterPill
              label="Pending"
              active={filter === "pending"}
              count={counts.pending}
              onClick={() => setFilter("pending")}
            />
            <FilterPill
              label="Cancelled"
              active={filter === "cancelled"}
              count={counts.cancelled}
              onClick={() => setFilter("cancelled")}
            />
          </div>
        )}

        {/* ── Loading ────────────────────────────────────────────────── */}
        {ticketLoading && (
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <TicketCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* ── Empty ──────────────────────────────────────────────────── */}
        {!ticketLoading && combinedTickets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/[0.08] bg-white/[0.01] px-6 py-24 text-center"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03]">
              <TicketIcon size={26} className="text-gray-700" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              No tickets yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Tickets you buy will appear here, scannable at the door.
            </p>
            <button
              type="button"
              onClick={() => navigate("/event")}
              className="mt-8 rounded-full bg-[#FF7A00] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#121417]"
            >
              Find events
            </button>
          </motion.div>
        )}

        {/* ── Filtered empty ─────────────────────────────────────────── */}
        {!ticketLoading && combinedTickets.length > 0 && filtered.length === 0 && (
          <p className="mt-16 text-center text-sm text-gray-500">
            No tickets match this filter.
          </p>
        )}

        {/* ── Ticket cards ───────────────────────────────────────────── */}
        {!ticketLoading && filtered.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((ticket, index) => {
              if (ticket?.type === "club-rsvp") {
                return (
                  <ClubRsvpCard
                    key={ticket._id || "club-rsvp"}
                    reservation={ticket}
                    index={index}
                    onOpen={() => navigate("/club/rsvp/ticket")}
                  />
                );
              }

              const event = ticket?.ticketId?.eventId;
              const tier = ticket?.ticketId;
              const statusKey = (ticket?.status || "").toLowerCase().trim();
              const status = STATUS_STYLES[statusKey] || FALLBACK_STATUS;

              const isPendingUnverified =
                statusKey === "pending" && !ticket?.isVerified;
              // Free tickets have no payment to verify, so they open directly.
              const isFreeTicket = Number(ticket?.totalAmount ?? 0) === 0;
              const needsVerification = isPendingUnverified && !isFreeTicket;
              const isExpired =
                isPendingUnverified &&
                ticket?.expiresAt &&
                new Date(ticket.expiresAt).getTime() <= now;

              const price = tier?.price || "0";
              const currency =
                event?.priceRanges?.[0]?.currency || "ETB";
              const code = tier?._id?.slice(-8).toUpperCase() || "—";

              const href = event?._id
                ? `/tickets_home/${event._id}/${ticket?._id}`
                : `/tickets_home/${ticket?._id}`;

              return (
                <motion.article
                  key={tier?._id || index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#15171A] transition hover:border-white/[0.14] ${
                    isExpired ? "opacity-60" : ""
                  }`}
                >
                  {/* Event cover as the card backdrop, dimmed for legibility */}
                  <img
                    src={eventImageUrl(event, API_URL)}
                    alt=""
                    loading="lazy"
                    onError={(imageEvent) => {
                      imageEvent.currentTarget.onerror = null;
                      imageEvent.currentTarget.src = "/datebackground.jpg";
                    }}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-[#0A0C0E]/85" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C0E]/95 via-[#0A0C0E]/70 to-[#0A0C0E]/40" />

                  <div className="relative z-10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF7A00]">
                          {eventDateLabel(event)}
                        </p>
                        <h2 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-tight text-white">
                          {event?.name || "Event"}
                        </h2>
                        <p className="mt-1 line-clamp-1 text-[11px] text-gray-400">
                          {eventVenueLabel(event)}
                        </p>
                        {isPostponed(event) && (
                          <p className="mt-1 text-[11px] font-semibold text-yellow-400">
                            Postponed · your ticket is still valid
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500">
                          Ticket
                        </p>
                        <p className="truncate text-[12px] font-semibold text-gray-100">
                          {tier?.name || tier?.type || "General admission"}
                        </p>
                      </div>
                      <p className="shrink-0 text-lg font-bold text-white">
                        {price}
                        <span className="ml-1 text-[10px] font-medium text-gray-400">
                          {currency}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-600">
                        <TicketIcon size={12} />#{code}
                      </span>
                      {isPendingUnverified && (
                        <CountdownTimer expiresAt={ticket.expiresAt} />
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isExpired}
                      onClick={() => {
                        if (needsVerification) {
                          navigate(`/tickets_home/verify/${ticket?._id}`, {
                            state: {
                              eventId: event?._id,
                              eventName: event?.name,
                            },
                          });
                          return;
                        }
                        navigate(href);
                      }}
                      className={`rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121417] ${
                        isExpired
                          ? "cursor-not-allowed bg-white/[0.06] text-gray-500"
                          : "bg-[#FF7A00] text-black hover:bg-white"
                      }`}
                    >
                      {isExpired
                        ? "Expired"
                        : needsVerification
                          ? "Verify ticket"
                          : "View ticket"}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketHome;
