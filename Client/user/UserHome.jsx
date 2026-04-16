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
} from "lucide-react";
import { CalendarDemo } from "@/components/ui/calendar";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { eventService } from "@/Context/ApiEvent";
import { useService } from "@/Context/ServiceContext";

const UserHome = () => {
  const [dateSlide, setDateSlide] = useState(false);
  const { events, isLoading } = eventService();
  const { type, setType, date, setDate, artist, setArtist, addFav, setAddFav } =
    useService();
  const navigate = useNavigate();

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
                className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000"
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
              <Mic2 size={18} />
            </div>
            <div>
              <p className="font-black text-lg md:text-xl uppercase italic text-black leading-none">
                Live Now
              </p>
              <p className="text-gray-400 font-bold text-[7px] md:text-[8px] uppercase tracking-[0.2em] mt-1">
                Tour 2026
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
                Location
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
              <div className="text-left space-y-6">
                <span className="block text-[7px] lg:text-[12px] text-gray-600 font-black uppercase tracking-[0.2em] mb-0.5">
                  Schedule
                </span>
                <span className="font-bold text-[11px] lg:text-[12px] block truncate text-white">
                  {date ? date.toLocaleDateString() : "All Dates"}
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
          <button className="h-[56px] md:h-[64px] lg:w-[70px] bg-[#FF7A00] rounded-[1.5rem] md:rounded-[1.8rem] flex items-center justify-center hover:bg-white group transition-all shrink-0 active:scale-95 shadow-lg shadow-[#FF7A00]/10">
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
          {events?.map((e) => (
            <motion.div variants={itemVariants} className="group">
              <div className="relative">
                <Link to={`/events/${e._id}`} className="block">
                  {/* Image Container */}
                  <div className="relative aspect-[4/4] md:aspect-[3/4] rounded-[1.5rem] md:rounded-[2.2rem] overflow-hidden border border-white/[0.04] bg-[#1C1F22]">
                    <img
                      src={e.img}
                      className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-700"
                      alt={e.name}
                    />
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                {/* Wishlist Button */}
                <button
                  onClick={(ev) => {
                    ev.preventDefault();
                    setAddFav(!addFav);
                  }}
                  className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all active:scale-90 ${
                    addFav
                      ? "bg-[#FF7A00] border-[#FF7A00] text-black shadow-lg shadow-[#FF7A00]/20"
                      : "bg-black/20 border-white/10 text-white hover:bg-black/40"
                  }`}
                >
                  <Heart
                    size={18}
                    fill={addFav ? "currentColor" : "none"}
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
                      {e.rating || "4.9"}
                    </span>
                  </div>
                </div>

                {/* Row 2: Event Name */}
                <Link to={`/events/${e._id}`}>
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
                        ${e.price}
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
    </div>
  );
};

export default UserHome;
