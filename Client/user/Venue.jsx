import React from "react";
import { eventService } from "@/Context/ApiEvent.jsx";
import { Link, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  SearchX,
  Filter,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

import { useService } from "@/Context/ServiceContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
const Venue = () => {
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
  } = useService();
  const { events, isLoading } = eventService();
  const navigate = useNavigate();

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

  // to store non duplicate venues

  const featuredVenues = [
    ...new Map(
      events?.events
        .filter(
          (e) => e?.links?.venues && Object.keys(e?.links?.venues).length > 0,
        )
        .map((e) => [e?.links?.venues?.name, e]),
    ),
  ];

  const handleVenueClick = (venueName) => {
    setSearch(venueName);
    setVenues(venueName);
    navigate("/event");
  };

  const venuesCards = [
    {
      id: 1,
      name: "Addis Ababa Stadium",
      city: "Addis Ababa",
      image:
        "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1200&q=80",
    },
    {
      id: 2,
      name: "Millennium Hall",
      city: "Addis Ababa",
      image:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
    },
    {
      id: 3,
      name: "Friendship Park",
      city: "Addis Ababa",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
    },
    {
      id: 4,
      name: "National Theatre",
      city: "Addis Ababa",
      image:
        "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
    },
    {
      id: 5,
      name: "Convention Center",
      city: "Addis Ababa",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
    },
    {
      id: 6,
      name: "Adama Stadium",
      city: "Adama",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#121417] text-white overflow-hidden pb-32">
      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#FF7A00]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-white/[0.02] blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-24 lg:pt-32">
        {/* ── HEADER SECTION ── */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
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
              className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.85]"
            >
              Look For <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">
                Venues
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 text-sm md:text-base font-medium max-w-lg leading-relaxed"
            >
              Browse all the venues in one cinematic vault. Filters act as your
              pass to the front row.
            </motion.p>
          </div>

          <div
            className="
    relative w-full flex justify-center py-10 overflow-hidden

    /* desktop fan settings */
    sm:[--spread:110px] lg:[--spread:140px]
    sm:[--rot:4deg] lg:[--rot:6deg]
  "
          >
            {/* MOBILE: vertical full cards */}

            <div className="relative w-[280px] h-[280px] sm:hidden flex items-center justify-center">
              {venuesCards.map((venue, index) => {
                const angle = (index / venuesCards.length) * 2 * Math.PI;
                const radius = 110;

                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <div
                    key={venue.id}
                    className="
            absolute w-[90px] h-[90px]
            rounded-full overflow-hidden shadow-xl
            border border-white/10
            transition-transform duration-300 hover:scale-110
          "
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>

            {/* DESKTOP / TABLET: fanned cards */}
            <div className="relative w-full h-[260px] items-center justify-center hidden sm:flex">
              {venuesCards.map((venue, index) => {
                const center = Math.floor(venuesCards.length / 2);
                const offset = index - center;

                return (
                  <div
                    key={venue.id}
                    className="
            absolute rounded-2xl overflow-hidden shadow-xl cursor-pointer
            transition-all duration-500 hover:scale-110 hover:z-50

            sm:w-[190px] sm:h-[210px]
            lg:w-[240px] lg:h-[240px]
          "
                    style={{
                      transform: `
              translateX(calc(${offset} * var(--spread)))
              rotate(calc(${offset} * var(--rot)))
            `,
                      zIndex: venuesCards.length - Math.abs(offset),
                    }}
                  >
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute bottom-2 left-2 text-white">
                      <h3 className="text-xs sm:text-sm font-bold">
                        {venue.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-300">
                        {venue.city}
                      </p>
                    </div>
                  </div>
                );
              })}
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
              value={venues}
              onChange={(e) => setVenues(e.target.value)}
              placeholder="Search by venue name"
              className="w-full h-16 bg-white/[0.02] border border-white/[0.08] rounded-2xl pl-16 pr-6 text-sm font-bold placeholder:text-gray-700 outline-none focus:border-[#FF7A00]/40 transition-all focus:bg-white/[0.04]"
            />
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
          ) : featuredVenues.length > 0 ? (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-10"
            >
              {featuredVenues?.map(([venueItems, data]) => {
                return (
                  <motion.div variants={itemVariants} className="group">
                    <div className="relative mb-5">
                      <button
                        type="button"
                        onClick={() => handleVenueClick(venueItems)}
                        className="block relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/[0.06] bg-[#1C1F22] transition-all duration-700 w-full text-left"
                      >
                        <img
                          src={
                            data?.links?.venues?.pictures?.[0] ||
                            data?.pictures?.[0] ||
                            "/Login.jpg"
                          }
                          alt={data?.links?.venues?.name || venueItems}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                        {/* Location Badge */}
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-2 group-hover:bg-[#FF7A00] transition-colors duration-500">
                          <MapPin
                            size={10}
                            className="text-[#FF7A00] group-hover:text-black"
                          />
                          <span
                            className="text-[8px] font-black uppercase tracking-wider
                               text-white group-hover:text-black"
                          >
                            {data?.links?.venues?.address || "Main Venue"}
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="space-y-3 px-2">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleVenueClick(venueItems)}
                          className="text-left w-full"
                        >
                          <h3 className="text-xl font-black uppercase italic tracking-tighter text-white hover:text-[#FF7A00] transition-colors line-clamp-1">
                            {data?.links?.venues?.name}
                          </h3>
                        </button>
                        <div className="flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.08]">
                          <Star size={10} fill="#FF7A00" stroke="#FF7A00" />
                          <span className="text-white text-[10px] font-black">
                            {data.rating?.score || "4.9"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between border-t border-white/[0.04] pt-4">
                        <button
                          type="button"
                          onClick={() => handleVenueClick(venueItems)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF7A00] hover:text-white transition-colors group/btn"
                        >
                          Details{" "}
                          <ArrowRight
                            size={14}
                            className="group-hover/btn:translate-x-1 transition-transform"
                          />
                        </button>
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

              <p className="text-gray-500 max-w-sm font-medium mb-10">
                We couldn't find any Venues at this moment
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Venue;
