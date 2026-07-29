import React, { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Ticket,
  CheckCircle,
  XCircle,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Fingerprint,
} from "lucide-react";
import { useService } from "@/Context/ServiceContext";
import toast from "react-hot-toast";

/* ── Ambient orb decoration ── */
const Orb = ({ className }) => (
  <div
    className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`}
  />
);

/* ── Animated barcode strip ── */
const Barcode = ({ color = "#FF7A00" }) => (
  <div className="flex items-end gap-[2px] h-8 opacity-50">
    {Array.from({ length: 22 }).map((_, i) => (
      <div
        key={i}
        className="rounded-sm"
        style={{
          backgroundColor: color,
          width: i % 3 === 0 ? "3px" : "1.5px",
          height: `${40 + (i % 5) * 12}%`,
        }}
      />
    ))}
  </div>
);

/* ── Particle burst on success ── */
const Particles = () =>
  Array.from({ length: 14 }).map((_, i) => {
    const angle = (i / 14) * 360;
    const distance = 60 + Math.random() * 80;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    const colors = ["#FF7A00", "#FACC15", "#34D399", "#60A5FA", "#F472B6"];
    return (
      <motion.div
        key={i}
        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
        animate={{ x, y, opacity: 0, scale: 0 }}
        transition={{ duration: 0.8, delay: i * 0.03, ease: "easeOut" }}
        className="absolute w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: colors[i % colors.length],
          left: "50%",
          top: "50%",
          marginLeft: -5,
          marginTop: -5,
        }}
      />
    );
  });

const VerifyTicket = () => {
  const { userTicketId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { API_URL } = useService();

  // Pull data passed from the CheckoutModal via router state
  const { orderNo, eventName, totalAmount, quantity } =
    location.state || {};

  const [code, setCode] = useState(orderNo || "");
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  const handleCopyCode = () => {
    if (orderNo) {
      navigator.clipboard.writeText(orderNo);
      toast.success("Order code copied!");
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      toast.error("Please enter your verification code");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(
        `${API_URL}/api/auth/ticket/${userTicketId}/verify`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNo: code.trim() }),
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Verification failed");

      setConfirmedTicket(data.userTicket);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  /* ────────────── SUCCESS STATE ────────────── */
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#121417] text-[#F4F4F5] flex items-center justify-center p-6 relative overflow-hidden">
        <Orb className="w-[500px] h-[500px] top-[-180px] left-[-180px] bg-emerald-500/[0.07]" />
        <Orb className="w-[400px] h-[400px] bottom-[-120px] right-[-120px] bg-[#FF7A00]/[0.06]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px] space-y-6"
        >
          {/* Confetti icon */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <AnimatePresence>
                <Particles />
              </AnimatePresence>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.1 }}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30"
              >
                <CheckCircle size={44} className="text-emerald-400" />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-2"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
              Ticket Confirmed
            </p>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              You&rsquo;re In!
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {eventName || "Your event ticket has been verified"}
            </p>
          </motion.div>

          {/* Ticket card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl"
            style={{ background: "linear-gradient(160deg, #141416 0%, #0e0e10 100%)" }}
          >
            {/* Green band */}
            <div
              className="relative px-8 pt-7 pb-6 overflow-hidden"
              style={{
                background: "linear-gradient(120deg, #10B981 0%, #34D399 60%, #6EE7B7 100%)",
              }}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.45em] text-black/60 mb-1">
                    Paysso · Verified Ticket
                  </p>
                  <h2 className="text-xl font-black uppercase tracking-tight text-black leading-tight">
                    {eventName || "Event Ticket"}
                  </h2>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-black/15 flex items-center justify-center shrink-0">
                  <Ticket size={22} className="text-black/70" />
                </div>
              </div>
            </div>

            {/* Tear line */}
            <div className="relative flex items-center">
              <div className="w-5 h-5 rounded-full -ml-2.5 bg-[#080809] shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-white/[0.07]" />
              <div className="w-5 h-5 rounded-full -mr-2.5 bg-[#080809] shrink-0" />
            </div>

            {/* Body */}
            <div className="px-8 py-6 space-y-4">
              {[
                {
                  label: "Order No",
                  value: confirmedTicket?.orderNo || orderNo || "—",
                },
                { label: "Qty", value: confirmedTicket?.quantity ?? quantity ?? "—" },
                {
                  label: "Amount Paid",
                  value: `${(confirmedTicket?.totalAmount ?? totalAmount ?? 0).toLocaleString()} ETB`,
                },
                { label: "Status", value: "✓ PAID & VERIFIED" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between py-2 border-b border-white/[0.04]"
                >
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    {label}
                  </span>
                  <span
                    className={`text-[11px] font-bold ${
                      label === "Status" ? "text-emerald-400" : "text-gray-300"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Barcode stub */}
            <div className="relative">
              <div className="relative flex items-center">
                <div className="w-5 h-5 rounded-full -ml-2.5 bg-[#080809] shrink-0" />
                <div className="flex-1 border-t-2 border-dashed border-white/[0.07]" />
                <div className="w-5 h-5 rounded-full -mr-2.5 bg-[#080809] shrink-0" />
              </div>
              <div className="px-8 py-5 flex items-center justify-between">
                <Barcode color="#10B981" />
                <p className="text-[9px] font-black text-gray-500 tracking-widest">
                  #{userTicketId?.slice(-8)?.toUpperCase()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3"
          >
            <Link
              to="/tickets_home"
              className="flex-1 py-4 text-center bg-[#FF7A00] text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white transition-colors"
            >
              View My Tickets
            </Link>
            <Link
              to="/"
              className="flex-1 py-4 text-center bg-white/[0.03] border border-white/10 text-gray-400 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white/[0.06] transition-colors"
            >
              Explore Events
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ────────────── MAIN / ERROR STATE ────────────── */
  return (
    <div className="min-h-screen bg-[#121417] text-[#F4F4F5] flex items-center justify-center p-6 relative overflow-hidden">
      <Orb className="w-[600px] h-[600px] top-[-220px] left-[-220px] bg-[#FF7A00]/[0.06]" />
      <Orb className="w-[400px] h-[400px] bottom-[-150px] right-[-150px] bg-purple-600/[0.04]" />

      {/* Top ribbon */}
      <div className="absolute top-0 left-0 right-0 h-[2px] flex">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
          className="h-full w-[40%] bg-gradient-to-r from-[#FF7A00] to-amber-300"
        />
        <div className="h-full flex-1 bg-white/[0.03]" />
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
      >
        <ArrowLeft size={14} />
        Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[460px] space-y-6"
      >
        {/* Page header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 mb-4"
          >
            <ShieldCheck size={28} className="text-[#FF7A00]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <Fingerprint size={12} className="text-[#FF7A00]" />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.45em]">
              ID — {userTicketId?.slice(-14)?.toUpperCase()}
            </span>
          </motion.div>

          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Verify Ticket
          </h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            Enter the verification code from your order to confirm your ticket
          </p>
        </div>

        {/* Order code hint card */}
        {orderNo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[#FF7A00]/20 bg-[#FF7A00]/[0.04] p-5"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#FF7A00] mb-3">
              Your Order Code
            </p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[11px] text-gray-500 mb-1 font-semibold">
                  Copy this code and paste it below
                </p>
                <p className="text-lg font-black tracking-widest text-white font-mono">
                  {orderNo}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] hover:bg-[#FF7A00] hover:text-black transition-all active:scale-95"
              >
                <Copy size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Main verify card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl border border-white/[0.08] bg-[#0e0f11] p-8 space-y-6 shadow-2xl"
        >
          {/* Input field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Verification Code
            </label>
            <div className="relative">
              <input
                type={showCode ? "text" : "password"}
                placeholder="e.g. ORD-XXXXXXXXXX"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className={`w-full bg-white/[0.03] border ${
                  status === "error"
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-[#FF7A00]"
                } transition-all rounded-2xl px-5 py-4 pr-12 outline-none font-mono font-bold text-base tracking-widest`}
              />
              <button
                type="button"
                onClick={() => setShowCode((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
              >
                {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 pt-1"
                >
                  <XCircle size={13} className="text-red-400 shrink-0" />
                  <p className="text-[11px] text-red-400 font-semibold">
                    {errorMsg}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info row */}
          {eventName && (
            <div className="flex items-center justify-between py-3 border-t border-b border-white/[0.04]">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                Event
              </span>
              <span className="text-[11px] font-bold text-gray-300 text-right max-w-[200px] truncate">
                {eventName}
              </span>
            </div>
          )}

          {/* Submit button */}
          <motion.button
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.97 } : {}}
            onClick={handleVerify}
            disabled={isLoading}
            className="relative w-full py-5 rounded-2xl flex items-center justify-center gap-3 overflow-hidden font-black uppercase text-sm tracking-widest text-black disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #FF7A00 0%, #FF9D00 50%, #FF7A00 100%)",
            }}
          >
            {/* Shimmer */}
            {!isLoading && (
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
            )}
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Verify &amp; Confirm Ticket</span>
                <ChevronRight size={16} />
              </>
            )}
          </motion.button>

          {/* Trust badges */}
          <div className="flex justify-around pt-1">
            {[
              { icon: ShieldCheck, label: "Secure" },
              { icon: Ticket, label: "Official" },
              { icon: CheckCircle, label: "Instant" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon size={13} className="text-gray-700" />
                <span className="text-[7px] font-black text-gray-700 uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Barcode decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Barcode />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyTicket;
