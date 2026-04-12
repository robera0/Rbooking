import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  ClockFading,
  Heart,
  Share2,
  Ticket,
  Star,
  MoveRight,
  Search,
  ChevronDown,
  X,
  ShieldCheck,
  RotateCcw,
  User,
  MessageSquare,
  ThumbsUp,
  MoreHorizontal,
  SquarePen,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import L from "leaflet";
import toast from "react-hot-toast";

// Project Context & API
import { useService } from "@/Context/ServiceContext";
import { eventService } from "@/Context/ApiEvent";
import { useWishlistMutation } from "./api/addwishlist.api";
import CheckoutModal from "../src/components/Reusable";

// Skeleton Component for clean loading states
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

const EventInfo = () => {
  const queryClient = new QueryClient();
  const { eventId, ticketId } = useParams();
  const {
    setEditMenuActive,
    setCheckoutOpen,
    checkoutOpen,
    quantity,
    API_URL,
  } = useService();
  const { fetchEventById, wishlist } = eventService();
  const { mutation: wishlistMutation } = useWishlistMutation();

  const [activeTab, setActiveTab] = useState("intel");
  const [showMore, setShowMore] = useState(false);
  const [position, setPosition] = useState(null);

  // Data Fetching
  const { data: event_id, isLoading } = useQuery({
    queryKey: ["event", eventId, ticketId],
    queryFn: () => fetchEventById(eventId, ticketId),
  });

  const event = event_id?.event || null;
  const ticket = event_id?.ticket || null;
  const addFav =
    wishlist?.wishlists?.events?.some((item) => item?._id === event?._id) ||
    false;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    wishlistMutation.mutate({ event_id: event?._id, addFaving: !addFav });
  };

  // 1. SKELETON RENDERER
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F5] p-6 lg:p-12 space-y-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full md:w-3/4" />
            <Skeleton className="h-[400px] md:h-[500px] w-full rounded-[2rem]" />
          </div>
          <aside className="lg:col-span-4">
            <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F5] antialiased">
      {/* 2. REFINED NAV (Design 1) */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-8">
          {/* Responsive Search Bar (Design 1) */}
          <div
            onClick={() => setEditMenuActive(true)}
            className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 gap-3 cursor-pointer hover:bg-white/10 transition-all"
          >
            <Search size={14} className="text-gray-500" />
            <input
              placeholder=" Search events..."
              className="text-[10px] font-bold text-gray-500  tracking-widest w-48 outline-none"
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-24">
        {/* Mobile Search Trigger */}
        <div className="md:hidden mb-8">
          <button
            onClick={() => setEditMenuActive(true)}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest"
          >
            <Search size={16} /> Edit Search
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-12">
            {/* TITLE BLOCK */}
            <header className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-[#FF7A00]/10 text-[#FF7A00] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border border-[#FF7A00]/20">
                  Confirmed Transmission
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 italic">
                  <ClockFading size={14} />{" "}
                  {moment(event?.dates?.start?.localDate).format("DD.MM.YYYY")}{" "}
                  @ {event?.dates?.start?.localTime || "22:00"}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9] text-white">
                {event?.name} <br />
                <span className="text-gray-800">
                  {event?.tagline || "Underground Feed"}
                </span>
              </h1>
              <div className="flex items-center gap-2 text-gray-400 group cursor-pointer hover:text-white transition-colors w-fit">
                <MapPin size={16} />
                <span className="text-sm font-bold uppercase tracking-tight">
                  {event?._embedded?.venues?.[0]?.name || "Sector 7 Hangar"}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <button
                  onClick={handleWishlistToggle}
                  className="hover:scale-110 transition-transform"
                >
                  <Heart
                    size={20}
                    fill={addFav ? "#FF7A00" : "none"}
                    stroke={addFav ? "#FF7A00" : "currentColor"}
                  />
                </button>
                <Share2
                  size={20}
                  className="cursor-pointer hover:text-[#FF7A00]"
                />
              </div>
            </header>

            {/* ASYMMETRIC GRID */}
            <div className="grid grid-cols-12 gap-4 h-[400px] md:h-[500px]">
              <div className="col-span-8 rounded-[2rem] overflow-hidden border border-white/5 group relative bg-neutral-900">
                <img
                  src={event?.images?.[0]?.url || event?.pictures?.[0]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
              </div>
              <div className="col-span-4 flex flex-col gap-4">
                <div className="h-1/2 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl bg-neutral-900">
                  <img
                    src={event?.images?.[1]?.url || event?.pictures?.[1]}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-1/2 rounded-[2rem] overflow-hidden bg-[#161618] border border-white/5 flex flex-col items-center justify-center cursor-pointer group hover:bg-white/5 transition-all">
                  <span className="text-3xl font-black italic tracking-tighter text-white">
                    +{event?.images?.length || 0}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF7A00]">
                    Archive
                  </span>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="space-y-8">
              <div className="flex gap-8 border-b border-white/5">
                {["intel", "logistics"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${
                      activeTab === tab
                        ? "text-[#FF7A00]"
                        : "text-gray-600 hover:text-white"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF7A00]"
                      />
                    )}
                  </button>
                ))}
              </div>

              {activeTab === "intel" ? (
                <div className="space-y-6">
                  <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-3xl italic">
                    "
                    {event?.description ||
                      event?.desc ||
                      "No encrypted description available for this transmission."}
                    "
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    {["VIP LOUNGE", "VALET", "DOLBY", "4K PROJECTION"].map(
                      (item) => (
                        <div
                          key={item}
                          className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center"
                        >
                          <p className="text-[10px] font-black uppercase text-gray-400">
                            {item}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[400px] rounded-3xl overflow-hidden border border-white/5 grayscale">
                  <MapContainer
                    center={[9.03, 38.74]}
                    zoom={13}
                    className="h-full w-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {position && <Marker position={position} />}
                  </MapContainer>
                </div>
              )}
            </div>

            {/* COMMENTS */}
            <section className="pt-12 space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl uppercase  tracking-tighter">
                  Reviews
                </h3>
                <div className="flex items-center gap-1 text-[#FF7A00]">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-black italic">
                    {event?.rating || "4.9"}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {(event?.comments || []).length > 0 ? (
                  event.comments.map((rev, i) => (
                    <div
                      key={i}
                      className="group relative bg-white/[0.01] hover:bg-white/[0.02] p-6 rounded-3xl border border-white/5 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] font-black text-sm italic">
                          {rev.user?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black uppercase italic text-white">
                              {rev.user || "Verified User"}
                            </span>
                            <span className="text-[10px] font-bold text-gray-600 uppercase">
                              {moment(rev.createdAt).fromNow()}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm md:text-base italic leading-relaxed font-medium">
                            "{rev.text}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      No transmissions recorded yet
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-[#111112] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Ticket size={120} />
              </div>

              <div className="relative z-10 space-y-8">
                <div>
                  <p className="text-[10px] font-black text-gray-600 tracking-[0.4em] uppercase mb-2">
                    Access Protocol
                  </p>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    {ticket?.type || "Standard Access"}
                  </h2>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter italic text-white">
                    ${ticket?.price || "45"}
                  </span>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-widest italic">
                    USD / Unit
                  </span>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full py-5 bg-[#FF7A00] text-black font-black uppercase italic text-xs rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,122,0,0.15)]"
                  >
                    SECURE ENTRY <MoveRight size={18} />
                  </button>

                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="w-full py-4 border border-white/5 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    {showMore ? "Collapse Tiers" : "Explore All Tiers"}{" "}
                    <ChevronDown
                      size={14}
                      className={showMore ? "rotate-180" : ""}
                    />
                  </button>
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center gap-4">
                  <ShieldCheck size={20} className="text-[#FF7A00]" />
                  <p className="text-[9px] font-black text-gray-500 uppercase leading-tight tracking-widest">
                    Encrypted <br /> Checkout Terminal
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* MODAL INTEGRATION */}
      <AnimatePresence>
        {checkoutOpen && (
          <div
            className="fixed inset-0 z-[200] lg:pt-2 flex items-center justify-center p-6 bg-black/2 backdrop-blur-sm"
            onClick={() => setCheckoutOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#191B1D] p-8 rounded-[2rem] border border-white/10"
            >
              <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                amount={ticket?.price}
                name={event?.name}
                action={() => {
                  /* Mutation Logic */
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventInfo;
