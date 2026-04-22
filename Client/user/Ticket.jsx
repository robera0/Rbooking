import React, { useState } from "react";
import {
  Ticket,
  ShieldCheck,
  Star,
  Zap,
  MoveRight,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { eventService } from "../src/Context/ApiEvent";
import toast, { Toaster } from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";
import moment from "moment";

/* ── ticket-type colour themes (identical to EventInfo) ── */
const ticketThemes = {
  vip: {
    bandGradient:
      "linear-gradient(120deg, #3B82F6 0%, #60A5FA 60%, #93C5FD 100%)",
    ctaGradient:
      "linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #3B82F6 100%)",
    accentColor: "#60A5FA",
    label: "VIP",
  },
  "early bird": {
    bandGradient:
      "linear-gradient(120deg, #22C55E 0%, #4ADE80 60%, #86EFAC 100%)",
    ctaGradient:
      "linear-gradient(135deg, #22C55E 0%, #4ADE80 50%, #22C55E 100%)",
    accentColor: "#4ADE80",
    label: "Early Bird",
  },
  regular: {
    bandGradient:
      "linear-gradient(120deg, #EAB308 0%, #FACC15 60%, #FDE047 100%)",
    ctaGradient:
      "linear-gradient(135deg, #EAB308 0%, #FACC15 50%, #EAB308 100%)",
    accentColor: "#FACC15",
    label: "Regular",
  },
  default: {
    bandGradient:
      "linear-gradient(120deg, #FF7A00 0%, #FF9D00 60%, #FFC347 100%)",
    ctaGradient:
      "linear-gradient(135deg, #FF7A00 0%, #FF9D00 50%, #FF7A00 100%)",
    accentColor: "#FF7A00",
    label: "General Admission",
  },
};

/* ── status dot config ── */
const STATUS = {
  onsale: { label: "On Sale", color: "#4ADE80" },
  cancelled: { label: "Cancelled", color: "#F87171" },
  postponed: { label: "Postponed", color: "#60A5FA" },
  upcoming: { label: "Upcoming", color: "#FACC15" },
};

/* ── TearLine (exact same as EventInfo) ── */
const TearLine = () => (
  <div className="relative flex items-center">
    <div className="w-5 h-5 rounded-full -ml-2.5 bg-[#080809] shrink-0" />
    <div className="flex-1 border-t-2 border-dashed border-white/[0.07]" />
    <div className="w-5 h-5 rounded-full -mr-2.5 bg-[#080809] shrink-0" />
  </div>
);

/* ── Filter tab ── */
const FilterTab = ({ label, active, count, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
      active
        ? "border-[#FF7A00]/40 bg-[#FF7A00]/10 text-[#FF7A00]"
        : "border-white/[0.06] bg-white/[0.025] text-gray-500 hover:text-gray-300"
    }`}
  >
    {label}
    {count != null && (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-lg font-black ${
          active
            ? "bg-[#FF7A00]/20 text-[#FF7A00]"
            : "bg-white/[0.06] text-gray-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

/* ═══════════════════ MAIN ═══════════════════ */
const TicketHome = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useService();
  const { tickets, ticketLoading, ticketsError, ticketIsError } =
    eventService();
  const [hasAlerted, setHasAlerted] = useState(false);
  const [filter, setFilter] = useState("all");

  if (ticketIsError && !isLoggedIn && !hasAlerted) {
    toast.error(ticketsError?.message || "Login required", { duration: 3000 });
    setHasAlerted(true);
  }

  const allTickets = Array.isArray(tickets?.tickets) ? tickets.tickets : [];
  const filtered =
    filter === "all"
      ? allTickets
      : allTickets.filter(
          (t) => t.ticketId?.eventId?.dates?.status?.code === filter,
        );

  const counts = {
    all: allTickets.length,
    onsale: allTickets.filter(
      (t) => t.ticketId?.eventId?.dates?.status?.code === "onsale",
    ).length,
    upcoming: allTickets.filter(
      (t) => t.ticketId?.eventId?.dates?.status?.code === "upcoming",
    ).length,
  };

  return (
    <div className="relative min-h-screen bg-[#121417] text-[#F4F4F5] antialiased overflow-x-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#111",
            color: "#fff",
            border: "1px solid rgba(255,122,0,0.3)",
          },
        }}
      />

      {/* ambient orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none top-[-150px] left-[-150px] bg-[#FF7A00]/[0.07]" />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none top-[40%] right-[-100px] bg-purple-600/[0.05]" />

      {/* top ribbon */}
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

      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-14 pb-28 relative">
        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <h1 className="text-5xl  uppercase  tracking-tighter leading-none mb-2">
            My <span className="text-[#FF7A00]">Tickets</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {allTickets.length === 0
              ? "No tickets purchased yet"
              : `${allTickets.length} ticket${
                  allTickets.length !== 1 ? "s" : ""
                } in your collection`}
          </p>
        </motion.div>

        {/* ── FILTER TABS ── */}
        {allTickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2 mb-10 flex-wrap"
          >
            <FilterTab
              label="All"
              active={filter === "all"}
              count={counts.all}
              onClick={() => setFilter("all")}
            />
            <FilterTab
              label="On Sale"
              active={filter === "onsale"}
              count={counts.onsale}
              onClick={() => setFilter("onsale")}
            />
            <FilterTab
              label="Upcoming"
              active={filter === "upcoming"}
              count={counts.upcoming}
              onClick={() => setFilter("upcoming")}
            />
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {ticketLoading && (
          <div className="flex justify-center py-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-10 h-10 rounded-full border-2 border-[#FF7A00] border-t-transparent"
            />
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!ticketLoading && allTickets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
              className="w-20 h-20 rounded-3xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center mb-6"
            >
              <Ticket size={32} className="text-[#FF7A00]" />
            </motion.div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              No Tickets Yet
            </h2>
            <p className="text-gray-600 text-sm">
              Your purchased tickets will appear here.
            </p>
          </motion.div>
        )}

        {/* ── FILTERED EMPTY ── */}
        {!ticketLoading && allTickets.length > 0 && filtered.length === 0 && (
          <p className="text-center text-gray-600 text-sm py-16">
            No tickets match this filter.
          </p>
        )}

        {/* ── TICKET STUBS (identical structure to EventInfo) ── */}
        {!ticketLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filtered.map((t, idx) => {
              const event = t.ticketId?.eventId;
              const ticketId = t.ticketId;
              const tierKey = (ticketId?.type || "default")
                .toLowerCase()
                .trim();
              const theme = ticketThemes[tierKey] ?? ticketThemes.default;
              const statusKey = event?.dates?.status?.code;
              const status = STATUS[statusKey] || STATUS.upcoming;

              const infoRows = [
                {
                  label: "Venue",
                  value:
                    event?._embedded?.venues?.[0]?.name ||
                    event?.locale ||
                    "TBA",
                },
                {
                  label: "Status",
                  value: status.label,
                },
                {
                  label: "Doors Open",
                  value: event?.dates?.start?.localTime
                    ? moment(event.dates.start.localTime, "HH:mm:ss").format(
                        "h:mm A",
                      )
                    : "Check venue",
                },
              ];

              return (
                <motion.div
                  key={ticketId?._id || idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: idx * 0.1,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl"
                  style={{
                    background:
                      "linear-gradient(160deg, #141416 0%, #0e0e10 100%)",
                  }}
                >
                  {/* ── TOP BAND ── */}
                  <div
                    className="relative px-5 pt-5 pb-4 overflow-hidden"
                    style={{ background: theme.bandGradient }}
                  >
                    {/* decorative circles */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-black/10" />

                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-black/60 mb-0.5">
                          Paysso · Official Ticket
                        </p>
                        <h2 className="text-base font-black uppercase tracking-tight text-black leading-tight max-w-[180px]">
                          {event?.name || "Event"}
                        </h2>
                      </div>
                      <div className="h-8 w-8 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
                        <Ticket size={15} className="text-black/70" />
                      </div>
                    </div>

                    <div className="relative z-10 flex gap-4 mt-3">
                      <div>
                        <p className="text-[7px] font-black uppercase tracking-[0.3em] text-black/50 mb-0.5">
                          Date
                        </p>
                        <p className="text-[10px] font-black text-black">
                          {event?.dates?.start?.localDate
                            ? moment(event.dates.start.localDate).format(
                                "ddd, MMM DD YYYY",
                              )
                            : "TBA"}
                        </p>
                      </div>
                      <div className="w-[1px] bg-black/15" />
                      <div>
                        <p className="text-[7px] font-black uppercase tracking-[0.3em] text-black/50 mb-0.5">
                          Type
                        </p>
                        <p className="text-[10px] font-black text-black">
                          {theme.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── TEAR LINE 1 ── */}
                  <TearLine />

                  {/* ── TICKET BODY ── */}
                  <div className="px-5 py-4 space-y-4">
                    {/* type + price row */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[7px] font-black text-gray-600 uppercase tracking-[0.4em] mb-0.5">
                          Ticket Type
                        </p>
                        <p className="text-sm font-black uppercase tracking-tight">
                          {ticketId?.type || "General Admission"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[7px] font-black text-gray-600 uppercase tracking-[0.4em] mb-0.5">
                          Price
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black tracking-tighter">
                            ${ticketId?.price || "0"}
                          </span>
                          <span
                            className="text-[9px] font-black uppercase"
                            style={{ color: theme.accentColor }}
                          >
                            USD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* info rows */}
                    <div className="space-y-1.5">
                      {infoRows.map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between py-1.5 border-b border-white/[0.04]"
                        >
                          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                            {label}
                          </span>
                          <span className="text-[10px] font-bold text-gray-300">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/tickets_home/${ticketId?._id}`)}
                      className="relative w-full py-3 rounded-xl flex items-center justify-center gap-2 overflow-hidden"
                      style={{ background: theme.ctaGradient }}
                    >
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.5,
                          ease: "easeInOut",
                          repeatDelay: 1,
                        }}
                        className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg] pointer-events-none"
                      />
                      <span className="relative text-[10px] font-black uppercase tracking-widest text-black">
                        View Ticket
                      </span>
                      <MoveRight size={13} className="relative text-black" />
                    </motion.button>

                    {/* trust row */}
                    <div className="flex justify-around">
                      {[
                        { Icon: ShieldCheck, label: "Secure" },
                        { Icon: Star, label: "Verified" },
                        { Icon: Zap, label: "Instant" },
                      ].map(({ Icon, label }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center gap-0.5"
                        >
                          <Icon size={11} className="text-gray-600" />
                          <span className="text-[6px] font-black text-gray-700 uppercase tracking-wide">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── TEAR LINE 2 ── */}
                  <TearLine />

                  {/* ── BARCODE STUB ── */}
                  <div className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-end gap-[2px] h-7">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-sm"
                          style={{
                            backgroundColor: theme.accentColor,
                            opacity: 0.35,
                            width: i % 3 === 0 ? "2.5px" : "1.5px",
                            height: `${40 + (i % 5) * 8}%`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] font-black text-gray-700 uppercase tracking-widest">
                        Paysso
                      </p>
                      <p className="text-[8px] font-black text-gray-500 tracking-widest">
                        #{ticketId?._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketHome;
