import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useService } from "../src/Context/ServiceContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  XCircle,
  ImageOff,
} from "lucide-react";
import moment from "moment";
import {
  AdminViewTicketSkeleton,
  getTicketTheme,
  TicketTypeIcon,
  TicketThemeBadge,
} from "@/components/Reusable";
import api from "../src/Context/api/api.config";

// ─── Visual helpers ───

function Barcode() {
  const bars = [
    3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1, 2, 4, 1, 2, 1, 3, 1,
    2, 3, 1, 2, 1,
  ];
  let x = 0;
  const rects = [];
  bars.forEach((w, i) => {
    if (i % 2 === 0)
      rects.push(
        <rect
          key={i}
          x={x}
          y={0}
          width={w * 3}
          height={52}
          fill="currentColor"
        />,
      );
    x += w * 3;
  });
  return (
    <svg
      viewBox={`0 0 ${x} 52`}
      className="w-full h-14"
      preserveAspectRatio="none"
    >
      {rects}
    </svg>
  );
}

function Perforation({ vertical = false }) {
  return (
    <div
      className={`flex ${
        vertical ? "flex-col h-full" : "flex-row w-full"
      } items-center gap-[5px]`}
    >
      {Array.from({ length: vertical ? 28 : 42 }).map((_, i) => (
        <div
          key={i}
          className="w-[5px] h-[5px] rounded-full shrink-0"
          style={{ background: "rgba(249,115,22,0.20)" }}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status.toLowerCase();
  if (s === "paid")
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-md"
        style={{
          background: "#d1fae5",
          color: "#065f46",
          border: "1px solid #a7f3d0",
        }}
      >
        <CheckCircle2 size={11} /> Settled
      </span>
    );
  if (s === "cancelled")
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-md"
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
        }}
      >
        <XCircle size={11} /> Cancelled
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-md"
      style={{
        background: "#fef3c7",
        color: "#c2410c",
        border: "1px solid #fcd34d",
      }}
    >
      <Loader2 size={11} className="animate-spin" /> Pending
    </span>
  );
}

function Field({ label, value, mono = false, span = false }) {
  return (
    <div className={span ? "col-span-2" : undefined}>
      <p
        className="text-[9px] font-black uppercase tracking-[0.2em] mb-1"
        style={{ color: "rgba(249,115,22,0.55)" }}
      >
        {label}
      </p>
      <p
        className={`font-bold text-[#1a1208] leading-snug ${
          mono ? "break-all" : ""
        }`}
        style={{
          fontSize: mono ? 11 : 13,
          fontFamily: mono ? "monospace" : undefined,
        }}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

// ─── Event Image Panel ───
function EventImagePanel({ pictures, eventName, eventType, apiUrl }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const images = (pictures || []).map((p) =>
    p.startsWith("http") ? p : `${apiUrl}/${p}`,
  );

  const hasImages = images.length > 0;

  return (
    <div className="flex flex-col gap-3 w-full sm:w-56 shrink-0">
      {/* Main image card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          aspectRatio: "3/4",
          background: "#1a1208",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}
      >
        {hasImages ? (
          <motion.img
            key={activeIdx}
            src={images[activeIdx]}
            alt={eventName}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ color: "rgba(249,115,22,0.30)" }}
          >
            <ImageOff size={32} />
            <p className="text-[9px] font-black uppercase tracking-widest">
              No image
            </p>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 45%, transparent 100%)",
          }}
        />

        {/* Bottom overlay: type badge + event name */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {eventType && (
            <span
              className="inline-block text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded mb-2"
              style={{ background: "#ea580c", color: "#fff" }}
            >
              {eventType}
            </span>
          )}
          <p className="text-white font-black text-sm leading-tight">
            {eventName || "—"}
          </p>
        </div>

        {/* Image counter pill — top right */}
        {images.length > 1 && (
          <div
            className="absolute top-3 right-3 text-[8px] font-black px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(0,0,0,0.50)",
              color: "rgba(255,255,255,0.80)",
            }}
          >
            {activeIdx + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className="rounded-xl overflow-hidden shrink-0 transition-all"
              style={{
                width: 52,
                height: 52,
                border:
                  i === activeIdx
                    ? "2px solid #f97316"
                    : "2px solid transparent",
                opacity: i === activeIdx ? 1 : 0.55,
                padding: 0,
                background: "none",
                cursor: "pointer",
              }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}

          {/* Empty placeholder slots (up to 3 total shown) */}
          {Array.from({ length: Math.max(0, 3 - images.length) }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="rounded-xl shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  border: "2px dashed rgba(249,115,22,0.20)",
                  background: "rgba(249,115,22,0.04)",
                }}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

const AdminViewTicket = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useService();

  const {
    data: transaction,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminTransaction", orderId],
    queryFn: async () => {
      const res = await api.get(`/api/auth/admin/analytics/transactions/${orderId}`);
      return res.data.transaction;
    },
    enabled: !!orderId,
    retry: false,
  });

  const ticket = transaction?.ticketId;
  const event = ticket?.eventId;
  const status = transaction?.status?.toLowerCase() || "pending";
  const commission =
    transaction?.commissionAmount ?? (transaction?.totalAmount ?? 0) * 0.1;
  const ticketType = ticket?.name || "standard";
  const theme = getTicketTheme(ticketType);

  const accentColor = "#ea6c0a";
  const orangeBandGradient =
    "linear-gradient(135deg, #f97316 0%, #ea580c 100%)";

  return (
    <div
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(249,115,22,0.07) 1px, transparent 0)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="w-full max-w-5xl mx-auto pb-20 space-y-6">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors bg-transparent border-none cursor-pointer group"
          style={{ color: "rgba(249,115,22,0.55)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(249,115,22,0.55)")
          }
        >
          <ArrowLeft
            size={13}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to tickets table
        </motion.button>

        {/* Page header */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl uppercase tracking-tighter text-orange-400 leading-none">
              Order{" "}
              <span className="text-white">
                #{transaction?.orderNo || orderId?.slice(-8).toUpperCase()}
              </span>
            </h1>
            <div
              className="w-10 h-[3px] mt-2 rounded-full"
              style={{ background: "#f97316" }}
            />
          </div>
          {!isLoading && !isError && <StatusBadge status={status} />}
        </div>

        {/* Loading */}
        {isLoading && <AdminViewTicketSkeleton />}

        {/* Error */}
        {isError && (
          <div
            className="bg-[#fdf6e3] rounded-2xl p-8 text-center"
            style={{ border: "1px solid rgba(249,115,22,0.12)" }}
          >
            <p className="text-base text-white font-bold mb-2">
              Order not found
            </p>
            <p className="text-sm" style={{ color: "rgba(249,115,22,0.55)" }}>
              {getFriendlyErrorMessage(error)}
            </p>
          </div>
        )}

        {/* ═══ CONTENT: Image panel + Ticket ═══ */}
        {!isLoading && !isError && transaction && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col md:flex-row gap-6 items-start"
          >
            {/* ── Left: Event image panel ── */}
            <EventImagePanel
              pictures={event?.pictures}
              eventName={event?.name}
              eventType={event?.type}
              apiUrl={API_URL}
            />

            {/* ── Right: Ticket + security strip ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-5 w-full">

              {/* ── MOBILE CARD LAYOUT (shown below md) ── */}
              <div className="md:hidden space-y-4">
                {/* Ticket header card */}
                <div
                  className={`${theme.bgColor} rounded-2xl overflow-hidden`}
                  style={{ border: "2px solid rgba(249,115,22,0.12)" }}
                >
                  {/* Orange band */}
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{ background: orangeBandGradient }}
                  >
                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
                      {theme.label} Ticket
                    </span>
                    <TicketTypeIcon type={ticketType} size={14} />
                  </div>

                  {/* Event info */}
                  <div className="p-5 space-y-4">
                    <div>
                      <p
                        className="text-[9px] font-black uppercase tracking-[0.25em] mb-1"
                        style={{ color: "rgba(249,115,22,0.60)" }}
                      >
                        {event?.type ? `${event.type.toUpperCase()} · ` : ""}
                        {event?.links?.venues?.city || "Addis Ababa"}
                      </p>
                      <h2 className="text-xl font-black uppercase tracking-tight text-[#1a1208] leading-tight">
                        {event?.name || "—"}
                      </h2>
                      <div
                        className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-bold"
                        style={{ color: "rgba(249,115,22,0.65)" }}
                      >
                        {event?.dates?.start?.localDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {event.dates.start.localDate}
                          </span>
                        )}
                        {event?.dates?.start?.localTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {event.dates.start.localTime}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {event?.links?.venues?.city || "Addis Ababa"}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: "2px dashed rgba(249,115,22,0.12)" }} />

                    {/* Fields */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <Field label="Order number" value={transaction.orderNo} />
                      <Field label="Payment method" value="Chapa Gateway" />
                      <Field label="Ticket tier" value={ticket?.name} />
                      <Field label="Quantity" value={`${transaction.quantity}× Tickets`} />
                      <Field
                        label="Date authorized"
                        value={moment(transaction.purchasedAt).format("MMM D, YYYY · HH:mm")}
                      />
                      <Field
                        label="Availability"
                        value={ticket ? `${ticket.availableQuantity} / ${ticket.totalQuantity} left` : "—"}
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <Field label="Transaction ID" value={transaction._id} mono />
                      <Field label="Linked user ID" value={transaction.userId} mono />
                    </div>
                  </div>

                  {/* Pricing band */}
                  <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{ borderTop: "2px dashed rgba(249,115,22,0.12)" }}
                  >
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(249,115,22,0.50)" }}>
                        Unit price
                      </p>
                      <p className="text-xl font-black text-[#1a1208]">
                        {ticket?.price?.toLocaleString() ?? "—"} <span className="text-xs font-bold" style={{ color: "rgba(249,115,22,0.45)" }}>ETB</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(249,115,22,0.50)" }}>
                        Total settled
                      </p>
                      <p className="text-2xl font-black" style={{ color: accentColor }}>
                        {transaction.totalAmount?.toLocaleString()} <span className="text-xs font-bold" style={{ color: "rgba(249,115,22,0.45)" }}>ETB</span>
                      </p>
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="px-5 pb-4" style={{ color: "rgba(249,115,22,0.50)" }}>
                    <Barcode />
                    <p className="text-center text-[8px] font-mono font-bold tracking-widest mt-1" style={{ color: "rgba(249,115,22,0.40)" }}>
                      {(transaction._id ?? "").slice(-12).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── DESKTOP TICKET LAYOUT (shown at md+) ── */}
              <div className="hidden md:block">
                <div className="flex shadow-[0_8px_40px_rgba(0,0,0,0.15)]">
                  {/* Spine */}
                  <div
                    className="w-10 rounded-l-2xl flex flex-col items-center justify-center py-6 shrink-0"
                    style={{ background: orangeBandGradient }}
                  >
                    <span
                      className="text-white text-[9px] font-black uppercase tracking-[0.3em] select-none"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                    >
                      {theme.label} Ticket
                    </span>
                  </div>

                  {/* Body */}
                  <div
                    className={`flex-1 ${theme.bgColor} relative`}
                    style={{
                      borderTop: "4px solid rgba(249,115,22,0.12)",
                      borderBottom: "4px solid rgba(249,115,22,0.12)",
                    }}
                  >
                    {/* Notch circles */}
                    <div
                      className="absolute -top-4 left-[68%] -translate-x-1/2 w-8 h-8 rounded-full z-10"
                      style={{
                        background: "#f5ede1",
                        border: "2px solid rgba(249,115,22,0.12)",
                      }}
                    />
                    <div
                      className="absolute -bottom-4 left-[68%] -translate-x-1/2 w-8 h-8 rounded-full z-10"
                      style={{
                        background: "#f5ede1",
                        border: "2px solid rgba(249,115,22,0.12)",
                      }}
                    />

                    <div className="flex h-full">
                      {/* Left content */}
                      <div className="flex-1 p-8 pr-6">
                        {/* Event header */}
                        <div
                          className="mb-6 pb-5"
                          style={{
                            borderBottom: "2px dashed rgba(249,115,22,0.12)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <p
                              className="text-[9px] font-black uppercase tracking-[0.25em] mb-1.5"
                              style={{ color: "rgba(249,115,22,0.60)" }}
                            >
                              {event?.type
                                ? `${event.type.toUpperCase()} · `
                                : ""}
                              {event?.links?.venues?.city || "Addis Ababa"}
                            </p>
                            <TicketTypeIcon type={ticketType} size={14} />
                          </div>
                          <h2 className="text-2xl font-black uppercase tracking-tight text-[#1a1208] leading-tight mb-2">
                            {event?.name || "—"}
                          </h2>
                          <div
                            className="flex flex-wrap items-center gap-4 text-[11px] font-bold"
                            style={{ color: "rgba(249,115,22,0.65)" }}
                          >
                            {event?.dates?.start?.localDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} />{" "}
                                {event.dates.start.localDate}
                              </span>
                            )}
                            {event?.dates?.start?.localTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> {event.dates.start.localTime}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin size={11} />{" "}
                              {event?.links?.venues?.city || "Addis Ababa"}
                            </span>
                          </div>
                        </div>

                        {/* Fields grid */}
                        <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                          <Field
                            label="Order number"
                            value={transaction.orderNo}
                          />
                          <Field label="Payment method" value="Chapa Gateway" />
                          <Field label="Ticket tier" value={ticket?.name} />
                          <Field
                            label="Quantity"
                            value={`${transaction.quantity}× Tickets`}
                          />
                          <Field
                            label="Date authorized"
                            value={moment(transaction.purchasedAt).format(
                              "MMM D, YYYY · HH:mm",
                            )}
                          />
                          <Field
                            label="Availability"
                            value={
                              ticket
                                ? `${ticket.availableQuantity} / ${ticket.totalQuantity} remaining`
                                : "—"
                            }
                          />
                          <Field
                            label="Transaction ID"
                            value={transaction._id}
                            mono
                            span
                          />
                          <Field
                            label="Linked user ID"
                            value={transaction.userId}
                            mono
                            span
                          />
                        </div>
                      </div>

                      {/* Perforation divider */}
                      <div className="relative flex items-center">
                        <div
                          className="absolute inset-y-0 left-1/2"
                          style={{
                            borderLeft: "2px dashed rgba(249,115,22,0.18)",
                          }}
                        />
                        <div className="relative z-10 px-1">
                          <Perforation vertical />
                        </div>
                      </div>

                      {/* Stub */}
                      <div
                        className={`w-52 shrink-0 p-6 flex flex-col items-center justify-between ${theme.bgColor}`}
                      >
                        {/* Tier */}
                        <div className="text-center w-full">
                          <p
                            className="text-[8px] font-black uppercase tracking-[0.2em] mb-2"
                            style={{ color: "rgba(249,115,22,0.50)" }}
                          >
                            Ticket class
                          </p>
                          <TicketThemeBadge
                            type={ticketType}
                            className="text-xs"
                          />
                          <p
                            className="text-[9px] font-bold uppercase tracking-widest mt-1"
                            style={{ color: "rgba(249,115,22,0.50)" }}
                          >
                            {event?.dates?.status?.code || "—"}
                          </p>
                        </div>

                        {/* Pricing */}
                        <div className="text-center w-full">
                          <p
                            className="text-[8px] font-black uppercase tracking-[0.2em] mb-1"
                            style={{ color: "rgba(249,115,22,0.50)" }}
                          >
                            Unit price
                          </p>
                          <p className="text-2xl font-black text-[#1a1208]">
                            {ticket?.price?.toLocaleString() ?? "—"}
                          </p>
                          <p
                            className="text-[10px] font-black uppercase tracking-widest"
                            style={{ color: "rgba(249,115,22,0.45)" }}
                          >
                            ETB / ticket
                          </p>
                          <div
                            className="w-full my-3"
                            style={{
                              borderTop: "1px dashed rgba(249,115,22,0.18)",
                            }}
                          />
                          <p
                            className="text-[8px] font-black uppercase tracking-[0.2em] mb-1"
                            style={{ color: "rgba(249,115,22,0.50)" }}
                          >
                            Total settled
                          </p>
                          <p
                            className="text-3xl font-black"
                            style={{ color: accentColor }}
                          >
                            {transaction.totalAmount?.toLocaleString()}
                          </p>
                          <p
                            className="text-[10px] font-black uppercase tracking-widest"
                            style={{ color: "rgba(249,115,22,0.45)" }}
                          >
                            ETB
                          </p>
                          <p
                            className="text-[8px] font-black uppercase tracking-widest mt-2"
                            style={{ color: "rgba(249,115,22,0.40)" }}
                          >
                            Commission ~{commission?.toLocaleString()} ETB
                          </p>
                        </div>

                        {/* Barcode */}
                        <div
                          className="w-full"
                          style={{ color: "rgba(249,115,22,0.50)" }}
                        >
                          <Barcode />
                          <p
                            className="text-center text-[8px] font-mono font-bold tracking-widest mt-1"
                            style={{ color: "rgba(249,115,22,0.40)" }}
                          >
                            {(transaction._id ?? "").slice(-12).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right edge */}
                  <div
                    className={`w-10 ${theme.bgColor} rounded-r-2xl flex flex-col items-center justify-center py-4`}
                    style={{
                      borderTop: "4px solid rgba(249,115,22,0.10)",
                      borderBottom: "4px solid rgba(249,115,22,0.10)",
                    }}
                  >
                    <Perforation vertical />
                  </div>
                </div>
              </div>

              {/* Security strip */}
              <div
                className="rounded-xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2"
                style={{ background: orangeBandGradient }}
              >
                <div
                  className="flex items-center gap-2"
                  style={{ color: "rgba(255,255,255,0.90)" }}
                >
                  <ShieldCheck size={14} className="shrink-0" />
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em]">
                    Tamper-evident audit logging
                  </span>
                </div>
                <span
                  className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em]"
                  style={{ color: "rgba(255,255,255,0.50)" }}
                >
                  {new Date().toISOString().split("T")[0]}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminViewTicket;
