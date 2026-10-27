import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import moment from "moment";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Crown,
  Download,
  Hash,
  MapPin,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";

/* Where "no reservation" sends the user. Change to your real route. */
const CLUB_RSVP_PATH = "/club-rsvp";

const STORAGE_KEY = "clubRsvpReservation";
const DEFAULT_GLOW = "#FF7A00";
const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80";

const label = "text-[10px] text-gray-400 font-black uppercase tracking-widest";

const readReservation = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/* Label / value tile used in the stub */
const Detail = ({ icon: Icon, name, value }) => (
  <div className="rounded-2xl border border-[#1f2023] bg-[#0a0b0c] p-4 min-w-0">
    <Icon size={14} className="text-[#FF7A00]" />
    <p className={`${label} mt-3`}>{name}</p>
    <p className="mt-1 text-[15px] font-black text-white truncate">{value}</p>
  </div>
);

const ViewClubTicket = () => {
  const navigate = useNavigate();
  const reservation = useMemo(readReservation, []);
  const [qr, setQr] = useState("");

  const glow = reservation?.glow || DEFAULT_GLOW;
  const cover = reservation?.cover || DEFAULT_COVER;

  /* Build the QR on the client from the saved reservation. */
  useEffect(() => {
    if (!reservation) return;
    let cancelled = false;

    QRCode.toDataURL(
      JSON.stringify({
        type: "club-rsvp",
        id: reservation.id,
        club: reservation.club,
        table: reservation.table,
        date: reservation.date,
      }),
      {
        width: 600,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      },
    )
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch((err) => console.error("QR error:", err));

    return () => {
      cancelled = true;
    };
  }, [reservation]);

  const downloadQR = () => {
    if (!qr) return;
    const link = document.createElement("a");
    link.href = qr;
    link.download = `Club-QR-${reservation?.table || "table"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const status = (reservation?.status || "pending").toUpperCase();
  const isPaid = reservation?.status === "paid";

  return (
    <div className="min-h-screen bg-[#0a0b0c] text-[#f4f4f5] antialiased">
      {/* Ambient venue glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px] opacity-30"
        style={{
          background: `radial-gradient(60% 100% at 50% 0%, ${glow}55 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-lg md:max-w-3xl px-5 pt-8 pb-24">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6b7280] hover:text-[#f4f4f5] transition-colors mb-8 group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          My Tickets
        </motion.button>

        {/* Empty state */}
        {!reservation && (
          <div className="rounded-3xl bg-[#111214] border border-[#1f2023] p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF7A00]/10">
              <Ticket size={20} className="text-[#FF7A00]" />
            </div>
            <p className="text-[15px] font-bold">No club reservation yet</p>
            <p className="mt-1 text-[12px] text-[#6b7280]">
              Reserve a table and your pass will show up here.
            </p>
            <button
              type="button"
              onClick={() => navigate(CLUB_RSVP_PATH)}
              className="mt-6 rounded-2xl bg-[#FF7A00] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black hover:bg-[#ff8f1f] transition-colors"
            >
              Reserve a table
            </button>
          </div>
        )}

        {reservation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Title */}
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#FF7A00]">
                Club RSVP
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-black uppercase tracking-[-0.04em]">
                Your <span className="text-[#FF7A00]">reservation</span>
              </h1>
              <p className="mt-1 text-[13px] text-[#6b7280]">
                Show this pass at the door and a host will take you to your
                table.
              </p>
            </div>

            {/* ── MAIN TICKET ── */}
            <div className="rounded-3xl bg-[#111214] border border-[#1f2023] overflow-hidden flex flex-col md:flex-row">
              {/* Left: banner + details */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="relative h-40 md:h-52 overflow-hidden">
                  <img
                    src={cover}
                    alt={reservation.club}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-[#111214]/40 to-transparent" />

                  {/* Pass badge */}
                  <span
                    className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm"
                    style={{
                      background: `${glow}22`,
                      color: glow,
                      border: `1px solid ${glow}40`,
                    }}
                  >
                    <Crown size={11} />
                    {reservation.pass || "VIP"}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm ${
                      isPaid
                        ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                        : "border border-yellow-400/30 bg-yellow-500/10 text-yellow-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isPaid ? "bg-emerald-400" : "bg-yellow-400"
                      }`}
                    />
                    {status}
                  </span>
                </div>

                <div className="px-6 pt-4 pb-5 border-b border-[#1f2023]">
                  <h2 className="text-2xl font-black uppercase tracking-[-0.03em] leading-tight truncate">
                    {reservation.club}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#6b7280]">
                    <MapPin size={12} />
                    {reservation.venue
                      ? `${reservation.venue}, Addis Ababa`
                      : "Venue TBA"}
                  </p>
                </div>

                <div className="p-6 grid grid-cols-2 gap-3">
                  <Detail
                    icon={Calendar}
                    name="Date"
                    value={
                      reservation.date
                        ? moment(reservation.date).format("ddd, MMM D, YYYY")
                        : "TBA"
                    }
                  />
                  <Detail
                    icon={Clock}
                    name="Arrival time"
                    value={reservation.arrivalTime || "Check opening hours"}
                  />
                  <Detail
                    icon={Sparkles}
                    name="Table"
                    value={`Table ${reservation.table || "—"}`}
                  />
                  <Detail
                    icon={Users}
                    name="Guests"
                    value={reservation.guests ?? "—"}
                  />
                  <Detail
                    icon={Wallet}
                    name="Total paid"
                    value={reservation.total || "—"}
                  />
                </div>

                <div className="mx-6 mb-6 rounded-2xl border border-[#FF7A00]/10 bg-[#FF7A00]/[0.04] px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF7A00]">
                    Priority note
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#9ca3af]">
                    Your table is held for 30 minutes after check-in. Arrive 45
                    minutes before your slot and bring a valid ID.
                  </p>
                </div>
              </div>

              {/* Tear line */}
              <div className="relative border-t md:border-t-0 md:border-l border-dashed border-[#1f2023]">
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0b0c]" />
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0b0c] md:hidden" />
                <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0b0c] hidden md:block" />
              </div>

              {/* Right: QR + footer */}
              <div className="flex flex-col md:w-72 bg-[#0d0e10] shrink-0">
                <div className="px-6 py-6 flex flex-1 flex-col items-center justify-center gap-4">
                  <div
                    className="rounded-2xl bg-white p-4 md:p-5 shadow-2xl"
                    style={{ boxShadow: `0 20px 50px ${glow}22` }}
                  >
                    {qr ? (
                      <img
                        src={qr}
                        alt="Reservation QR code"
                        className="h-32 w-32 md:h-40 md:w-40 object-contain"
                      />
                    ) : (
                      <div className="h-32 w-32 md:h-40 md:w-40 animate-pulse rounded-lg bg-gray-200" />
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#6b7280]">
                      Scan at the door
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#4b4d52]">
                      Present this code to club staff
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={downloadQR}
                    disabled={!qr}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF7A00] hover:text-white transition-colors disabled:opacity-40"
                  >
                    <Download size={12} />
                    Download QR Code
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#1f2023] px-6 py-4">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-[#4b4d52]">
                    <ShieldCheck size={12} />
                    Secured by Paysso
                  </div>
                  <p className="flex items-center gap-1 text-[10px] text-[#4b4d52] font-mono">
                    <Hash size={10} />
                    {String(reservation.id || "")
                      .slice(-6)
                      .toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.print()}
              className="mt-4 w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#FF7A00] py-4 text-[12px] font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[#FF7A00]/10 hover:bg-[#ff8f1f] transition-colors"
            >
              <Download size={15} strokeWidth={2.5} />
              Download Ticket
            </motion.button>

            <p className="mt-6 text-center text-[11px] text-[#4b4d52]">
              &copy; 2026 Paysso. All rights reserved.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ViewClubTicket;
