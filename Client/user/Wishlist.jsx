import { Listbox } from "@headlessui/react";
import { useState, useEffect } from "react";
import {
  Check,
  ChevronDown,
  Heart,
  Share2,
  MapPin,
  Star,
  Ticket,
  Trash2,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { eventService } from "../src/Context/ApiEvent";
import { useService } from "@/Context/ServiceContext";
import { Link } from "react-router-dom";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";
import { motion, AnimatePresence } from "framer-motion";

const Wishlist = () => {
  const options = [
    { id: 1, label: "Recently Added", value: "recently" },
    { id: 2, label: "Most Popular", value: "popular" },
    { id: 3, label: "Top Rated", value: "top" },
  ];

  const { mutation: wishlistMutation } = useWishlistMutation();
  const [selected, setSelected] = useState(options[0]);
  const [hasAlerted, setHasAlerted] = useState(false);
  const { API_URL } = useService();
  const { events, wishlist, wishlistLoading, wishlistIsError } = eventService();

  useEffect(() => {
    if (wishlistIsError && !hasAlerted) {
      toast.error("Access Required. Please sign in.", {
        style: {
          background: "#121417",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.05)",
        },
      });
      setHasAlerted(true);
    }
  }, [wishlistIsError, hasAlerted]);

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

    const isCurrentlyAdded = checkWishlist(eventId);

    wishlistMutation.mutate({
      eventId: eventId,
      ticketId: ticketId,
      isAdding: !isCurrentlyAdded,
    });
  };

  if (wishlistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/[0.05] border-t-[#FF7A00] rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            Syncing Collection
          </span>
        </div>
      </div>
    );
  }

  const items = (wishlist?.wishlist?.items || []).filter(
    (item) => item?.eventId?._id,
  );
  console.log(items);

  const sortedItems = selected
    ? [...items].sort((a, b) => {
        const eventA = a.eventId || {};
        const eventB = b.eventId || {};
        switch (selected.value) {
          case "recently":
            return (
              new Date(eventB.createdAt || 0) - new Date(eventA.createdAt || 0)
            );
          case "popular":
            return (eventB.views || 0) - (eventA.views || 0);
          case "top":
            return (eventB.rating?.score || 0) - (eventA.rating?.score || 0);
          default:
            return 0;
        }
      })
    : items;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">


      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-[#FF7A00]"
          >
            <Heart size={14} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Personal Collection
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
            Saved{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">
              Events
            </span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {items.length > 0 && (
            <div className="px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">
              {items.length} Items Locked
            </div>
          )}

          <Listbox value={selected} onChange={setSelected}>
            <div className="relative w-full sm:w-56">
              <Listbox.Button className="relative w-full h-12 cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.02] text-white px-5 text-[11px] font-black uppercase tracking-widest flex items-center justify-between outline-none hover:bg-white/[0.05] transition-all">
                <span>{selected ? selected.label : "Filter"}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </Listbox.Button>

              <AnimatePresence>
                <Listbox.Options className="absolute z-50 mt-2 w-full rounded-2xl bg-[#121417] border border-white/[0.08] shadow-2xl overflow-hidden py-1">
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      value={option}
                      className={({ active }) =>
                        `cursor-pointer px-5 h-12 flex items-center text-[10px] font-black uppercase tracking-widest transition-colors ${
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
              </AnimatePresence>
            </div>
          </Listbox>
        </div>
      </div>

      {/* ── CONTENT ── */}
      {sortedItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[400px] text-center border border-dashed border-white/[0.08] rounded-[3rem] p-12 bg-white/[0.01]"
        >
          <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-8 relative">
            <Heart size={32} className="text-gray-700" />
            <div className="absolute inset-0 border border-[#FF7A00]/20 rounded-full animate-ping" />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">
            Your vault is empty
          </h3>
          <p className="text-gray-500 text-sm max-w-xs mb-10 font-medium">
            Events you heart will be stored here for quick access later.
          </p>
          <Link to="/event">
            <button className="group px-8 py-4 bg-[#FF7A00] text-black text-xs font-black uppercase  rounded-2xl flex items-center gap-3 hover:bg-white transition-all active:scale-95">
              Add Events you like
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 px-4">
          <AnimatePresence mode="popLayout">
            {sortedItems.map((item, idx) => {
              const w = item.eventId || {};
              const ticket = item.ticketId || {};
              const isMutating = wishlistMutation.variables?.eventId === w._id;
              const isAdded = checkWishlist(w._id);

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -50 }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className="group relative w-full flex flex-col md:flex-row items-stretch bg-white/[0.02] border border-white/[0.06] rounded-[2rem] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#FF7A00]/0 via-[#FF7A00]/0 to-[#FF7A00]/20 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity pointer-events-none" />

                  {/* IMAGE SECTION */}
                  <Link
                    to={
                      ticket?._id
                        ? `/events/${w._id}/tickets/${ticket._id}`
                        : `/events/${w._id}`
                    }
                    className="relative w-full md:w-80 h-64 md:h-auto shrink-0 overflow-hidden block"
                  >
                    <img
                      src={w?.pictures?.[0] || "/Login.jpg"}
                      alt={w?.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121417] via-transparent to-transparent md:bg-gradient-to-r" />

                    {/* Badge */}
                    <div className="absolute top-6 left-6 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#FF7A00]">
                      {w?.category || "Live Event"}
                    </div>
                  </Link>

                  {/* INFO SECTION */}
                  <div className="flex-1 p-8 md:p-10 flex flex-col justify-between relative z-10">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              fill="currentColor"
                              className="opacity-80"
                            />
                          ))}
                          <span className="text-[10px] font-black ml-1 text-gray-500">
                            {w?.rating?.score || "4.8"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={12} strokeWidth={3} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {w?.locale || "Main Venue"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                          {w?.name}
                        </h3>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-md line-clamp-2">
                          Experience the pulse of the city at this exclusive
                          gathering. Secured by Paysso Interactive.
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/[0.04] flex items-center justify-between gap-6">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                          Starting From
                        </p>
                        <p className="text-2xl font-black italic text-white leading-none">
                          {w?.priceRanges?.[0]?.min || "0"}
                          <span className="text-[#FF7A00] ml-1 text-sm tracking-normal capitalize">
                            ETB
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-1 max-w-[280px]">
                        <Link
                          to={
                            ticket?._id
                              ? `/events/${w._id}/tickets/${ticket._id}`
                              : `/events/${w._id}`
                          }
                          className="flex-1"
                        >
                          <button className="w-full py-4 bg-white text-black text-[10px] font-black uppercase italic rounded-xl hover:bg-[#FF7A00] transition-all active:scale-95">
                            Details
                          </button>
                        </Link>

                        <button
                          onClick={(e) =>
                            handleWishlistToggle(w._id, ticket._id, e)
                          }
                          disabled={wishlistMutation.isLoading && isMutating}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 transition-all ${
                            isAdded
                              ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                              : "bg-white/[0.02] text-gray-400 hover:text-white hover:border-white/20"
                          } ${
                            wishlistMutation.isLoading && isMutating
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {wishlistMutation.isLoading && isMutating ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>

                        <button className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 flex items-center justify-center transition-all">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
