// src/user/Events.jsx
// Posh-inspired Explore page: filter pills, search and a dense poster grid.
// Backed by GET /api/events (filters are sent as query params).

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Search,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { eventService } from "@/Context/ApiEvent";
import { useService } from "@/Context/ServiceContext";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";
import { isEventSoldOut, sinkSoldOutEvents } from "@/lib/soldOut";
import { CalendarDemo } from "@/components/ui/calendar";
import toast from "react-hot-toast";
import EventTile from "./components/EventTile";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Events", value: "generic" },
  { label: "Concerts", value: "concert" },
  { label: "Festivals", value: "festival" },
];

const GRID_CLASS =
  "grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-6";

const TileSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[4/5] rounded-2xl bg-white/[0.04]" />
    <div className="mt-3 space-y-2">
      <div className="h-3.5 w-4/5 rounded bg-white/[0.05]" />
      <div className="h-2.5 w-1/2 rounded bg-white/[0.03]" />
      <div className="h-2.5 w-1/4 rounded bg-white/[0.03]" />
    </div>
  </div>
);

const Events = () => {
  const [dateOpen, setDateOpen] = useState(false);
  const {
    type,
    setType,
    date,
    setDate,
    venues,
    setVenues,
    artist,
    setArtist,
    search,
    setSearch,
    API_URL,
    setCommentId,
  } = useService();
  const { events, eventLoading, user, wishlist } = eventService();
  const { mutation: wishlistMutation } = useWishlistMutation();
  const navigate = useNavigate();
  const location = useLocation();

  // Sold-out events sit at the end so the list opens on bookable ones.
  const filteredEvents = useMemo(
    () => sinkSoldOutEvents(events?.events),
    [events],
  );
  const hasFilters = Boolean(type || date || artist || venues || search);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const checkWishlist = (eventId) =>
    Boolean(
      wishlist?.wishlist?.items?.some(
        (item) => item?.eventId?._id === eventId,
      ),
    );

  const handleWishlistToggle = (event, clickEvent) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();

    if (!user) {
      toast.error("Please sign in to save events", { id: "signin-required" });
      navigate("/login", { state: { from: location } });
      return;
    }

    wishlistMutation.mutate({
      eventId: event._id,
      ticketId: event.tickets?.[0]?._id,
      isAdding: !checkWishlist(event._id),
    });
  };

  const clearFilters = () => {
    setType("");
    setDate("");
    setArtist("");
    setSearch("");
    setVenues("");
  };

  const selectedDateLabel =
    date instanceof Date
      ? date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Date";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#121417] pb-28 text-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* ── Page heading ───────────────────────────────────────────── */}
        <header className="pt-10 sm:pt-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF7A00]">
            Browse the calendar
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Explore
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
            Every event on Paysso, in one feed. Filter by what you&apos;re into
            and find your next night out.
          </p>
        </header>

        {/* ── Sticky filter bar ──────────────────────────────────────── */}
        <div className="sticky top-[64px] z-30 -mx-5 mt-8 border-y border-white/[0.06] bg-[#121417]/90 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
              {CATEGORIES.map((category) => {
                const active = type === category.value;
                return (
                  <button
                    key={category.label}
                    type="button"
                    onClick={() => {
                      setType(category.value);
                      setDate("");
                      setArtist("");
                      setVenues("");
                    }}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] ${
                      active
                        ? "bg-[#FF7A00] text-black"
                        : "border border-white/[0.08] bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setDateOpen((open) => !open)}
                  aria-expanded={dateOpen}
                  aria-label="Filter by date"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] ${
                    date
                      ? "bg-[#FF7A00] text-black"
                      : "border border-white/[0.08] bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <CalendarDays size={13} />
                  {selectedDateLabel}
                </button>

                <AnimatePresence>
                  {dateOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className="absolute left-0 top-[120%] z-50 origin-top-left rounded-2xl border border-white/[0.1] bg-[#1C1F22] p-3 shadow-2xl"
                    >
                      <CalendarDemo
                        mode="single"
                        selected={date}
                        onSelect={(picked) => {
                          setDate(picked);
                          setDateOpen(false);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="shrink-0 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="search"
                value={search || ""}
                onChange={(inputEvent) => setSearch(inputEvent.target.value)}
                placeholder="Search events, artists, venues"
                aria-label="Search events"
                className="h-11 w-full rounded-full border border-white/[0.08] bg-white/[0.02] pl-11 pr-10 text-[12px] font-semibold text-white outline-none transition placeholder:text-gray-600 focus:border-[#FF7A00]/50 focus:bg-white/[0.04]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Result count ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-6">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
            <SlidersHorizontal size={12} />
            {eventLoading
              ? "Loading"
              : `${filteredEvents.length} ${
                  filteredEvents.length === 1 ? "event" : "events"
                }`}
          </span>
          <Link
            to="/"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 transition hover:text-[#FF7A00]"
          >
            Back to discover
          </Link>
        </div>

        {/* ── Grid ───────────────────────────────────────────────────── */}
        <section className="pt-6">
          <AnimatePresence mode="wait">
            {eventLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={GRID_CLASS}
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <TileSkeleton key={index} />
                ))}
              </motion.div>
            ) : filteredEvents.length > 0 ? (
              <motion.div
                key="grid"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                }}
                className={GRID_CLASS}
              >
                {filteredEvents.map((event) => {
                  const soldOut = isEventSoldOut(event);
                  return (
                    <motion.div
                      key={event._id}
                      variants={{
                        hidden: { opacity: 0, y: 18 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                      }}
                    >
                      <EventTile
                        event={event}
                        apiUrl={API_URL}
                        soldOut={soldOut}
                        isWishlisted={checkWishlist(event._id)}
                        onWishlist={handleWishlistToggle}
                        onOpen={(item) => setCommentId(item._id)}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/[0.08] bg-white/[0.01] px-6 py-24 text-center"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03]">
                  <SearchX size={26} className="text-gray-700" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">
                  Nothing here yet
                </h2>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  No events match these filters. Try widening your search or
                  clearing everything.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-8 rounded-full bg-[#FF7A00] px-7 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#121417]"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default Events;
