import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  Search,
  Ticket,
  Mic2,
  MapIcon,
  Activity,
  ChevronRight,
  User,
  ArrowRight,
  ShieldCheck,
  Heart,
  Star,
  MapPin,
  ClockFading,
} from "lucide-react";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";
import { CalendarDemo } from "@/components/ui/calendar";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { eventService } from "@/Context/ApiEvent";
import { useService } from "@/Context/ServiceContext";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Skeleton for Featured Event Card
function FeaturedEventSkeleton() {
  return (
    <div className="group animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/4] md:aspect-[3/4] rounded-[1.5rem] md:rounded-[2.2rem] overflow-hidden border border-white/[0.04] bg-[#1C1F22]">
        <Skeleton
          height="100%"
          width="100%"
          className="w-full h-full"
          style={{ minHeight: 180 }}
        />
      </div>
      {/* Metadata */}
      <div className="mt-5 px-1 space-y-4">
        {/* Location + Rating */}
        <div className="flex justify-between items-center">
          <Skeleton height={12} width={80} borderRadius={8} />
          <Skeleton height={20} width={40} borderRadius={8} />
        </div>
        {/* Event Name */}
        <Skeleton height={20} width="75%" borderRadius={8} />
        {/* Price */}
        <div className="flex justify-between items-end pt-1">
          <div className="space-y-2">
            <Skeleton height={12} width={60} borderRadius={8} />
            <Skeleton height={24} width={80} borderRadius={8} />
          </div>
          <Skeleton height={40} width={40} borderRadius={12} />
        </div>
      </div>
    </div>
  );
}

const UserHome = () => {
  const [dateSlide, setDateSlide] = useState(false);
  const { events, isLoading, wishlist, wishlistIsError } = eventService();
  const { type, setType, date, setDate, artist, setArtist } = useService();
  const { mutation: wishlistMutation } = useWishlistMutation();
  const navigate = useNavigate();

  const checkWishlist = (eventId) => {
    return (
      wishlist?.wishlists?.events?.some((item) => item?._id === eventId) ||
      false
    );
  };

  const handleWishlistToggle = (eventId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyAdded = checkWishlist(eventId);

    wishlistMutation.mutate({
      event_id: eventId,
      isAdding: !isCurrentlyAdded,
    });
  };

  // Scroll logic for Hero section
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Animation Variants
  const sectionFade = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
    },
  };

  const dummyEvents = [
    {
      _id: "1",
      name: "Warehouse Project",
      price: "45",
      location: "Manchester",
      img: "/Login.jpg",
    },
    {
      _id: "2",
      name: "Afterlife Ibiza",
      price: "80",
      location: "Hï Ibiza",
      img: "/1308183.jpeg",
    },
    {
      _id: "3",
      name: "Fabric London",
      price: "30",
      location: "London",
      img: "/1763661369611.webp",
    },
    {
      _id: "4",
      name: "Techno Bunker",
      price: "25",
      location: "Berlin",
      img: "/Login.jpg",
    },
  ];

  return (
    <div
      ref={containerRef}
      onClick={() => dateSlide && setDateSlide(false)}
      className="relative min-h-screen bg-[#121417] text-white selection:bg-[#FF7A00]/20 pb-32 overflow-x-hidden"
    >
      {/* ================= 1. HERO SECTION ================= */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        className="relative w-full px-6 lg:px-10 pt-10 lg:pt-20 pb-24 flex flex-col lg:flex-row items-center gap-12 max-w-[1380px] mx-auto z-10"
      >
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#FF7A00] text-[8px] font-black uppercase tracking-[0.3em]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF7A00]"></span>
            </span>
            Live in your city
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl  tracking-tighter leading-[0.85] uppercase ">
            DON'T JUST <br /> WATCH. <br />{" "}
            <span className="text-[#FF7A00]">BE THERE.</span>
          </h1>
          <p className="max-w-sm text-gray-500 text-[13px] md:text-sm font-medium leading-relaxed">
            Access the exclusive pulse of the night. From warehouse raves to
            stadium anthems, Paysso is your verified bridge to the stage.
          </p>
          <button
            onClick={() => navigate("/event")}
            className="group flex items-center gap-3 px-8 py-4 bg-white text-black text-[9px] lg:text-[14px] font-black uppercase tracking-[0.2em] rounded-full transition-all hover:bg-[#FF7A00] active:scale-95 shadow-xl"
          >
            Discover Events Now{" "}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[320px] md:max-w-[440px] aspect-[4/5] z-10">
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/[0.06] shadow-2xl bg-[#1C1F22]">
              <img
                src="/1763661369611.webp"
                className="w-full h-full object-cover brightness-100 transition-all duration-1000"
                alt="Concert"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121417] via-transparent to-transparent" />
            </div>
            <motion.div
              initial={{ scale: 0, x: 20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-[#121417] overflow-hidden shadow-2xl z-30"
            >
              <img
                src="/Login.jpg"
                className="w-full h-full object-cover"
                alt="Artist 1"
              />
            </motion.div>
            <motion.div
              initial={{ scale: 0, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute top-1/2 -left-6 md:-left-8 w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-[#121417] overflow-hidden shadow-2xl z-30 hidden sm:block"
            >
              <img
                src="/1308183.jpeg"
                className="w-full h-full object-cover"
                alt="Artist 2"
              />
            </motion.div>
          </div>
          <div className="absolute -bottom-6 -left-2 sm:left-6 bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex items-center gap-4 md:gap-5 -rotate-2 hover:rotate-0 transition-all z-20">
            <div className="bg-[#FF7A00] p-3 md:p-3.5 rounded-xl text-white">
              <ClockFading size={18} />
            </div>
            <div>
              <p className="font-black text-lg md:text-xl uppercase italic text-black leading-none">
                24 Hours
              </p>
              <p className="text-gray-400 font-bold text-[7px] md:text-[8px] uppercase tracking-[0.2em] mt-1">
                ACCESS SYSTEM
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================= 2. SEARCH ENGINE (Sticky) ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionFade}
        className="sticky top-4 z-40 px-6 lg:px-10 -mt-8 max-w-[1380px]  mx-auto transition-all duration-300"
      >
        <div className="bg-[#1C1F22]/95 backdrop-blur-md border border-white/[0.08]  p-2 rounded-[2rem] md:rounded-[2.2rem] shadow-2xl flex flex-col lg:flex-row gap-2 md:gap-3">
          <div className="flex-[0.9] flex items-center gap-4 px-5 py-3 md:py-4 bg-white/[0.02] border border-transparent hover:border-white/10 rounded-[1.5rem] md:rounded-[1.8rem] transition-all">
            <User className="text-gray-600" size={16} />
            <div className="flex-1">
              <label className="block text-[7px]  lg:text-[12px] text-gray-600 font-black uppercase tracking-[0.2em] mb-0.5">
                Artist
              </label>
              <input
                type="text"
                placeholder="Search talent..."
                className="bg-transparent border-none outline-none text-white font-bold w-full p-0 text-[11px] placeholder:text-gray-700"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-[0.9] flex items-center gap-4 px-5 py-3 md:py-4 bg-white/[0.02] border border-transparent hover:border-white/10 rounded-[1.5rem] md:rounded-[1.8rem] transition-all">
            <MapIcon className="text-gray-600" size={16} />
            <div className="flex-1">
              <label className="block text-[7px] lg:text-[12px]  text-gray-600 font-black uppercase tracking-[0.2em] mb-0.5">
                Category / Venue
              </label>
              <input
                type="text"
                placeholder="Nearby venues..."
                className="bg-transparent border-none outline-none text-white font-bold w-full p-0 text-[11px] placeholder:text-gray-700"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-[0.9] relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDateSlide(!dateSlide);
              }}
              className="w-full h-full flex items-center gap-4 px-5 py-3 md:py-4 bg-white/[0.02] border border-transparent hover:border-white/10 rounded-[1.5rem] md:rounded-[1.8rem] transition-all"
            >
              <CalendarIcon className="text-gray-600" size={16} />
              <div className="text-left">
                <span className="block text-[7px] lg:text-[12px] text-gray-600 font-black uppercase tracking-[0.2em] mb-0.5">
                  Schedule
                </span>
                <span className="font-bold text-[11px] lg:text-[12px] block truncate text-white">
                  {date instanceof Date
                    ? date.toLocaleDateString()
                    : "All Dates"}
                </span>
              </div>
            </button>
            <AnimatePresence>
              {dateSlide && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-[115%] left-0 bg-[#1C1F22] border border-white/[0.1] p-3 rounded-2xl shadow-2xl z-50 origin-top-left"
                >
                  <CalendarDemo
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => navigate("/event")}
            className="h-[56px] md:h-[64px] lg:w-[70px] bg-[#FF7A00] rounded-[1.5rem] md:rounded-[1.8rem] flex items-center justify-center hover:bg-white group transition-all shrink-0 active:scale-95 shadow-lg shadow-[#FF7A00]/10"
          >
            <Search
              className="text-black group-hover:scale-110 transition-transform"
              size={20}
              strokeWidth={3}
            />
          </button>
        </div>
      </motion.section>

      {/* ================= 3. FEATURED GIGS (Scroll Stagger) ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="px-6 lg:px-10 py-16 md:py-24 max-w-[1380px] mx-auto z-10 relative"
      >
        <div className="flex justify-between items-end mb-8 md:mb-12 px-2">
          <motion.div variants={itemVariants} className="space-y-2">
            <h2 className="text-2xl md:text-5xl font-black uppercase  tracking-tighter leading-none">
              FEATURED <span className="text-[#FF7A00]">Events</span>
            </h2>
            <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
          </motion.div>
          <Link
            to="/event"
            className="text-gray-600 font-black uppercase text-[8px]  lg:text-[12px] md:text-[9px] tracking-[0.3em] hover:text-white transition-all flex items-center gap-2"
          >
            View All <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <FeaturedEventSkeleton key={i} />
              ))
            : events?.events?.map((e) => (
                <motion.div
                  variants={itemVariants}
                  className="group"
                  key={e._id}
                >
                  <div className="relative rounded-[1.5rem] md:rounded-[2.2rem] overflow-hidden">
                    {/* Sold Out Overlay */}
                    {e?.tickets?.length === 0 && (
                      <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] rounded-[1.5rem] md:rounded-[2.2rem]  flex items-center justify-center pointer-events-none">
                        <div className="bg-red-600/90 text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-2xl border border-white/20">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          Sold Out
                        </div>
                      </div>
                    )}

                    <Link
                      to={
                        e?.tickets?.length > 0
                          ? `/events/${e?._id}/tickets/${e.tickets[0]?._id}`
                          : "#"
                      }
                      className={`block ${
                        e?.tickets?.length === 0 ? "cursor-not-allowed" : ""
                      }`}
                      onClick={(ev) =>
                        e?.tickets?.length === 0 && ev.preventDefault()
                      }
                    >
                      {/* Image Container */}
                      <div
                        className={`relative aspect-[4/4] md:aspect-[3/4] rounded-[1.5rem] md:rounded-[2.2rem] overflow-hidden border border-white/[0.04] bg-[#1C1F22] transition-all duration-500 ${
                          e?.tickets?.length === 0 ? "brightness-75" : ""
                        }`}
                      >
                        <img
                          src={e?.pictures[0]}
                          className="w-full h-full object-cover brightness-95 transition-transform duration-700"
                          alt={e?.name}
                        />
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>

                    {/* Wishlist Button */}
                    <button
                      onClick={(ev) => handleWishlistToggle(e._id, ev)}
                      disabled={wishlistMutation.isLoading}
                      className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all active:scale-90 ${
                        checkWishlist(e._id)
                          ? "bg-[#FF7A00] border-[#FF7A00] text-black shadow-lg shadow-[#FF7A00]/20"
                          : "bg-black/20 border-white/10 text-white hover:bg-black/40"
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={checkWishlist(e._id) ? "currentColor" : "none"}
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>

                  {/* Metadata Section */}
                  <div className="mt-5 px-1 space-y-4">
                    {/* Row 1: Location & Rating (Desktop Scaled) */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-[#FF7A00]">
                        <MapPin
                          size={12}
                          className="md:w-3.5 md:h-3.5"
                          strokeWidth={3}
                        />
                        <span className="text-[10px] md:text-[11px] font-black uppercase italic tracking-widest">
                          {e.location || "London, UK"}
                        </span>
                      </div>

                      {/* Scaled Rating Badge for Desktop */}
                      <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-white/[0.08] shadow-sm">
                        <Star
                          size={12}
                          className="fill-[#FF7A00] text-[#FF7A00] md:w-4 md:h-4"
                        />
                        <span className="text-white text-[10px] md:text-[13px] font-black italic tracking-tighter">
                          {e?.rating?.score || "4.9"}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Event Name */}
                    <Link
                      to={
                        e?.tickets?.length > 0
                          ? `/events/${e?._id}/tickets/${e.tickets[0]?._id}`
                          : `/events/${e?._id}`
                      }
                    >
                      <h3 className="text-white font-black uppercase  text-lg  lg:text-[18px] md:text-2xl leading-[0.9] tracking-tighter hover:text-[#FF7A00] transition-colors">
                        {e.name}
                      </h3>
                    </Link>

                    {/* Row 3: Pricing & Action */}
                    <div className="flex justify-between items-end pt-1">
                      <div className="flex flex-col">
                        <span className="text-gray-600 text-[9px] lg:text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                          Entry From
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-white font-black text-xl  lg:text-[24px] md:text-3xl tracking-tighter">
                            ${e?.priceRanges?.[0]?.min || e?.price || "0"}
                          </span>
                          <span className="text-gray-500 text-[10px] md:text-[12px] font-bold lowercase italic">
                            /pp
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/events/${e._id}`}
                        className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#1C1F22] border border-white/[0.08] flex items-center justify-center text-white group-hover:bg-[#FF7A00] group-hover:text-black transition-all shadow-xl group-hover:shadow-[#FF7A00]/30"
                      >
                        <Ticket
                          size={20}
                          className="md:w-6 md:h-6"
                          strokeWidth={2.5}
                        />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>
      </motion.section>

      {/* ================= 4. RELIABILITY CARDS ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionFade}
        className="px-6 lg:px-10 pb-20 max-w-[1380px] mx-auto z-10 relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[
            {
              icon: <Activity size={24} />,
              title: "Support",
              desc: "Real humans. At every venue.",
              color: "text-[#FF7A00]",
              bg: "bg-[#FF7A00]/5",
            },
            {
              icon: <ShieldCheck size={24} />,
              title: "Verified",
              desc: "100% Secure ticket exchange.",
              color: "text-[#5EC750]",
              bg: "bg-[#5EC750]/5",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="group flex items-center gap-5 p-6 md:p-8 bg-white/[0.02] border border-white/[0.04] rounded-[1.5rem] md:rounded-[2.5rem]"
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}
              >
                {card.icon}
              </div>
              <div>
                <h3 className="text-sm md:text-lg font-black uppercase italic tracking-tighter text-white">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-[10px] md:text-[11px] font-medium leading-tight">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* LIVE EXPERIENCE (Photos & Video) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
        className="px-6 lg:px-10 pb-32 max-w-[1200px] mx-auto z-10 relative"
      >
        <div className="flex flex-col items-center text-center space-y-16">
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-4xl md:text-6xl  uppercase  tracking-tighter leading-none">
              EXP THE <span className="text-[#FF7A00]">PULSE</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-medium tracking-tight max-w-2xl mx-auto">
              From the main stage to your pocket. Witness the real energy
              captured by our global community at every sold-out venue.
            </p>
          </motion.div>

          {/* Screenshots Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left: Main Hero Screenshot */}
            <motion.div
              variants={itemVariants}
              className="rounded-[2.5rem] overflow-hidden border border-white/10 relative bg-black shadow-2xl h-fit"
            >
              <img
                src="/Screenshot From 2026-04-24 04-49-36.png"
                className="w-full h-auto object-contain"
                alt="Hero View"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">
                  System Milestone — 01
                </span>
                <p className="text-white font-bold text-lg">
                  Cinema Mode Interface
                </p>
              </div>
            </motion.div>

            {/* Right: Sub-Screenshots */}
            <div className="flex flex-col gap-12">
              <motion.div
                variants={itemVariants}
                className="rounded-[2rem] overflow-hidden border border-white/10 relative bg-black shadow-xl h-fit"
              >
                <img
                  src="/Screenshot From 2026-04-24 04-50-09.png"
                  className="w-full h-auto object-contain"
                  alt="Wishlist"
                />
                <div className="absolute bottom-4 left-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Wishlist Management
                  </span>
                </div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="rounded-[2rem] overflow-hidden border border-white/10 relative bg-black shadow-xl h-fit"
              >
                <img
                  src="/Login.jpg"
                  className="w-full h-auto object-contain"
                  alt="Account"
                />
                <div className="absolute bottom-4 left-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    User Profile System
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Video Walkthrough (Centered) */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-4xl space-y-10 pt-10"
          >
            <div className="space-y-4">
              <span className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-600">
                Dynamic Synchronization
              </span>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic">
                Authentication Walkthrough
              </h3>
            </div>

            <div className="relative w-full h-full rounded-[1.5rem] md:rounded-[2.2rem] overflow-hidden">
              <video
                src="/Screencast From 2026-04-24 05-03-04.mp4"
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />

              {/* Play Button Interface */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-[#FF7A00] flex items-center justify-center text-black shadow-2xl">
                  <Activity size={24} md:size={32} strokeWidth={3} />
                </div>
              </div>

              {/* Progress Bar (Mock) */}
              <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 h-1 md:h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="h-full bg-gradient-to-r from-[#FF7A00] to-orange-400 shadow-[0_0_15px_rgba(255,122,0,0.5)]"
                />
              </div>
            </div>

            <div className="mt-6 md:mt-10 px-2 md:px-6 flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="flex -space-x-2 md:-space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 md:border-4 border-[#121417] bg-gray-800 overflow-hidden"
                    >
                      <img
                        src={`/1308183.jpeg`}
                        className="w-full h-full object-cover"
                        alt="User"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-white text-[10px] md:text-xs font-black uppercase tracking-tight">
                    Sync Active
                  </p>
                  <p className="text-gray-500 text-[8px] md:text-[10px] font-bold md:block hidden">
                    +2.4k community views
                  </p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl">
                <span className="text-[#FF7A00] text-[8px] md:text-[10px] font-black uppercase tracking-widest italic animate-pulse">
                  ● System Live
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default UserHome;
