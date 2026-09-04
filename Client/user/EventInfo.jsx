import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Heart,
  Share2,
  MapPin,
  ClockFading,
  Ticket,
  MoveRight,
  ShieldCheck,
  Star,
  Calendar,
  Send,
  X,
  Fingerprint,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { isEventPassed8Hours } from "@/lib/utils";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";
import toast from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import { eventService } from "@/Context/ApiEvent";
import CheckoutModal from "@/components/Reusable";
import { Navigate, useLocation } from "react-router-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

/* ─── tiny helpers */
const Orb = ({ className }) => (
  <div
    className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`}
  />
);

const GlitchChar = ({ char, delay }) => (
  <motion.span
    initial={{ opacity: 0, y: 40, rotateX: -90 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    style={{ display: "inline-block", transformOrigin: "bottom" }}
  >
    {char}
  </motion.span>
);

const StatBadge = ({ icon: Icon, label, value }) => (
  <motion.div
    whileHover={{ scale: 1.04, borderColor: "rgba(255,122,0,0.5)" }}
    className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-md cursor-default transition-colors"
  >
    <Icon size={15} className="text-[#FF7A00] shrink-0" />
    <div>
      <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.35em] leading-none mb-0.5">
        {label}
      </p>
      <p className="text-[11px] font-bold uppercase text-white tracking-wide">
        {value}
      </p>
    </div>
  </motion.div>
);

const StarRating = ({ rating, onRate, size = 20 }) => {
  const [hoverVal, setHoverVal] = useState(0);
  const display = hoverVal || rating;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHoverVal(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => setHoverVal(star)}
            className="p-0.5 transition-transform hover:scale-110 active:scale-95"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              strokeWidth={1.75}
              className="transition-colors duration-150"
              fill={filled ? "#FF7A00" : "transparent"}
              stroke={filled ? "#FF7A00" : "#4b4b52"}
            />
          </button>
        );
      })}
    </div>
  );
};

/* ─── Full skeleton screen matching the actual page layout */
const SkeletonLoadingScreen = () => (
  <div className="min-h-screen bg-[#121417] text-[#F4F4F5] antialiased overflow-x-hidden">
    <SkeletonTheme baseColor="#1e2023" highlightColor="#2a2d31">
      {/* Top ribbon */}
      <div className="h-[2px] w-full bg-white/[0.03]" />

      {/* Hero skeleton */}
      <div className="relative w-full h-[75vh] min-h-[520px] overflow-hidden">
        <Skeleton height="100%" style={{ display: "block" }} />
        {/* Simulated title + badges overlay */}
        <div className="absolute bottom-14 left-6 lg:left-14 space-y-5">
          {/* ID badge */}
          <Skeleton width={160} height={12} />
          {/* Title lines */}
          <Skeleton width="55vw" height={52} style={{ maxWidth: 560 }} />
          <Skeleton width="35vw" height={52} style={{ maxWidth: 360 }} />
          {/* Stat badges row */}
          <div className="flex gap-3 mt-2">
            <Skeleton width={150} height={46} borderRadius={16} />
            <Skeleton width={150} height={46} borderRadius={16} />
            <Skeleton width={120} height={46} borderRadius={16} />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="max-w-7xl mx-auto px-6 lg:px-14 pt-16 pb-28">
        <div className="grid lg:grid-cols-12 gap-14">
          {/* Left column */}
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-16">
            {/* Gallery skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton width={20} height={2} />
                <Skeleton width={60} height={10} />
              </div>
              <Skeleton
                height={340}
                borderRadius={24}
                style={{ display: "block" }}
              />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} width={80} height={56} borderRadius={12} />
                ))}
              </div>
            </div>

            {/* Description skeleton */}
            <div className="pl-8 space-y-3">
              <Skeleton width={120} height={10} />
              <Skeleton height={22} />
              <Skeleton height={22} width="90%" />
              <Skeleton height={22} width="80%" />
            </div>

            {/* Comments skeleton */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton height={1} style={{ flex: 1 }} />
                <Skeleton width={100} height={10} />
                <Skeleton height={1} style={{ flex: 1 }} />
              </div>
              {/* Write review box */}
              <Skeleton
                height={100}
                borderRadius={16}
                style={{ display: "block" }}
              />
              {/* Comment cards */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 sm:p-5"
                >
                  <div className="flex items-start gap-4">
                    <Skeleton circle width={48} height={48} />
                    <div className="flex-1 space-y-2">
                      <Skeleton width={110} height={14} />
                      <Skeleton width={70} height={10} />
                      <Skeleton height={12} />
                      <Skeleton height={12} width="75%" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — ticket card skeleton */}
          <aside className="order-1 lg:order-2 lg:col-span-5">
            <div className="space-y-5">
              {/* Ticket stub skeleton */}
              <Skeleton
                height={480}
                borderRadius={24}
                style={{ display: "block" }}
              />
              {/* Dropdown button skeleton */}
              <Skeleton
                height={54}
                borderRadius={16}
                style={{ display: "block" }}
              />
              {/* Live badge skeleton */}
              <Skeleton
                height={44}
                borderRadius={16}
                style={{ display: "block" }}
              />
            </div>
          </aside>
        </div>

        {/* Policies skeleton */}
        <div className="mt-24 pt-16 border-t border-white/[0.05] space-y-8">
          <div className="flex items-center gap-3">
            <Skeleton width={18} height={18} circle />
            <Skeleton width={180} height={18} />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] space-y-3"
              >
                <Skeleton width={100} height={12} />
                <Skeleton height={11} />
                <Skeleton height={11} width="85%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  </div>
);

const EventInfo = () => {
  const { eventId, ticketId } = useParams();
  const { setEditMenuActive, setCheckoutOpen, API_URL, checkoutOpen } =
    useService();
  const {
    fetchEventById,
    usererror,
    userIsLoading,
    user,
    comments,
    commentsIsLoading,
    useComment,
    addLikeComment,
    wishlist,
  } = eventService();
  const { mutate: likecommentmutation } = addLikeComment();
  const location = useLocation();
  const navigate = useNavigate();

  const [showMap, setShowMap] = useState(false);
  const [showTicketDropdown, setShowTicketDropdown] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [displayedCommentsCount, setDisplayedCommentsCount] = useState(4);
  const galleryRef = useRef(null);

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.08]);
  const { mutate: postComment, isPending } = useComment();

  const { data: event_id, isLoading } = useQuery({
    queryKey: ["event", eventId, ticketId],
    queryFn: () => fetchEventById(eventId, ticketId),
  });

  const event = event_id?.event || null;
  const ticket = event_id?.ticket || null;
  const images = event?.pictures || [];
  const allTickets = (event_id?.tickets || []).filter((t) => t.isActive !== false);

  const { mutation: wishlistMutation } = useWishlistMutation();

  const checkWishlist = (id) => {
    return (
      wishlist?.wishlist?.items?.some(
        (item) => item?.eventId?._id === id,
      ) || false
    );
  };

  const handleWishlistToggle = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (!user) {
      toast.error("Please sign in to save events");
      navigate("/login", { state: { from: location } });
      return;
    }

    const isCurrentlyAdded = checkWishlist(eventId);
    const activeTicketId = ticketId || allTickets[0]?._id;

    wishlistMutation.mutate({
      eventId: eventId,
      ticketId: activeTicketId,
      isAdding: !isCurrentlyAdded,
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [eventId]);

  const handlePostComment = () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!commentText.trim()) return;
    postComment(
      { text: commentText, rating: rating, eventId: eventId },
      {
        onSuccess: () => {
          toast.success("Comment posted successfully!");
          setCommentText("");
          setRating(0);
        },
        onError: (error) => {
          toast.error(getFriendlyErrorMessage(error));
        },
      },
    );
  };


  /* ── ticket-type colour theme ── */
  const ticketThemes = {
    standard: {
      bandGradient:
        "linear-gradient(120deg, #FF7A00 0%, #FF9D00 60%, #FFC347 100%)",
      ctaGradient:
        "linear-gradient(135deg, #FF7A00 0%, #FF9D00 50%, #FF7A00 100%)",
      accentColor: "#FF7A00",
      label: "Standard",
    },
    regular: {
      bandGradient:
        "linear-gradient(120deg, #EAB308 0%, #FACC15 60%, #FDE047 100%)",
      ctaGradient:
        "linear-gradient(135deg, #EAB308 0%, #FACC15 50%, #EAB308 100%)",
      accentColor: "#FACC15",
      label: "Regular",
    },
    vip: {
      bandGradient:
        "linear-gradient(120deg, #3B82F6 0%, #60A5FA 60%, #93C5FD 100%)",
      ctaGradient:
        "linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #3B82F6 100%)",
      accentColor: "#60A5FA",
      label: "VIP",
    },
    vvip: {
      bandGradient:
        "linear-gradient(120deg, #6B7280 0%, #9CA3AF 60%, #D1D5DB 100%)",
      ctaGradient:
        "linear-gradient(135deg, #6B7280 0%, #9CA3AF 50%, #6B7280 100%)",
      accentColor: "#9CA3AF",
      label: "VVIP",
    },
    soldout: {
      bandGradient:
        "linear-gradient(120deg, #DC2626 0%, #B91C1C 60%, #991B1B 100%)",
      ctaGradient: "linear-gradient(135deg, #444 0%, #333 50%, #222 100%)",
      accentColor: "#EF4444",
      label: "SOLD OUT",
    },
  };

  const isSoldOut = allTickets.length === 0 || isEventPassed8Hours(event);
  const activeTicket = ticket
    ? {
        ...ticket,
        price: ticket.price ?? 0,
        type: ticket.name?.toLowerCase() ?? "standard",
      }
    : null;

  const ticketType = isSoldOut
    ? "soldout"
    : (activeTicket?.type || "standard").toLowerCase().trim();

  const theme = ticketThemes[ticketType] ?? ticketThemes.standard;

  const prevImg = () => setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImg = () => setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  if (isLoading) return <SkeletonLoadingScreen />;

  const titleChars = (event?.name || "").split("");

  return (
    <div className="min-h-screen bg-[#121417] text-[#F4F4F5] antialiased overflow-x-hidden">
      {/* ── AMBIENT ORBS ── */}
      <Orb className="w-[600px] h-[600px] top-[-200px] left-[-200px] bg-[#FF7A00]/[0.07]" />
      <Orb className="w-[500px] h-[500px] top-[30%] right-[-150px] bg-purple-600/[0.05]" />
      <Orb className="w-[400px] h-[400px] bottom-[10%] left-[20%] bg-[#FF7A00]/[0.04]" />

      {/* ── TOP COLOR RIBBON ── */}
      <div className="h-[2px] w-full flex">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
          className="h-full w-[35%] bg-gradient-to-r from-[#FF7A00] to-amber-300"
        />
        <div className="h-full flex-1 bg-white/[0.03]" />
      </div>

      {/* ── CINEMATIC HERO ── */}
      <div className="relative w-full h-[75vh] min-h-[520px] overflow-hidden">
        <motion.div
          ref={heroRef}
          style={{ scale: heroScale }}
          className="absolute inset-0"
        >
          {images[0] ? (
            <img
              src={
                images[0].startsWith("http")
                  ? images[0]
                  : `${API_URL}/${images[0]}`
              }
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/Login.jpg";
              }}
              alt={event?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/Login.jpg"
              alt={event?.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080809]/80 via-transparent to-transparent" />
        </motion.div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 flex flex-col justify-end px-6 lg:px-14 pb-14"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-2 mb-5"
          >
            <Fingerprint size={13} className="text-[#FF7A00]" />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.45em]">
              ID — {eventId?.slice(-14)?.toUpperCase()}
            </span>
          </motion.div>

          {/* 
            FIXED: Responsive title sizing
            - Mobile:  text-3xl  (30px) — was text-5xl, too large and overflowed
            - sm:      text-4xl  (36px)
            - md:      text-5xl  (48px)
            - lg+:     text-6xl  (60px) — was text-7xl, pulled back one step
          */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none max-w-5xl mb-8 perspective-1000">
            {titleChars.map((char, i) => (
              <GlitchChar
                key={i}
                char={char === " " ? "\u00A0" : char}
                delay={0.4 + i * 0.03}
              />
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.8,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-wrap gap-3"
          >
            <StatBadge
              icon={MapPin}
              label="Venue Locale"
              value={event?.links?.venues?.name || "TBA"}
            />
            <StatBadge
              icon={Calendar}
              label="Schedule"
              value={moment(event?.dates?.start?.localDate).format(
                "MMM DD, YYYY",
              )}
            />
            <motion.button
              whileHover={{ scale: 1.04, borderColor: "rgba(255,122,0,0.5)" }}
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/[0.07] bg-[#FF7A00]/10 backdrop-blur-md cursor-pointer transition-colors"
            >
              <MapPin size={15} className="text-[#FF7A00] shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF7A00]">
                {showMap ? "Close Map" : "View Map"}
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        <div className="absolute right-10 top-0 bottom-0 w-[1px] bg-white/[0.04] hidden lg:block">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 1, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top" }}
            className="w-full h-full bg-gradient-to-b from-[#FF7A00] to-transparent"
          />
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistMutation.isLoading}
          className={`absolute top-8 right-6 lg:right-14 z-20 w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center transition-all active:scale-90 ${
            checkWishlist(eventId)
              ? "bg-[#FF7A00] border-[#FF7A00] text-black shadow-lg shadow-[#FF7A00]/20"
              : "bg-black/40 border-white/10 text-white hover:bg-black/60"
          }`}
        >
          <Heart
            size={20}
            fill={checkWishlist(eventId) ? "currentColor" : "none"}
            strokeWidth={2.5}
          />
        </button>
      </div>

      {/* ── MAP PANEL ── */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "420px", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full overflow-hidden border-y border-white/[0.05]"
          >
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${event?.links?.venues?.name}&output=embed`}
            />
            <div className="absolute inset-0 pointer-events-none border-b border-[#FF7A00]/20" />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMap(false)}
              className="absolute top-5 right-5 p-3 bg-black/80 backdrop-blur-lg rounded-full border border-white/10 pointer-events-auto"
            >
              <X size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-14 pt-16 pb-28 relative">
        <div className="grid lg:grid-cols-12 gap-14 xl:gap-20">
          {/* ── LEFT COLUMN ── */}
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-20">
            {/* IMAGE CAROUSEL */}
            {images.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative group">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-5 h-[2px] bg-[#FF7A00]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.45em] text-gray-500">
                      Photos
                    </span>
                  </div>

                  <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/[0.06]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={imgIdx}
                        src={
                          images[imgIdx].startsWith("http")
                            ? images[imgIdx]
                            : `${API_URL}/${images[imgIdx]}`
                        }
                        alt={`Event ${imgIdx + 1}`}
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080809]/80 to-transparent" />
                    <div className="absolute bottom-4 left-5 flex items-center gap-2">
                      <Zap size={10} className="text-[#FF7A00]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        {imgIdx + 1} / {images.length}
                      </span>
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImg}
                          className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-start pl-4 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20 z-10"
                        >
                          <ChevronLeft size={24} className="text-white" />
                        </button>
                        <button
                          onClick={nextImg}
                          className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20 z-10"
                        >
                          <ChevronRight size={24} className="text-white" />
                        </button>
                      </>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div
                      ref={galleryRef}
                      className="flex gap-3 mt-4 overflow-x-auto scroll-hidden"
                    >
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                            i === imgIdx
                              ? "border-[#FF7A00] opacity-100"
                              : "border-white/5 opacity-40 hover:opacity-70"
                          }`}
                        >
                          <img
                            src={
                              img.startsWith("http")
                                ? img
                                : `${API_URL}/${img}`
                            }
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/Login.jpg";
                            }}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* DESCRIPTION */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#FF7A00] via-[#FF7A00]/30 to-transparent" />
              <div className="pl-8">
                <span className="text-[9px] font-black uppercase tracking-[0.45em] text-[#FF7A00] mb-4 block">
                  About This Event
                </span>
                <p className="text-xl md:text-2xl text-gray-400 italic font-serif leading-relaxed">
                  "{event?.desc || "No description available for this event."}"
                </p>
              </div>
            </motion.section>

            {/* COMMENTS */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#FF7A00]/30 to-transparent" />
                <span className="text-[9px] font-black uppercase tracking-[0.45em] text-gray-600">
                  Fan Reviews
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-[#FF7A00]/30 to-transparent" />
              </div>

              {/* WRITE A REVIEW */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#16181b] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-500">
                    Your Rating
                  </span>
                  <div className="flex items-center gap-2">
                    <StarRating rating={rating} onRate={setRating} />
                    {rating > 0 && (
                      <span className="text-[10px] font-bold text-gray-500 w-6 text-right">
                        {rating}/5
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 focus-within:border-[#FF7A00]/40 transition-colors">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                    placeholder="Leave a comment..."
                    className="flex-1 bg-transparent outline-none border-none text-[11px] font-bold uppercase tracking-wide placeholder:text-gray-700 text-white"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={isPending}
                    className="h-10 w-10 bg-[#FF7A00] rounded-xl flex items-center justify-center shrink-0 hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send size={15} className="text-black" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {commentsIsLoading ? (
                  <SkeletonTheme baseColor="#1e2023" highlightColor="#2a2d31">
                    <div className="space-y-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="group rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 sm:p-5"
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="flex-shrink-0">
                              <Skeleton circle width={48} height={48} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <Skeleton width={96} height={16} />
                              <Skeleton width={64} height={12} />
                              <Skeleton width="100%" height={12} />
                              <Skeleton width="66%" height={12} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SkeletonTheme>
                ) : (
                  <>
                    <motion.div className="space-y-6">
                      {comments?.comments
                        ?.slice(0, displayedCommentsCount)
                        .map((c, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            className="group rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 p-4 sm:p-5"
                          >
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="flex-shrink-0">
                                <img
                                  src={
                                    c?.userProfile?.avatarUrl?.startsWith("http")
                                      ? c.userProfile.avatarUrl
                                      : `${API_URL}/${c?.userProfile?.avatarUrl}`
                                  }
                                  alt={c?.userProfile?.fullName}
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-white/10"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                  <div>
                                    <h4 className="text-sm sm:text-base font-semibold text-white truncate">
                                      {c?.userProfile?.fullName}
                                    </h4>
                                    <p className="text-[10px] sm:text-xs text-gray-500">
                                      {moment(c.createdAt).fromNow()}
                                    </p>
                                  </div>
                                  {c?.rating > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star
                                            key={s}
                                            size={11}
                                            fill={
                                              s <= c.rating
                                                ? "#FF7A00"
                                                : "transparent"
                                            }
                                            stroke={
                                              s <= c.rating
                                                ? "#FF7A00"
                                                : "#4b4b52"
                                            }
                                          />
                                        ))}
                                      </div>
                                      <span className="text-[10px] font-bold text-gray-500">
                                        {c.rating}/5
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors break-words">
                                  {c?.text}
                                </p>
                                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                                  <button
                                    onClick={(e) => e.preventDefault()}
                                    className="hover:text-white transition-colors"
                                  >
                                    Like
                                  </button>
                                  <button className="hover:text-white transition-colors">
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </motion.div>

                    {/* Show More / Show Less */}
                    <div className="flex gap-3 justify-center mt-8 flex-wrap">
                      {comments?.comments?.length > displayedCommentsCount && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          onClick={() =>
                            setDisplayedCommentsCount((prev) =>
                              Math.min(prev + 4, comments.comments.length),
                            )
                          }
                          className="px-6 py-2 rounded-lg border border-[#FF7A00]/40 bg-white/[0.02] hover:bg-white/[0.04] text-[#FF7A00] font-semibold uppercase text-[10px] tracking-wider transition-all duration-300 hover:border-[#FF7A00]/80"
                        >
                          Show More
                        </motion.button>
                      )}
                      {displayedCommentsCount > 4 && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          onClick={() => setDisplayedCommentsCount(4)}
                          className="px-6 py-2 rounded-lg border border-gray-500/40 bg-white/[0.02] hover:bg-white/[0.04] text-gray-400 font-semibold uppercase text-[10px] tracking-wider transition-all duration-300 hover:border-gray-500/80"
                        >
                          Show Less
                        </motion.button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          </div>

          {/* ── RIGHT COLUMN — TICKET CARD ── */}
          <aside className="order-1 lg:order-2 lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-5">
              {/* PHYSICAL TICKET STUB */}
              <motion.div
                layout
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.6,
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl"
                style={{
                  background:
                    "linear-gradient(160deg, #141416 0%, #0e0e10 100%)",
                }}
              >
                {/* TICKET TOP BAND */}
                <motion.div
                  key={ticketType}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="relative px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 overflow-hidden"
                  style={{ background: theme?.bandGradient }}
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-black/10" />

                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.45em] text-black/60 mb-1">
                        Paysso · Official Ticket
                      </p>
                      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black leading-tight max-w-[160px] sm:max-w-[200px]">
                        {event?.name || "Event"}
                      </h2>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-black/15 flex items-center justify-center shrink-0">
                      <Ticket size={22} className="text-black/70" />
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-5 mt-5">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-black/50 mb-0.5">
                        Date
                      </p>
                      <p className="text-[11px] font-black text-black">
                        {moment(event?.dates?.start?.localDate).format(
                          "ddd, MMM DD YYYY",
                        )}
                      </p>
                    </div>
                    <div className="w-[1px] bg-black/15" />
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-black/50 mb-0.5">
                        Venue
                      </p>
                      <p className="text-[11px] font-black text-black truncate max-w-[100px] sm:max-w-[130px]">
                        {event?.links?.venues?.name}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* TEAR LINE */}
                <div className="relative flex items-center">
                  <div className="w-5 h-5 rounded-full -ml-2.5 bg-[#080809] shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-white/[0.07]" />
                  <div className="w-5 h-5 rounded-full -mr-2.5 bg-[#080809] shrink-0" />
                </div>

                {/* TICKET BODY */}
                <div className="px-5 sm:px-8 py-5 sm:py-7 space-y-6">
                  <div className="flex items-end justify-between">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={ticketType}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em] mb-1">
                          Ticket Type
                        </p>
                        <p className="text-lg font-black uppercase tracking-tight">
                          {activeTicket?.name || "Standard"}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={ticketType + (activeTicket?.price || "0")}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-right"
                      >
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em] mb-1">
                          Price
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl sm:text-4xl font-black tracking-tighter">
                            {activeTicket?.price}
                          </span>
                          <span
                            className="text-[10px] font-black uppercase"
                            style={{ color: theme?.accentColor }}
                          >
                            ETB
                          </span>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        label: "Location",
                        value: event?.links?.venues?.name || "TBA",
                      },
                      {
                        label: "Category",
                        value:
                          event?.classifications?.[0]?.genre?.name ||
                          event?.type ||
                          "Live Event",
                      },
                      {
                        label: "Doors Open",
                        value: event?.dates?.start?.localTime
                          ? moment(
                              event.dates.start.localTime,
                              "HH:mm:ss",
                            ).format("h:mm A")
                          : "Check venue",
                      },
                      {
                        label: "Available",
                        value: activeTicket?.availableQuantity ?? "—",
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-2 border-b border-white/[0.04]"
                      >
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                          {label}
                        </span>
                        <span className="text-[11px] font-bold text-gray-300">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={isSoldOut}
                    onClick={() => {
                      if (!user || usererror) {
                        navigate("/login", { state: { from: location } });
                        return;
                      }
                      setCheckoutOpen(true);
                    }}
                    className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 ${
                      isSoldOut ? "cursor-not-allowed opacity-80" : ""
                    }`}
                    style={{ background: theme?.ctaGradient }}
                  >
                    <span
                      className={`text-[12px] font-black uppercase tracking-widest ${
                        isSoldOut ? "text-red-500" : "text-black"
                      }`}
                    >
                      {isSoldOut ? "Sold Out" : "Get Tickets"}
                    </span>
                    {!isSoldOut && (
                      <MoveRight size={16} className="text-black" />
                    )}
                  </button>

                  <div className="flex justify-around pt-1">
                    {[
                      { Icon: ShieldCheck, label: "Secure" },
                      { Icon: Star, label: "Verified" },
                      { Icon: Zap, label: "Instant" },
                    ].map(({ Icon, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1"
                      >
                        <Icon size={14} className="text-gray-600" />
                        <span className="text-[7px] font-black text-gray-700 uppercase tracking-wide">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BARCODE STUB */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <div className="w-5 h-5 rounded-full -ml-2.5 bg-[#080809] shrink-0" />
                    <div className="flex-1 border-t-2 border-dashed border-white/[0.07]" />
                    <div className="w-5 h-5 rounded-full -mr-2.5 bg-[#080809] shrink-0" />
                  </div>
                  <div className="px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
                    <div className="flex items-end gap-[1px] sm:gap-[2px] h-8 sm:h-10">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-sm"
                          style={{
                            backgroundColor: theme?.accentColor,
                            opacity: 0.35,
                            width: i % 3 === 0 ? "3px" : "1.5px",
                            height: `${40 + (i % 5) * 8}%`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] font-black text-gray-700 uppercase tracking-widest">
                        Paysso
                      </p>
                      <p className="text-[9px] font-black text-gray-500 tracking-widest">
                        #{ticketId?.slice(-8)?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* TICKET TYPE DROPDOWN */}
              <div className="relative">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.0,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowTicketDropdown(!showTicketDropdown)}
                  className="w-full py-4 rounded-2xl border border-[#FF7A00]/30 bg-[#FF7A00]/[0.07] flex items-center justify-center gap-3 hover:bg-[#FF7A00]/[0.14] transition-colors"
                >
                  <Ticket size={15} className="text-[#FF7A00]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF7A00]">
                    View Ticket Types
                  </span>
                  <motion.span
                    animate={{ rotate: showTicketDropdown ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MoveRight size={14} className="text-[#FF7A00]" />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {showTicketDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowTicketDropdown(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-3 z-20 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1c1e]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                      >
                        {allTickets.map((t) => {
                          const typeKey =
                            t.name?.toLowerCase()?.trim() || "standard";
                          const tTheme =
                            ticketThemes[typeKey] || ticketThemes.standard;
                          const isActive = t._id === ticketId;

                          return (
                            <motion.button
                              key={t._id}
                              whileHover={{
                                backgroundColor: "rgba(255,255,255,0.03)",
                              }}
                              onClick={() => {
                                navigate(`/events/${eventId}/tickets/${t._id}`);
                                setShowTicketDropdown(false);
                              }}
                              className={`w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-white/[0.04] last:border-0 group transition-colors ${
                                isActive ? "bg-white/[0.04]" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: tTheme?.accentColor,
                                  }}
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                                  {t?.name}
                                </span>
                                {isActive && (
                                  <span className="text-[8px] font-black text-[#FF7A00] uppercase tracking-widest">
                                    ← Selected
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-white">
                                  {t?.price} ETB
                                </span>
                                <span className="text-[10px] text-gray-600">
                                  ({t?.availableQuantity} left)
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* LIVE BADGE */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="px-4 py-3 rounded-2xl border border-white/[0.04] bg-white/[0.015] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    Available Now
                  </span>
                </div>
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  Ref: {ticketId?.slice(-8)?.toUpperCase()}
                </span>
              </motion.div>
            </div>
          </aside>
        </div>

        {/* ── EVENT POLICIES ── */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 border-t border-white/[0.05] pt-16"
        >
          <div className="flex items-center gap-4 mb-10">
            <ShieldCheck size={18} className="text-[#FF7A00]" />
            <h2 className="text-lg font-black uppercase tracking-[0.2em]">
              Event Policies
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {event?.policies?.map((po, i) => (
              <motion.div
                key={po?.header}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ borderColor: "rgba(255,122,0,0.25)" }}
                className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">
                    {po?.header}
                  </h3>
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  {po?.descriptions}
                </p>
              </motion.div>
            ))}
          </div>

          <p className="text-[10px] text-gray-700 mt-8 text-center">
            Policies are set by{" "}
            <span className="text-[#FF7A00] font-bold">
              {event?.links?.venues?.name || "the venue"}
            </span>{" "}
            and Paysso. For questions, contact{" "}
            <span className="text-[#FF7A00] font-bold">support@paysso.com</span>
          </p>
        </motion.section>
      </main>

      {/* ── CHECKOUT MODAL ── */}
      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            amount={activeTicket?.price}
            name={event?.name}
            ticketId={ticketId}
            paymentMethods={event?.adminId?.paymentMethods || []}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventInfo;
