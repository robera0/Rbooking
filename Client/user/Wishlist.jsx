// src/user/Wishlist.jsx
// Posh-style saved events page: poster grid with sort control.
// Maps to GET /api/auth/wishlist and the wishlist add/remove mutations.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Listbox } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Heart, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { eventService } from "../src/Context/ApiEvent";
import { useService } from "@/Context/ServiceContext";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";
import { isEventPassed8Hours } from "@/lib/utils";
import EventTile from "./components/EventTile";

const SORT_OPTIONS = [
  { id: 1, label: "Recently added", value: "recently" },
  { id: 2, label: "Most popular", value: "popular" },
  { id: 3, label: "Top rated", value: "top" },
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

const Wishlist = () => {
  const { mutation: wishlistMutation } = useWishlistMutation();
  const [selected, setSelected] = useState(SORT_OPTIONS[0]);
  const { API_URL } = useService();
  const { wishlist, wishlistLoading, wishlistIsError } = eventService();

  useEffect(() => {
    if (wishlistIsError) {
      toast.error("Couldn't load your wishlist. Please try again.", {
        id: "wishlist-error",
        style: {
          background: "#121417",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.05)",
        },
      });
    }
  }, [wishlistIsError]);

  const items = (wishlist?.wishlist?.items || []).filter(
    (item) => item?.eventId?._id,
  );

  const sortedItems = [...items].sort((a, b) => {
    const eventA = a.eventId || {};
    const eventB = b.eventId || {};
    switch (selected.value) {
      case "popular":
        return (eventB.views || 0) - (eventA.views || 0);
      case "top":
        return (eventB.rating?.score || 0) - (eventA.rating?.score || 0);
      case "recently":
      default:
        return (
          new Date(eventB.createdAt || 0) - new Date(eventA.createdAt || 0)
        );
    }
  });

  const handleWishlistToggle = (eventId, ticketId, clickEvent) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();

    wishlistMutation.mutate({
      eventId,
      ticketId,
      isAdding: false,
    });
  };

  const shareEvent = async (eventData, clickEvent) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();

    const shareUrl = `${window.location.origin}/events/${eventData?._id}`;
    const sharePayload = {
      title: eventData?.name || "Check out this event",
      text: eventData?.desc || `Get your tickets for ${eventData?.name || ""}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Event link copied", { id: "copy-success" });
    } catch {
      toast.error("Failed to copy link.", { id: "copy-error" });
    }
  };

  const hrefFor = (item) =>
    item?.ticketId?._id
      ? `/events/${item.eventId._id}/tickets/${item.ticketId._id}`
      : `/events/${item?.eventId?._id}`;

  return (
    <div className="min-h-screen bg-[#121417] pb-28 text-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-6 pt-10 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF7A00]">
              Saved events
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your Wishlist
            </h1>
            <p className="mt-3 text-sm text-gray-400">
              {items.length === 0
                ? "Nothing saved yet"
                : `${items.length} saved ${
                    items.length === 1 ? "event" : "events"
                  }`}
            </p>
          </div>

          <Listbox value={selected} onChange={setSelected}>
            <div className="relative w-full sm:w-52">
              <Listbox.Button className="flex h-10 w-full items-center justify-between rounded-full border border-white/[0.08] bg-white/[0.02] px-4 text-[11px] font-semibold text-gray-200 outline-none transition hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[#FF7A00]">
                <span>{selected.label}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </Listbox.Button>

              <Listbox.Options className="absolute right-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1C1F22] py-1 shadow-2xl">
                {SORT_OPTIONS.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    value={option}
                    className={({ active }) =>
                      `cursor-pointer px-4 py-2.5 text-[11px] font-semibold transition-colors ${
                        active
                          ? "bg-[#FF7A00] text-black"
                          : "text-gray-400 hover:text-white"
                      }`
                    }
                  >
                    {option.label}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </header>

        {/* ── Content ────────────────────────────────────────────────── */}
        <section className="pt-8">
          {wishlistLoading ? (
            <div className={GRID_CLASS}>
              {Array.from({ length: 8 }).map((_, index) => (
                <TileSkeleton key={index} />
              ))}
            </div>
          ) : sortedItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/[0.08] bg-white/[0.01] px-6 py-24 text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03]">
                <Heart size={26} className="text-gray-700" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Nothing saved yet
              </h2>
              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Tap the heart on any event and it will show up here.
              </p>
              <Link
                to="/event"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FF7A00] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#121417]"
              >
                Find events <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <div className={GRID_CLASS}>
              <AnimatePresence mode="popLayout">
                {sortedItems.map((item) => {
                  const event = item.eventId;
                  return (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <EventTile
                        event={event}
                        apiUrl={API_URL}
                        href={hrefFor(item)}
                        soldOut={isEventPassed8Hours(event)}
                        isWishlisted
                        onWishlist={(_, clickEvent) =>
                          handleWishlistToggle(
                            event._id,
                            item.ticketId?._id,
                            clickEvent,
                          )
                        }
                        onShare={shareEvent}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {!wishlistLoading && sortedItems.length > 0 && (
            <div className="mt-12 flex justify-center">
              <Link
                to="/event"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
              >
                <Ticket size={14} /> Browse more events
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Wishlist;
