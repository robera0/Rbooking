// src/user/UserHome.jsx
// Posh-inspired Discover page: editorial heading, featured hero, sticky filters
// and a poster grid. Backed by GET /api/events and GET /api/featuredEvents.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Ticket,
  X,
} from "lucide-react";
import { eventService } from "@/Context/ApiEvent";
import { useService } from "@/Context/ServiceContext";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";
import { sortFeaturedEvents } from "@/lib/featuredEventsSort";
import { isEventSoldOut } from "@/lib/soldOut";
import { CalendarDemo } from "@/components/ui/calendar";
import toast from "react-hot-toast";
import EventTile, {
  eventDateLabel,
  eventImageUrl,
  eventHref,
  eventPriceLabel,
  eventVenueLabel,
} from "./components/EventTile";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Concerts", value: "concert" },
  { label: "Festivals", value: "festival" },
  { label: "Events", value: "generic" },
];

const GRID_CLASS =
  "grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-6";

/* How long each hero event stays on screen before the next one slides in. */
const HERO_INTERVAL = 6000;
const HERO_MAX_SLIDES = 5;

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

const UserHome = () => {
  const [dateOpen, setDateOpen] = useState(false);
  const {
    user,
    wishlist,
    events,
    eventLoading,
    featuredEvents,
    featuredEventLoading,
  } = eventService();
  const {
    type,
    setType,
    date,
    setDate,
    artist,
    setArtist,
    venues,
    setVenues,
    search,
    setSearch,
    setCommentId,
    API_URL,
  } = useService();
  const { mutation: wishlistMutation } = useWishlistMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const list = useMemo(() => events?.events ?? [], [events]);
  // Sold-out and finished events sink to the bottom, the rest sort by date.
  const featured = useMemo(
    () => sortFeaturedEvents(featuredEvents?.events ?? []),
    [featuredEvents],
  );

  const isSoldOut = isEventSoldOut;

  // The hero only ever shows events that can still be booked. Sold-out and
  // finished events are filtered out, then the remainder rotates on a timer.
  const heroSlides = useMemo(() => {
    const seen = new Set();
    return [...featured, ...list]
      .filter((event) => {
        if (!event?._id || seen.has(event._id)) return false;
        seen.add(event._id);
        return !isSoldOut(event);
      })
      .slice(0, HERO_MAX_SLIDES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featured, list]);

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const slidesKey = heroSlides.map((event) => event._id).join(",");

  // Filters can change the slide list underneath us - restart from the first.
  useEffect(() => {
    setHeroIndex(0);
  }, [slidesKey]);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return undefined;
    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion || heroPaused || heroSlides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setHeroIndex((index) => (index + 1) % heroSlides.length);
      }
    }, HERO_INTERVAL);
    return () => window.clearInterval(timer);
  }, [reduceMotion, heroPaused, heroSlides.length, slidesKey]);

  const hero = heroSlides[heroIndex] ?? heroSlides[0] ?? null;

  const featuredRow = useMemo(() => {
    const slideIds = new Set(heroSlides.map((event) => event._id));
    return [...featured, ...list]
      .filter((event) => event?._id && !slideIds.has(event._id))
      .slice(0, 4);
  }, [featured, list, heroSlides]);

  const loading = eventLoading || featuredEventLoading;
  const hasFilters = Boolean(type || date || artist || venues || search);

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
    setVenues("");
    setSearch("");
  };

  const selectedDateLabel =
    date instanceof Date
      ? date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Date";

  const renderTile = (event) => (
    <motion.div
      key={event._id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <EventTile
        event={event}
        apiUrl={API_URL}
        soldOut={isSoldOut(event)}
        isWishlisted={checkWishlist(event._id)}
        onWishlist={handleWishlistToggle}
        onOpen={(item) => setCommentId(item._id)}
      />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#121417] pb-28 text-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* ── Page heading ───────────────────────────────────────────── */}
        <header className="pt-10 sm:pt-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF7A00]">
            Addis Ababa · Live events
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Discover Events
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
            The city&apos;s best nights, all in one place. Find a show, grab a
            seat, and go.
          </p>
        </header>

        {/* ── Featured hero (auto-rotates through bookable events) ────── */}
        {hero && (
          <section
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured events"
            className="mt-8"
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            onFocusCapture={() => setHeroPaused(true)}
            onBlurCapture={() => setHeroPaused(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-[#1C1F22]"
            >
              <div className="relative aspect-[16/11] sm:aspect-[21/9]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={hero._id}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <Link
                      to={eventHref(hero, false)}
                      onClick={() => setCommentId(hero._id)}
                      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF7A00]"
                    >
                      <img
                        src={eventImageUrl(hero, API_URL)}
                        alt={hero.name}
                        onError={(imageEvent) => {
                          imageEvent.currentTarget.onerror = null;
                          imageEvent.currentTarget.src = "/datebackground.jpg";
                        }}
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />

                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
                        <span className="inline-flex items-center rounded-full bg-[#FF7A00] px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-black">
                          Featured
                        </span>
                        <h2 className="mt-3 max-w-4xl text-xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                          {hero.name}
                        </h2>
                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-white/70">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={14} className="text-[#FF7A00]" />
                            {eventDateLabel(hero)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MapPin size={14} className="text-[#FF7A00]" />
                            {eventVenueLabel(hero)}
                          </span>
                          <span className="font-semibold text-[#FF7A00]">
                            {eventPriceLabel(hero)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </AnimatePresence>

                {heroSlides.length > 1 && (
                  <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-2 backdrop-blur-md sm:right-6 sm:top-6">
                    {heroSlides.map((slide, index) => {
                      const active = index === heroIndex;
                      return (
                        <button
                          key={slide._id}
                          type="button"
                          onClick={() => setHeroIndex(index)}
                          aria-label={`Show ${slide.name}`}
                          aria-current={active ? "true" : undefined}
                          className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                            active
                              ? "w-7 bg-white/25"
                              : "w-1.5 bg-white/30 hover:bg-white/60"
                          }`}
                        >
                          {active && !reduceMotion && (
                            <span
                              key={hero._id}
                              className="hero-progress absolute inset-0 origin-left rounded-full bg-[#FF7A00]"
                              style={{
                                animationDuration: `${HERO_INTERVAL}ms`,
                                animationPlayState: heroPaused
                                  ? "paused"
                                  : "running",
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </section>
        )}

        {/* ── Featured row ───────────────────────────────────────────── */}
        {featuredRow.length > 0 && (
          <section className="pt-10">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                Featured this week
              </h2>
              <Link
                to="/event"
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-[#FF7A00]"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className={GRID_CLASS}>{featuredRow.map(renderTile)}</div>
          </section>
        )}

        {/* ── Sticky filter bar ──────────────────────────────────────── */}
        <div className="sticky top-[64px] z-30 -mx-5 mt-10 border-y border-white/[0.06] bg-[#121417]/90 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
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

        {/* ── All events ─────────────────────────────────────────────── */}
        <section className="pt-8">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              All events
            </h2>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              {loading ? "Loading" : `${list.length} results`}
            </span>
          </div>

          {loading ? (
            <div className={GRID_CLASS}>
              {Array.from({ length: 8 }).map((_, index) => (
                <TileSkeleton key={index} />
              ))}
            </div>
          ) : list.length > 0 ? (
            <div className={GRID_CLASS}>{list.slice(0, 16).map(renderTile)}</div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/[0.08] bg-white/[0.01] px-6 py-24 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03]">
                <Ticket size={26} className="text-gray-700" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                No events found
              </h3>
              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Try a different search, or clear your filters to see everything
                happening in the city.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-8 rounded-full bg-[#FF7A00] px-7 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#121417]"
              >
                Clear filters
              </button>
            </div>
          )}

          {!loading && list.length > 16 && (
            <div className="mt-12 flex justify-center">
              <Link
                to="/event"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-7 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:border-[#FF7A00] hover:text-[#FF7A00] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
              >
                View all events <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserHome;
