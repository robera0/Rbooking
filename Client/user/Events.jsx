import React from "react";
import { eventService } from "@/Context/ApiEvent.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Star,
  MapPin,
  Heart,
  Share2,
  SearchX,
  Ticket,
  Calendar,
  Filter,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";
import { useService } from "@/Context/ServiceContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const Events = () => {
  const {
    type,
    setType,
    date,
    venues,
    setVenues,
    setDate,
    artist,
    setArtist,
    search,
    setSearch,
  } = useService();
  const { events, user, isLoading, error, wishlist, wishlistIsError } =
    eventService();
  const { mutation: wishlistMutation } = useWishlistMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const filteredEvents = events?.events || [];

  const checkWishlist = (eventId) => {
    return (
      wishlist?.wishlist?.items?.some(
        (item) => item?.eventId?._id === eventId,
      ) || false
    );
  };

  const handleWishlistToggle = (eventId, ticketId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to save events");
      navigate("/login", { state: { from: location } });
      return;
    }

    const isCurrentlyAdded = checkWishlist(eventId);
    wishlistMutation.mutate({
      eventId: eventId,
      ticketId: ticketId,
      isAdding: !isCurrentlyAdded,
    });
  };

  const filterButtons = [
    { name: "All Experiences", type: "" },
    { name: "Concerts", type: "concert" },
    { name: "Festivals", type: "festival" },
    { name: "Exclusives", type: "exclusive" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#121417] text-white overflow-hidden pb-32">
      <Toaster position="top-center" />

      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#FF7A00]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-white/[0.02] blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-4  py-2.5 md:px-8 lg:px-12 pt-20 md:pt-24 lg:pt-32">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-6 mb-14 md:mb-20">
          <div className="max-w-2xl space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-[#FF7A00]"
            >
              <TrendingUp size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Live & Verified
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter leading-[0.85]"
            >
              Discover <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">
                The Unseen
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 text-sm md:text-base font-medium max-w-lg leading-relaxed"
            >
              Browse all {events?.events?.length || "premium"} events in one
              cinematic vault. Filters act as your pass to the front row.
            </motion.p>
          </div>

          <div className="flex items-start gap-4 w-full md:w-auto md:shrink-0">
            <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.08] backdrop-blur-xl max-w-full overflow-hidden">
              {filterButtons.map((b, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (b.name === "All Experiences") {
                      setType("");
                    } else {
                      setType(b.type);
                    }
                    setDate("");
                    setArtist("");
                    setSearch("");
                    setVenues("");
                  }}
                  className={`px-3 md:px-2.5 lg:px-4 py-2 md:py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    b.type === type ||
                    (b.name === "All Experiences" && type === "")
                      ? "bg-[#FF7A00] text-black shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── SEARCH & ACTIVE FILTERS ── */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-16">
          <div className="relative flex-1 group w-full">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FF7A00] transition-colors">
              <Filter size={18} />
            </div>
            <input
              type="text"
              value={search || type}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event name, genre, or venue..."
              className="w-full h-16 bg-white/[0.02] border border-white/[0.08] rounded-2xl pl-16 pr-6 text-sm font-bold placeholder:text-gray-700 outline-none focus:border-[#FF7A00]/40 transition-all focus:bg-white/[0.04]"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => {
                    setType("");
                    setDate("");
                    setArtist("");
                    setSearch("");
                    setVenues("");
                  }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/[0.08] hover:bg-[#FF7A00] flex items-center justify-center transition-colors group/clear"
                  aria-label="Clear search and filters"
                >
                  <X
                    size={13}
                    className="text-gray-400 group-hover/clear:text-black transition-colors"
                  />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RESULTS GRID ── */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              className="flex flex-col items-center justify-center py-40 gap-6"
            >
              <div className="w-12 h-12 border-2 border-white/[0.05] border-t-[#FF7A00] rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Syncing database
              </span>
            </motion.div>
          ) : filteredEvents.length > 0 ? (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-10"
            >
              {filteredEvents.map((e) => {
                const isSoldOut = e.tickets?.length === 0;
                const isAdded = checkWishlist(e._id);

                return (
                  <motion.div
                    key={e._id}
                    variants={itemVariants}
                    className="group"
                  >
                    <div className="relative mb-5">
                      {/* Sold Out Overlay */}
                      {isSoldOut && (
                        <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[1px] rounded-[2rem] flex items-center justify-center pointer-events-none">
                          <div className="bg-red-600/90 text-white px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-white/20 shadow-2xl">
                            Sold Out
                          </div>
                        </div>
                      )}

                      <Link
                        to={
                          isSoldOut
                            ? "#"
                            : `/events/${e._id}/tickets/${e.tickets?.[0]?._id}`
                        }
                        onClick={(ev) => isSoldOut && ev.preventDefault()}
                        className={`block relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/[0.06] bg-[#1C1F22] transition-all duration-700 ${
                          isSoldOut ? "grayscale" : ""
                        }`}
                      >
                        <img
                          src={e.pictures?.[0] || "/Login.jpg"}
                          alt={e.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                        {/* Instant Details Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                          <div className="flex items-center gap-3 text-white">
                            <Calendar size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {e.dates?.start?.localDate || "TBA"}
                            </span>
                          </div>
                        </div>

                        {/* Location Badge */}
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-2 group-hover:bg-[#FF7A00] transition-colors duration-500">
                          <MapPin
                            size={10}
                            className={
                              isSoldOut
                                ? "text-gray-500"
                                : "text-[#FF7A00] group-hover:text-black"
                            }
                          />
                          <span
                            className={`text-[8px] font-black uppercase tracking-wider ${
                              isSoldOut
                                ? "text-gray-500"
                                : "text-white group-hover:text-black"
                            }`}
                          >
                            {e.locale || "Main Venue"}
                          </span>
                        </div>
                      </Link>

                      {/* Wishlist Button */}
                      <button
                        onClick={(ev) =>
                          handleWishlistToggle(e._id, e.tickets?.[0]?._id, ev)
                        }
                        className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-xl backdrop-blur-md border border-white/10 flex items-center justify-center transition-all active:scale-90 ${
                          isAdded
                            ? "bg-[#FF7A00] border-[#FF7A00] text-black shadow-lg shadow-[#FF7A00]/20"
                            : "bg-black/20 text-white hover:bg-white hover:text-black"
                        }`}
                      >
                        <Heart
                          size={16}
                          fill={isAdded ? "currentColor" : "none"}
                          strokeWidth={2.5}
                        />
                      </button>
                    </div>

                    <div className="space-y-3 px-2">
                      <div className="flex items-center justify-between">
                        <Link
                          to={
                            e.tickets?.length > 0
                              ? `/events/${e._id}/tickets/${e.tickets[0]?._id}`
                              : `/events/${e._id}`
                          }
                        >
                          <h3 className="text-xl font-black uppercase italic tracking-tighter text-white hover:text-[#FF7A00] transition-colors line-clamp-1">
                            {e.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.08]">
                          <Star size={10} fill="#FF7A00" stroke="#FF7A00" />
                          <span className="text-white text-[10px] font-black">
                            {e.rating?.score || "4.9"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between border-t border-white/[0.04] pt-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">
                            Access From
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white italic">
                              ${e.tickets?.[0]?.price || e.price || "0"}
                            </span>
                            <span className="text-[10px] text-gray-600 font-bold">
                              /pp
                            </span>
                          </div>
                        </div>

                        <Link
                          to={
                            e.tickets?.length > 0
                              ? `/events/${e._id}/tickets/${e.tickets[0]?._id}`
                              : `/events/${e._id}`
                          }
                        >
                          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF7A00] hover:text-white transition-colors group/btn">
                            Details{" "}
                            <ArrowRight
                              size={14}
                              className="group-hover/btn:translate-x-1 transition-transform"
                            />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-40 px-6 text-center border border-dashed border-white/[0.08] rounded-[3rem] bg-white/[0.01]"
            >
              <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-8">
                <SearchX size={32} className="text-gray-700" />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-3">
                No matches found
              </h2>
              <p className="text-gray-500 max-w-sm font-medium mb-10">
                We couldn't find any events matching your vault search. Expand
                your parameters to see more.
              </p>
              <button
                onClick={() => {
                  setType("");
                  setDate("");
                  setArtist("");
                  setSearch("");
                  setVenues("");
                }}
                className="px-8 py-4 bg-[#FF7A00] text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-xl"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Events;
