// src/user/components/EventTile.jsx
// Posh-style event poster card shared by the Discover and Explore pages.
// Maps to GET /api/events (the parent passes one event from that payload).

import { Link } from "react-router-dom";
import { Heart, Share2 } from "lucide-react";

const FALLBACK_IMAGE = "/datebackground.jpg";
const FALLBACK_TZ = "Africa/Addis_Ababa";

export const eventTimeZone = (event) =>
  event?.dates?.timezone || FALLBACK_TZ;

export const eventImageUrl = (event, apiUrl) => {
  const first = event?.pictures?.[0];
  if (!first) return FALLBACK_IMAGE;
  if (first.startsWith("http")) return first;
  return apiUrl ? `${apiUrl}/${first}` : `/${first}`;
};

export const eventDateLabel = (event) => {
  const raw = event?.dates?.start?.dateTime;
  if (!raw) return event?.dates?.start?.localDate || "Date TBA";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return event?.dates?.start?.localDate || "Date TBA";
  }
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: eventTimeZone(event),
  });
};

export const eventVenueLabel = (event) =>
  event?.links?.venues?.name ||
  event?._embedded?.venues?.[0]?.name ||
  event?.locale ||
  event?.links?.venues?.city ||
  "Venue TBA";

export const eventPriceLabel = (event) => {
  const range = event?.priceRanges?.[0];
  const min = range?.min ?? range?.price ?? event?.price;
  if (min === 0 || min === "0") return "Free";
  if (min === undefined || min === null || min === "") return "Tickets";
  return `${min} Birr`;
};

export const eventHref = (event, soldOut) =>
  !soldOut && event?.tickets?.length > 0
    ? `/events/${event?._id}/tickets/${event?.tickets?.[0]?._id}`
    : `/events/${event?._id}`;

const EventTile = ({
  event,
  apiUrl,
  soldOut = false,
  isWishlisted = false,
  onWishlist,
  onOpen,
  onShare,
  href,
  showWishlist = true,
}) => {
  if (!event) return null;

  return (
    <article className="group relative">
      <Link
        to={href || eventHref(event, soldOut)}
        onClick={() => onOpen?.(event)}
        aria-label={`${event.name} — ${eventDateLabel(event)}`}
        className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#121417]"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#1C1F22]">
          <img
            src={eventImageUrl(event, apiUrl)}
            alt=""
            loading="lazy"
            onError={(imageEvent) => {
              imageEvent.currentTarget.onerror = null;
              imageEvent.currentTarget.src = FALLBACK_IMAGE;
            }}
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] ${
              soldOut ? "opacity-60 saturate-50" : ""
            }`}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />

          {soldOut && (
            <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
              Sold out
            </span>
          )}

          <div className="pointer-events-none absolute inset-x-3 bottom-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/90">
              {eventDateLabel(event)}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="line-clamp-2 text-[14px] font-black uppercase leading-tight tracking-tight text-white transition-colors group-hover:text-[#FF7A00] sm:text-[15px]">
            {event.name}
          </h3>
          <p className="line-clamp-1 text-[11px] font-semibold text-gray-500">
            {eventVenueLabel(event)}
          </p>
          <p className="pt-0.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#FF7A00]">
            {eventPriceLabel(event)}
          </p>
        </div>
      </Link>

      {showWishlist && (
        <button
          type="button"
          onClick={(clickEvent) => onWishlist?.(event, clickEvent)}
          aria-label={
            isWishlisted
              ? `Remove ${event.name} from wishlist`
              : `Save ${event.name} to wishlist`
          }
          aria-pressed={isWishlisted}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121417] active:scale-90 ${
            isWishlisted
              ? "border-[#FF7A00] bg-[#FF7A00] text-black shadow-lg shadow-[#FF7A00]/20"
              : "border-white/10 bg-black/30 text-white hover:bg-black/60"
          }`}
        >
          <Heart
            size={15}
            fill={isWishlisted ? "currentColor" : "none"}
            strokeWidth={2.5}
          />
        </button>
      )}

      {showWishlist && onShare && (
        <button
          type="button"
          onClick={(clickEvent) => onShare(event, clickEvent)}
          aria-label={`Share ${event.name}`}
          className="absolute right-3 top-14 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121417] active:scale-90"
        >
          <Share2 size={14} />
        </button>
      )}
    </article>
  );
};

export default EventTile;
