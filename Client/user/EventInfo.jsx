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
  History,
  Play,
  X as Close,
  BadgeCheck,
  UserPlus,
  Grid2X2,
  Video,
  Check,
  Music2,
  ExternalLink,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import api from "../src/Context/api/api.config";
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
      <p className="text-[12px] font-bold uppercase text-white tracking-wide">
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
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [showPreviousEvents, setShowPreviousEvents] = useState(false);
  const [followingOrganizer, setFollowingOrganizer] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(ticketId || null);
  const [archiveFilter, setArchiveFilter] = useState("all");
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

  const { data: previousPostsData } = useQuery({
    queryKey: ["event-previous-events", eventId],
    queryFn: async () => {
      const res = await api.get(`/api/events/${eventId}/previous-events`);
      return res.data;
    },
    enabled: Boolean(eventId),
  });

  const event = event_id?.event || null;
  const ticket = event_id?.ticket || null;
  const images = event?.pictures || [];
  const allTickets = (event_id?.tickets || []).filter(
    (t) => t.isActive !== false,
  );

  const { mutation: wishlistMutation } = useWishlistMutation();

  const checkWishlist = (id) => {
    return (
      wishlist?.wishlist?.items?.some((item) => item?.eventId?._id === id) ||
      false
    );
  };

  const handleWishlistToggle = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (!user) {
      toast.error("Please sign in to save events", { id: "signin-required" });
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
  const shareEvent = async (eventData) => {
    // Guard: If eventData is React's click event or undefined, fall back gracefully
    const isReactEvent = eventData && eventData.nativeEvent;
    const data = isReactEvent || !eventData ? {} : eventData;

    const title = data?.name || "Check out this event!";
    const text = data?.desc || `Get your tickets for ${title} now!`;

    // Cleanly extract URL string
    const url =
      typeof data?.links === "string" && data.links.trim() !== ""
        ? data.links
        : window.location.href;

    const sharePayload = { title, text, url };

    // 1. Try Native Web Share API (Mobile / Modern Browsers)
    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing via native sheet:", err);
        } else {
          return; // User cancelled share drawer
        }
      }
    }

    // 2. Clipboard Fallback
    try {
      await navigator.clipboard.writeText(String(url));
      toast.success("Event link copied to clipboard!", {
        id: "share-success",
        style: {
          background: "#121417",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.08)",
        },
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Unable to copy link.", { id: "share-error" });
    }
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

  // Organizers can hide how many tickets are left (on by default).
  const showAvailability = event?.showAvailability !== false;
  const isSoldOut = allTickets.length === 0 || isEventPassed8Hours(event);
  const activeTicketSource =
    allTickets.find((t) => t._id === selectedTicketId) ||
    ticket ||
    allTickets[0] ||
    null;
  const activeTicket = activeTicketSource
    ? {
        ...activeTicketSource,
        price: activeTicketSource.price ?? 0,
        type: activeTicketSource.name?.toLowerCase() ?? "standard",
      }
    : null;

  const ticketType = isSoldOut
    ? "soldout"
    : (activeTicket?.type || "standard").toLowerCase().trim();

  const theme = ticketThemes[ticketType] ?? ticketThemes.standard;

  const prevImg = () => setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImg = () => setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1));
  const previousEvents = (previousPostsData?.posts || []).map((post) => ({
    ...post,
    image: post.thumbnailUrl || post.mediaUrl,
    video: post.type === "video" ? post.mediaUrl : undefined,
  }));
  const visiblePreviousEvents = previousEvents.filter(
    (item) => archiveFilter === "all" || item.type === archiveFilter,
  );

  if (isLoading) return <SkeletonLoadingScreen />;

  /* ── stacked card layout data ── */
  const venue = event?.links?.venues || {};
  const startMoment = moment(event?.dates?.start?.localDate);
  const hasStartDate = startMoment.isValid();
  const endMoment = event?.dates?.end?.localDate
    ? moment(event.dates.end.localDate)
    : null;
  const eventDateLabel = hasStartDate
    ? startMoment.format("dddd, MMMM D, YYYY")
    : "Date to be announced";
  const startTimeLabel = event?.dates?.start?.localTime
    ? moment(event.dates.start.localTime, "HH:mm:ss").format("h:mm A")
    : "";
  const endTimeLabel =
    endMoment && event?.dates?.end?.localTime
      ? moment(event.dates.end.localTime, "HH:mm:ss").format("h:mm A")
      : "";
  let timezoneLabel = "";
  if (event?.dates?.timezone) {
    try {
      timezoneLabel =
        new Intl.DateTimeFormat("en-US", {
          timeZone: event.dates.timezone,
          timeZoneName: "short",
        })
          .formatToParts(new Date())
          .find((part) => part.type === "timeZoneName")?.value || "";
    } catch {
      timezoneLabel = "";
    }
  }
  const timeRangeLabel = startTimeLabel
    ? `${startTimeLabel}${endTimeLabel ? ` – ${endTimeLabel}` : ""}${
        timezoneLabel ? ` (${timezoneLabel})` : ""
      }`
    : "Time to be announced";

  const totalQuantity = allTickets.reduce(
    (sum, item) => sum + (item.totalQuantity || 0),
    0,
  );
  const availableQuantity = allTickets.reduce(
    (sum, item) => sum + (item.availableQuantity || 0),
    0,
  );
  const soldPercent =
    totalQuantity > 0
      ? Math.min(
          99,
          Math.max(
            0,
            Math.round(
              ((totalQuantity - availableQuantity) / totalQuantity) * 100,
            ),
          ),
        )
      : 0;

  const genreChips = [
    ...new Set(
      [
        ...(event?.musicGenre || []),
        ...(event?.classifications || []).map((c) => c?.genre?.name),
        ...(event?.classifications || []).map((c) => c?.subGenre?.name),
      ].filter(Boolean),
    ),
  ].slice(0, 2);

  const organizerName = event?.adminId?.organizationName || "Paysso Events";
  const organizerInitials = organizerName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const ratingScore = Number(event?.rating?.score || 0);
  const ratingReviews = Number(event?.rating?.reviews || 0);

  const metaBits = [
    ...(event?.amenities?.safety || []),
    ...(event?.amenities?.other || []),
  ].filter(Boolean);
  const soundLabel = genreChips.length
    ? `Sound: ${genreChips.join(" & ")}`
    : "";

  const mapQuery = encodeURIComponent(
    [venue.name, venue.address, venue.city].filter(Boolean).join(", "),
  );
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const heroImageSrc = images[0]
    ? images[0].startsWith("http")
      ? images[0]
      : `${API_URL}/${images[0]}`
    : "/Login.jpg";

  const descParagraphs = (
    event?.desc || "No description available for this event."
  )
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const venueLine = [venue?.address, venue?.city].filter(Boolean).join(", ");
  const doorsOpenLabel = event?.dates?.start?.localTime
    ? moment(event.dates.start.localTime, "HH:mm:ss").format("h:mm A")
    : "";
  const organizerEventsLabel =
    previousEvents.length > 0
      ? `${previousEvents.length} events hosted`
      : "Event organizer";
  const ratingLabel =
    ratingReviews > 0 ? `${ratingScore.toFixed(1)} Verified Rating` : "";

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0B0C0F] text-[#F4F4F5] antialiased">
      {/* Cover image, softly blurred, held behind the whole page. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img
          src={heroImageSrc}
          onError={(imageEvent) => {
            imageEvent.currentTarget.onerror = null;
            imageEvent.currentTarget.src = "/Login.jpg";
          }}
          alt=""
          aria-hidden="true"
          className="h-full w-full scale-110 object-cover opacity-[0.15] blur-[24px] saturate-150"
        />
        {/* Fade the cover out by roughly the middle of the viewport so the
            lower half of the page sits on the solid background. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,12,15,0) 0%, rgba(11,12,15,0.45) 28%, #0B0C0F 58%)",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-[720px] flex-1 flex-col px-3 pb-10 pt-4 sm:px-5 lg:max-w-[1400px] lg:px-6 lg:pt-8">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.08fr)_520px] lg:items-start lg:gap-6 lg:pl-8">
          {/* ── HERO POSTER ── */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[28px] bg-[#141518] shadow-[0_18px_52px_rgba(0,0,0,0.42)] lg:col-start-1 lg:row-start-1"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] sm:aspect-[4/3] lg:aspect-[4/3]">
              <img
                src={heroImageSrc}
                onError={(imageEvent) => {
                  imageEvent.currentTarget.onerror = null;
                  imageEvent.currentTarget.src = "/Login.jpg";
                }}
                alt={event?.name || "Event"}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(18,18,22,0.24) 0%, rgba(18,18,22,0.42) 32%, rgba(11,12,15,0.68) 60%, rgba(11,12,15,0.92) 100%), linear-gradient(to bottom, rgba(11,12,15,0.04) 0%, rgba(11,12,15,0.18) 22%, rgba(11,12,15,0.36) 44%, rgba(11,12,15,0.77) 100%)",
                }}
              />

              <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
                {isSoldOut ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    Sold out
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFB020]" />
                    Live selling
                  </span>
                )}

                {soldPercent > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFB020]" />
                    {soldPercent}% Sold Out
                  </span>
                )}
              </div>

              <div className="absolute right-4 top-14 flex flex-col gap-2">
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistMutation.isLoading}
                  aria-label="Save event"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-all active:scale-90 ${
                    checkWishlist(eventId)
                      ? "border-[#FF7A00] bg-[#FF7A00] text-black"
                      : "border-white/15 bg-black/45 text-white hover:bg-black/65"
                  }`}
                >
                  <Heart
                    size={15}
                    fill={checkWishlist(eventId) ? "currentColor" : "none"}
                    strokeWidth={2.5}
                  />
                </button>
                <button
                  onClick={() => shareEvent(event)}
                  aria-label="Share event"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur transition-all hover:bg-black/65 active:scale-90"
                >
                  <Share2 size={14} />
                </button>
              </div>

              <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                <span className="inline-flex rounded-md border border-[#E0B341]/45 bg-black/45 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.28em] text-[#E0B341] backdrop-blur">
                  Exclusive experience
                </span>
                <h1 className="mt-3 max-w-[95%] text-[32px] font-black uppercase leading-[0.95] tracking-[-0.02em] text-white sm:text-[44px] lg:text-[64px]">
                  {event?.name || "Event"}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] font-medium sm:text-[13px]">
                  {genreChips[0] && (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#FFB020]">
                      <Music2 size={12} />
                      {genreChips[0]}
                    </span>
                  )}
                  {venue?.name && (
                    <>
                      <span className="text-white/30">•</span>
                      <span className="text-white/85">{venue.name}</span>
                    </>
                  )}
                  {venue?.city && (
                    <>
                      <span className="text-white/30">•</span>
                      <span className="text-white/40">{venue.city}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── RIGHT RAIL: TICKET + POLICIES ── */}
          <aside className="space-y-3 sm:space-y-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:w-full lg:max-w-[520px] lg:self-start">
            {/* PHYSICAL TICKET STUB */}
            <motion.div
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="overflow-hidden rounded-[22px] border border-white/10 shadow-2xl"
              style={{
                background: "linear-gradient(160deg, #141416 0%, #0e0e10 100%)",
              }}
            >
              {/* TICKET TOP BAND */}
              <motion.div
                key={ticketType}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden px-6 pb-6 pt-6 sm:px-7"
                style={{ background: theme?.bandGradient }}
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10" />

                <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.45em] text-black/60">
                  Paysso · Official Ticket
                </p>
                <div className="relative z-10 mt-3 flex items-start justify-between gap-4">
                  <h2 className="max-w-[420px] text-3xl font-black uppercase leading-[1.05] tracking-tight text-black sm:text-4xl">
                    {event?.name || "Event"}
                  </h2>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/10">
                    <Ticket size={22} className="text-black/70" />
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex gap-6">
                  <div>
                    <p className="mb-1 text-[8px] font-black uppercase tracking-[0.3em] text-black/50">
                      Date
                    </p>
                    <p className="text-[12px] font-black text-black">
                      {moment(event?.dates?.start?.localDate).format(
                        "ddd, MMM DD YYYY",
                      )}
                    </p>
                  </div>
                  <div className="w-[1px] bg-black/15" />
                  <div className="min-w-0">
                    <p className="mb-1 text-[8px] font-black uppercase tracking-[0.3em] text-black/50">
                      Venue
                    </p>
                    <p className="truncate text-[12px] font-black text-black">
                      {event?.links?.venues?.name}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* TEAR LINE */}
              <div className="relative flex items-center">
                <div className="-ml-2.5 h-5 w-5 shrink-0 rounded-full bg-[#0B0C0F]" />
                <div className="flex-1 border-t-2 border-dashed border-white/[0.07]" />
                <div className="-mr-2.5 h-5 w-5 shrink-0 rounded-full bg-[#0B0C0F]" />
              </div>

              {/* TICKET BODY */}
              <div className="space-y-4 px-6 py-5 sm:px-7 sm:py-6">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">
                      Choose Your Ticket
                    </p>
                    {!isSoldOut && (
                      <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        Live
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="flex max-h-[200px] flex-col gap-2 overflow-y-auto pr-0.5">
                      {allTickets.map((t) => {
                        const typeKey =
                          t.name?.toLowerCase()?.trim() || "standard";
                        const tTheme =
                          ticketThemes[typeKey] || ticketThemes.standard;
                        const isActive = t._id === activeTicket?._id;
                        const rowSoldOut = (t.availableQuantity ?? 0) <= 0;

                        return (
                          <button
                            key={t._id}
                            disabled={rowSoldOut}
                            onClick={() => setSelectedTicketId(t._id)}
                            className={`flex w-full shrink-0 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors sm:px-4 ${
                              rowSoldOut
                                ? "cursor-not-allowed border-white/[0.04] bg-white/[0.01] opacity-50"
                                : isActive
                                ? "bg-white/[0.04]"
                                : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                            }`}
                            style={
                              isActive && !rowSoldOut
                                ? {
                                    borderColor: tTheme?.accentColor,
                                    backgroundColor: `${tTheme?.accentColor}1a`,
                                  }
                                : undefined
                            }
                          >
                            <span
                              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                              style={{
                                borderColor: isActive
                                  ? tTheme?.accentColor
                                  : "#444",
                              }}
                            >
                              {isActive && (
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor: tTheme?.accentColor,
                                  }}
                                />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block truncate text-[12px] font-black uppercase tracking-wide ${
                                  isActive ? "text-white" : "text-gray-300"
                                }`}
                              >
                                {t?.name}
                              </span>
                            </span>
                            <span className="shrink-0 text-right">
                              {t?.price === 0 ? (
                                <span className="text-[14px] font-black text-white">
                                  FREE
                                </span>
                              ) : (
                                <>
                                  <span className="text-[17px] font-black text-white">
                                    {t?.price}
                                  </span>
                                  <span className="ml-1 text-[8px] font-bold text-white/40">
                                    ETB
                                  </span>
                                </>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {allTickets.length > 3 && (
                      <div className="pointer-events-none absolute bottom-0 left-0 right-1 h-8 rounded-b-2xl bg-gradient-to-t from-[#141416] to-transparent" />
                    )}
                  </div>
                  {allTickets.length > 3 && (
                    <p className="mt-1.5 text-center text-[8px] font-black uppercase tracking-widest text-gray-600">
                      Scroll for {allTickets.length - 3} more
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {[
                    {
                      label: "Doors Open",
                      value: doorsOpenLabel || "Check venue",
                    },
                    showAvailability && {
                      label: "Available Tickets",
                      value: activeTicket?.availableQuantity ?? "—",
                    },
                  ]
                    .filter(Boolean)
                    .map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                          {label}
                        </span>
                        <span className="text-[12px] font-bold text-gray-300">
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
                  className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 ${
                    isSoldOut ? "cursor-not-allowed opacity-80" : ""
                  }`}
                  style={{ background: theme?.ctaGradient }}
                >
                  <span
                    className={`text-[13px] font-black uppercase tracking-widest ${
                      isSoldOut ? "text-red-500" : "text-black"
                    }`}
                  >
                    {isSoldOut ? "Sold Out" : "Get Tickets"}
                  </span>
                  {!isSoldOut && <MoveRight size={16} className="text-black" />}
                </button>
              </div>

              {/* BARCODE STUB */}
              <div className="relative">
                <div className="relative flex items-center">
                  <div className="-ml-2.5 h-5 w-5 shrink-0 rounded-full bg-[#0B0C0F]" />
                  <div className="flex-1 border-t-2 border-dashed border-white/[0.07]" />
                  <div className="-mr-2.5 h-5 w-5 shrink-0 rounded-full bg-[#0B0C0F]" />
                </div>
                <div className="flex items-center justify-between px-6 py-5 sm:px-7">
                  <div className="flex h-8 items-end gap-[1px] sm:h-10 sm:gap-[2px]">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-sm"
                        style={{
                          backgroundColor: theme?.accentColor,
                          opacity: 0.55,
                          width: i % 3 === 0 ? "3px" : "1.5px",
                          height: `${40 + (i % 5) * 8}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] font-black uppercase tracking-widest text-gray-700">
                      Verified Pass
                    </p>
                    <p className="text-[10px] font-black tracking-widest text-gray-500">
                      #
                      {(activeTicket?._id || eventId)?.slice(-8)?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* TICKETS SELLING FAST */}
            <div className="flex items-center justify-between px-1 py-2">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Tickets selling fast
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                Secure checkout
              </span>
            </div>
          </aside>

          {/* ── LEFT COLUMN: DETAILS ── */}
          <div className="space-y-6 lg:col-start-1 lg:row-start-2 lg:pl-3">
            {/* DATE + VENUE */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-white/[0.06]">
              <div className="flex items-center gap-4 py-1 sm:pr-6">
                <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                    {hasStartDate ? startMoment.format("MMM") : "TBA"}
                  </span>
                  <span className="text-2xl font-black leading-none text-white">
                    {hasStartDate ? startMoment.format("DD") : "—"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                    Date &amp; Time
                  </p>
                  <p className="mt-1 text-[16px] font-semibold leading-snug text-white">
                    {eventDateLabel}
                  </p>
                  <p className="mt-0.5 text-[13px] text-white/45">
                    {timeRangeLabel}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden py-1 sm:pl-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF7A00]/10 text-[#FF7A00]">
                    <MapPin size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                      Venue Location
                    </p>
                    <p className="mt-1 text-[16px] font-semibold leading-snug text-white">
                      {venue?.name || "Venue to be announced"}
                    </p>
                    {venueLine && (
                      <p className="mt-0.5 text-[13px] leading-relaxed text-white/45">
                        {venueLine}
                      </p>
                    )}
                  </div>
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open location in Google Maps"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMap((isOpen) => !isOpen)}
                  className="relative mt-4 block h-24 w-full overflow-hidden rounded-xl"
                  aria-label="Toggle venue map"
                >
                  <iframe
                    title="Venue map"
                    src={mapEmbedUrl}
                    loading="lazy"
                    className="pointer-events-none h-full w-full"
                    style={{
                      border: 0,
                      filter:
                        "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)",
                    }}
                  />
                  <span className="absolute inset-0 bg-[#0B0C0F]/25" />
                  <span className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0B0C0F] to-transparent" />
                  <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#FF7A00] bg-[#0B0C0F]/85 text-[#FF7A00]">
                    <MapPin size={15} />
                  </span>
                </button>
                <AnimatePresence>
                  {showMap && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 300, opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="relative overflow-hidden border-t border-white/10"
                    >
                      <iframe
                        title="Venue map expanded"
                        src={mapEmbedUrl}
                        className="h-full w-full"
                        style={{
                          border: 0,
                          filter:
                            "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowMap(false)}
                        aria-label="Close map"
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/80 text-white backdrop-blur"
                      >
                        <X size={15} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ABOUT */}
            <div className="border-t border-white/[0.06] pt-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-4 w-[3px] rounded-full bg-[#FF7A00]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#FF7A00]">
                  About this event
                </span>
              </div>
              <div className="space-y-3 text-[14px] leading-relaxed">
                {descParagraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={
                      index === 0 ? "font-semibold text-white" : "text-white/55"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              {(metaBits.length > 0 || soundLabel) && (
                <div className="mt-5 border-t border-white/[0.06] pt-4 text-[12px] text-white/45">
                  {metaBits.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {metaBits.slice(0, 3).map((bit, index) => (
                        <span
                          key={bit}
                          className="inline-flex items-center gap-1.5"
                        >
                          <ShieldCheck size={12} className="text-[#FF7A00]" />
                          {bit}
                          {index < Math.min(metaBits.length, 3) - 1 && (
                            <span className="ml-1.5 text-white/20">•</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  {soundLabel && <p className="mt-1.5">{soundLabel}</p>}
                </div>
              )}
            </div>

            {/* ORGANIZER + COMMUNITY REVIEWS */}
            <div className="grid grid-cols-1 gap-6 border-t border-white/[0.06] pt-6 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-white/[0.06]">
              <div className="py-1 text-center sm:pr-6">
                <div className="relative mx-auto h-16 w-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#FF7A00] bg-[#FF7A00]/10 text-lg font-black text-white">
                    {organizerInitials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF7A00] text-black">
                    <Check size={11} strokeWidth={3.5} />
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <p className="truncate text-[16px] font-semibold text-white">
                    {organizerName}
                  </p>
                  <BadgeCheck
                    size={15}
                    className="shrink-0 text-[#FF7A00]"
                    fill="currentColor"
                    color="#141518"
                  />
                </div>
                <p className="mt-1 text-[12px] text-white/40">
                  {organizerEventsLabel}
                  {ratingLabel ? ` • ${ratingLabel}` : ""}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href="mailto:support@paysso.com"
                    className="rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-center text-[12px] font-semibold text-white transition-colors hover:bg-white/[0.08]"
                  >
                    Contact Host
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setFollowingOrganizer((isFollowing) => !isFollowing)
                    }
                    className={`rounded-xl py-2.5 text-[12px] font-semibold transition-colors ${
                      followingOrganizer
                        ? "bg-white/[0.08] text-white"
                        : "bg-white text-black hover:bg-white/90"
                    }`}
                  >
                    {followingOrganizer ? "Following" : "Follow"}
                  </button>
                </div>
              </div>

              <div className="py-1 sm:pl-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                    Community Reviews
                  </span>
                  <StarRating rating={rating} onRate={setRating} size={14} />
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-white/40">
                  Have questions or attended previous {organizerName} editions?
                  Drop your feedback below.
                </p>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition-colors focus-within:border-[#FF7A00]/50">
                  <input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && handlePostComment()
                    }
                    placeholder="Leave a comment..."
                    className="min-w-0 flex-1 border-none bg-transparent text-[12px] uppercase tracking-wide text-white outline-none placeholder:text-white/25"
                  />
                  <button
                    type="button"
                    onClick={handlePostComment}
                    disabled={isPending}
                    aria-label="Post comment"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF7A00] transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-50"
                  >
                    <Send size={13} className="text-black" />
                  </button>
                </div>

                {commentsIsLoading ? (
                  <SkeletonTheme baseColor="#1e2023" highlightColor="#2a2d31">
                    <div className="mt-4 space-y-2">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Skeleton circle width={28} height={28} />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton width={80} height={10} />
                            <Skeleton width="90%" height={8} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SkeletonTheme>
                ) : (
                  <>
                    {comments?.comments?.length > 0 && (
                      <div className="mt-4 space-y-2.5">
                        {comments.comments
                          .slice(0, displayedCommentsCount)
                          .map((comment, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start gap-2.5"
                            >
                              <img
                                src={
                                  comment?.userProfile?.avatarUrl?.startsWith(
                                    "http",
                                  )
                                    ? comment.userProfile.avatarUrl
                                    : `${API_URL}/${comment?.userProfile?.avatarUrl}`
                                }
                                alt={comment?.userProfile?.fullName}
                                className="h-7 w-7 shrink-0 rounded-full border border-white/10 object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate text-[12px] font-semibold text-white">
                                    {comment?.userProfile?.fullName}
                                  </p>
                                  {comment?.rating > 0 && (
                                    <span className="shrink-0 text-[10px] font-bold text-[#FF7A00]">
                                      {comment.rating}/5
                                    </span>
                                  )}
                                </div>
                                <p className="break-words text-[12px] leading-relaxed text-white/45">
                                  {comment?.text}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    )}
                    {comments?.comments?.length > displayedCommentsCount && (
                      <button
                        type="button"
                        onClick={() =>
                          setDisplayedCommentsCount((previous) =>
                            Math.min(previous + 4, comments.comments.length),
                          )
                        }
                        className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-[#FF7A00] hover:text-amber-300"
                      >
                        Show more
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* PREVIOUS EVENTS */}
            <button
              type="button"
              onClick={() => setShowPreviousEvents(true)}
              className="group flex w-full items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-left transition-colors"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF7A00]/10 text-[#FF7A00]">
                  <History size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-black uppercase tracking-[0.22em] text-white">
                    Previous Events
                  </span>
                  <span className="block truncate text-[12px] text-white/40">
                    {previousEvents.length > 0
                      ? `${previousEvents.length} photos & videos`
                      : "Photos & videos from past shows"}
                  </span>
                </span>
              </span>
              <MoveRight
                size={16}
                className="shrink-0 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-[#FF7A00]"
              />
            </button>

            {/* EVENT POLICY & ENTRY TERMS */}
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={13} className="text-[#FF7A00]" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E0B341]">
                  Event Policy &amp; Entry Terms
                </h2>
              </div>
              {event?.policies?.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {event.policies.map((policy) => (
                    <li
                      key={policy?.header}
                      className="text-[12px] leading-relaxed text-white/40"
                    >
                      <span className="font-semibold text-white/60">
                        {policy?.header}:
                      </span>{" "}
                      {policy?.descriptions}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[12px] leading-relaxed text-white/40">
                Policies are set by{" "}
                <span className="text-[#FF7A00]">
                  {venue?.name || "the venue"}
                </span>{" "}
                &amp; Paysso. Non-refundable after event start. For assistance,
                contact{" "}
                <span className="text-[#FF7A00]">support@paysso.com</span>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── DEMO ORGANIZER ARCHIVE ── */}
      <AnimatePresence>
        {showPreviousEvents && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8 pt-20 backdrop-blur-md sm:pt-24"
            onClick={() => setShowPreviousEvents(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="archive-scrollbar relative max-h-[calc(100vh-7rem)] w-full max-w-none overflow-y-auto px-2 py-1 sm:px-6 sm:py-4 lg:px-14"
            >
              <button
                type="button"
                onClick={() => setShowPreviousEvents(false)}
                className="absolute right-5 top-5 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/30 text-white transition-all hover:bg-white/10 active:scale-90"
                aria-label="Close previous events"
              >
                <Close size={18} />
              </button>

              <div className="mb-6 flex flex-col gap-5 border-b border-white/[0.07] pb-6 pr-12">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.45em] text-[#FF7A00]">
                    Organizer archive
                  </p>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                    Previous events
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
                    See the moments, people, and energy behind the
                    organizer&apos;s events.
                  </p>
                </div>
              </div>

              <div className="mb-5 flex items-center gap-2">
                {[
                  { id: "all", label: "All posts", icon: Grid2X2 },
                  { id: "photo", label: "Photos", icon: Grid2X2 },
                  { id: "video", label: "Videos", icon: Video },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setArchiveFilter(id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      archiveFilter === id
                        ? "bg-[#FF7A00] text-black"
                        : "text-gray-500 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePreviousEvents.map((item, index) => (
                  <article
                    key={item._id || item.title || index}
                    className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {item.type === "video" ? (
                        <video
                          src={item.video}
                          poster={item.image}
                          controls
                          className="h-full w-full object-cover"
                          aria-label={item.title}
                        />
                      ) : (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {item.type === "video" && !item.video && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF7A00] text-black shadow-lg shadow-black/30">
                            <Play
                              size={18}
                              fill="currentColor"
                              className="ml-0.5"
                            />
                          </span>
                        </div>
                      )}
                      <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white/80">
                        {item.type === "video" ? "Video" : "Photo"}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                        {item.date}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              {visiblePreviousEvents.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/[0.08] py-12 text-center text-sm text-gray-600">
                  No posts in this category yet.
                </p>
              )}

              <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-amber-300 text-xl font-black text-black">
                  P
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-base font-black text-white">
                      PAYSSO Events
                    </h3>
                    <BadgeCheck
                      size={15}
                      className="shrink-0 text-[#FF7A00]"
                      fill="currentColor"
                      color="#121417"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    @payssoevents · Event organizer
                  </p>
                </div>
                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <div className="flex gap-5 text-left sm:text-right">
                    <div>
                      <p className="text-sm font-black text-white">24</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-gray-600">
                        Events
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">8.4K</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-gray-600">
                        Followers
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFollowingOrganizer((isFollowing) => !isFollowing)
                    }
                    className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                      followingOrganizer
                        ? "bg-white/[0.08] text-white"
                        : "bg-[#FF7A00] text-black hover:bg-amber-300"
                    }`}
                  >
                    {followingOrganizer ? (
                      <Check size={14} />
                    ) : (
                      <UserPlus size={14} />
                    )}
                    {followingOrganizer ? "Following" : "Follow"}
                  </button>
                </div>
              </div>
              <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-700">
                Demo organizer content
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHECKOUT MODAL ── */}
      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            amount={activeTicket?.price}
            name={event?.name}
            eventId={eventId}
            ticketId={activeTicket?._id || ticketId}
            paymentMethods={event?.adminId?.paymentMethods || []}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventInfo;
