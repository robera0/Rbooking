import React from "react";
import { eventService } from "@/Context/ApiEvent";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Hash,
  Download,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import moment from "moment";

/* ─── design tokens ─── */
const SURFACE = "bg-[#111214]";
const BORDER = "border-[#1f2023]";

/* ─── tier config ─── */
const TIER = {
  vip:          { accent: "#60a5fa", label: "VIP",              bg: "rgba(96,165,250,0.08)"  },
  "early bird": { accent: "#4ade80", label: "Early Bird",        bg: "rgba(74,222,128,0.08)"  },
  regular:      { accent: "#facc15", label: "Regular",           bg: "rgba(250,204,21,0.08)"  },
  default:      { accent: "#FF7A00", label: "General Admission", bg: "rgba(255,122,0,0.08)"   },
};

/* ─── detail row ─── */
const Detail = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-[#1a1b1e] last:border-0">
    <Icon size={14} className="text-[#4b4d52] mt-0.5 shrink-0" />
    <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
      <span className="text-[12px] text-[#6b7280] font-medium shrink-0">{label}</span>
      <span className="text-[13px] text-[#f4f4f5] font-medium text-right truncate">{value}</span>
    </div>
  </div>
);

const ViewTicket = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { fetchTicketById } = eventService();

  const { data: ticketsinfo, isLoading, isError, error } = useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: () => fetchTicketById(ticketId),
    enabled: !!ticketId,
    retry: false,
  });

  const event   = ticketsinfo?.ticket?.ticketId?.eventId;
  const tkt     = ticketsinfo?.ticket?.ticketId;
  const orderNo = ticketsinfo?.ticket?.orderNo;
  const tierKey = (tkt?.type || "default").toLowerCase().trim();
  const tier    = TIER[tierKey] ?? TIER.default;

  const localDate = event?.dates?.start?.localDate;
  const localTime = event?.dates?.start?.localTime;

  return (
    <div className="min-h-screen text-[#f4f4f5] antialiased" style={{ background: "#0c0d0e" }}>

      {/* dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #1f2023 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.5,
        }}
      />

      {/* top accent line */}
      <div className="fixed top-0 left-0 right-0 h-px z-50">
        <div className="h-full w-full bg-gradient-to-r from-[#FF7A00]/60 via-[#FF7A00]/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5 pt-8 pb-24">

        {/* ── back nav ── */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6b7280] hover:text-[#f4f4f5] transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          My Tickets
        </motion.button>

        {/* ── loading ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={24} className="text-[#FF7A00] animate-spin" />
          </div>
        )}

        {/* ── error ── */}
        {isError && (
          <div className={`rounded-2xl ${SURFACE} border ${BORDER} p-8 text-center`}>
            <p className="text-[14px] font-medium text-[#f4f4f5] mb-1">Ticket not found</p>
            <p className="text-[12px] text-[#6b7280]">{error?.message}</p>
          </div>
        )}

        {/* ── ticket card ── */}
        {!isLoading && !isError && event && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* page title */}
            <div className="mb-5">
              <h1 className="text-[20px] font-semibold text-[#f4f4f5]">Ticket Details</h1>
              <p className="text-[13px] text-[#6b7280] mt-0.5">Your entry pass for this event</p>
            </div>

            {/* ── MAIN TICKET CARD ── */}
            <div className={`rounded-2xl ${SURFACE} border ${BORDER} overflow-hidden`}>

              {/* event banner */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={event?.pictures?.[0] || event?.pictures?.[1] || "/Login.jpg"}
                  alt={event?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-[#111214]/40 to-transparent" />

                {/* tier badge */}
                <span
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm"
                  style={{
                    background: tier.bg,
                    color: tier.accent,
                    border: `1px solid ${tier.accent}30`,
                  }}
                >
                  <Tag size={10} />
                  {tier.label}
                </span>
              </div>

              {/* event name pulled over banner */}
              <div
                className="px-6 pt-4 pb-5 border-b"
                style={{ borderColor: "#1f2023" }}
              >
                <h2 className="text-[16px] font-semibold text-[#f4f4f5] leading-snug">
                  {event?.name}
                </h2>
              </div>

              {/* ── details list ── */}
              <div className="px-6">
                <Detail
                  icon={Calendar}
                  label="Date"
                  value={localDate ? moment(localDate).format("dddd, MMMM D, YYYY") : "TBA"}
                />
                <Detail
                  icon={Clock}
                  label="Time"
                  value={localTime ? localTime.slice(0, 5) : "Check venue"}
                />
                <Detail
                  icon={MapPin}
                  label="Venue"
                  value={
                    event?._embedded?.venues?.[0]?.name ||
                    ticketsinfo?.ticket?.ticketId?.eventId?.locale ||
                    "TBA"
                  }
                />
                <Detail
                  icon={Hash}
                  label="Order #"
                  value={orderNo || "—"}
                />
                <Detail
                  icon={Tag}
                  label="Ticket ID"
                  value={`#${parseInt(ticketId?.slice(-6), 16)}`}
                />
              </div>

              {/* ── tear line ── */}
              <div className="relative flex items-center px-0 my-1">
                <div className="w-4 h-4 rounded-full -ml-2 bg-[#0c0d0e] shrink-0" />
                <div
                  className="flex-1 border-t border-dashed"
                  style={{ borderColor: "#1f2023" }}
                />
                <div className="w-4 h-4 rounded-full -mr-2 bg-[#0c0d0e] shrink-0" />
              </div>

              {/* ── QR section ── */}
              <div className="px-6 py-6 flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-white inline-block shadow-lg">
                  <img
                    src="/qr-code.png"
                    className="w-28 h-28"
                    alt="Entry QR Code"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-widest">
                    Scan at entry
                  </p>
                  <p className="text-[10px] text-[#4b4d52] mt-0.5">
                    Present this code to venue staff
                  </p>
                </div>
              </div>

              {/* ── footer ── */}
              <div
                className="px-6 py-4 border-t flex items-center justify-between"
                style={{ borderColor: "#1f2023", background: "#0f1011" }}
              >
                <div className="flex items-center gap-2 text-[11px] text-[#4b4d52] font-medium">
                  <ShieldCheck size={12} className="text-[#4b4d52]" />
                  Secured by Paysso
                </div>
                <p className="text-[10px] text-[#4b4d52]">
                  #{ticketId?.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* ── download button ── */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[13px] font-semibold text-black bg-[#FF7A00] hover:bg-[#ff8f1f] transition-colors"
            >
              <Download size={15} />
              Download Ticket
            </motion.button>

            <p className="text-center text-[11px] text-[#4b4d52] mt-6">
              &copy; 2026 Paysso. All rights reserved.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ViewTicket;
