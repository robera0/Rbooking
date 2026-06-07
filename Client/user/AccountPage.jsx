import React from "react";
import { Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoginUser from "./LoginUser";
import SignUp from "./SignUp";

/* ── ambient orb ── */
const Orb = ({ className }) => (
  <div
    className={`absolute rounded-full blur-[130px] pointer-events-none ${className}`}
  />
);

const AccountPage = ({ pa, mode = "login" }) => {
  const navigate = useNavigate();

  const ContentComponent = mode === "login" ? LoginUser : SignUp;

  return (
    <div className="relative min-h-screen bg-[#121417] text-[#F4F4F5] antialiased overflow-hidden font-sans selection:bg-[#FF7A00]/30">
      {/* ── AMBIENT ORBS ── */}
      <Orb className="w-[600px] h-[600px] top-[-200px] left-[-200px] bg-[#FF7A00]/[0.08]" />
      <Orb className="w-[500px] h-[500px] bottom-[-150px] right-[-150px] bg-purple-700/[0.06]" />
      <Orb className="w-[300px] h-[300px] top-[40%] left-[35%] bg-amber-400/[0.03]" />

      {/* ── TOP RIBBON ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] flex z-10">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
          className="h-full w-[35%] bg-gradient-to-r from-[#FF7A00] to-amber-300"
        />
        <div className="h-full flex-1 bg-white/[0.03]" />
      </div>

      {/* ── SCAN-LINES TEXTURE ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 6px)",
        }}
      />

      {/* ===== MOBILE LAYOUT — clean full-screen like reference ===== */}
      <div className="relative z-10 lg:hidden flex flex-col min-h-screen px-6 pt-12 pb-8">
        {/* top bar: back + help */}
        <div className="flex items-center justify-between mb-10">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]"
          >
            <ArrowLeft size={18} className="text-white" />
          </motion.button>
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]"
          >
            <HelpCircle size={18} className="text-white/50" />
          </motion.button>
        </div>

        {/* content — renders LoginUser or SignUp directly */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 overflow-y-auto"
        >
          <ContentComponent />
        </motion.div>
      </div>

      {/* ===== DESKTOP LAYOUT (unchanged) ===== */}
      <div className="relative z-10 hidden lg:flex items-center justify-center min-h-screen px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full max-w-5xl min-h-[660px] rounded-[2.5rem] overflow-hidden border border-white/[0.07] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          style={{
            background:
              "linear-gradient(160deg,rgba(20,20,22,0.95) 0%,rgba(14,14,16,0.98) 100%)",
            backdropFilter: "blur(40px)",
          }}
        >
          {/* ── LEFT: BRAND PANEL ── */}
          <div className="w-[45%] p-16 flex flex-col justify-between border-r border-white/[0.05] relative overflow-hidden">
            {/* background video with zoom effect */}
            <motion.video
              src="/Screencast From 2026-04-24 05-03-04.mp4"
              autoPlay
              loop
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale blur-[2px]"
            />

            {/* dark overlay for text contrast */}
            <div className="absolute inset-0 bg-black/40" />

            {/* inner orb */}
            <div className="absolute w-72 h-72 rounded-full bg-[#FF7A00]/[0.1] blur-[80px] -bottom-16 -left-16 pointer-events-none z-10" />

            <div className="relative z-10 space-y-10 my-auto">
              {/* logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="flex items-center gap-4"
              >
                <div className="bg-[#FF7A00] p-3.5 rounded-2xl shadow-xl shadow-[#FF7A00]/25">
                  <Ticket className="text-black w-9 h-9 rotate-[-12deg]" />
                </div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                  PAYSSO
                </h1>
              </motion.div>

              {/* headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="text-4xl font-black uppercase tracking-tight text-white leading-[1.15] max-w-xs"
              >
                {pa || (
                  <>
                    Access the{" "}
                    <span className="text-[#FF7A00]">exclusive pulse</span> of
                    the night.
                  </>
                )}
              </motion.h2>

              {/* decorative stat row */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="flex gap-6"
              >
                {[
                  { val: "50K+", label: "Events" },
                  { val: "1M+", label: "Tickets Sold" },
                  { val: "4.9★", label: "Rating" },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p className="text-lg font-black text-white">{val}</p>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.35em]">
                      {label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="relative z-10 text-gray-700 text-[9px] font-black uppercase tracking-[0.4em]">
              &copy; 2026 PAYSSO INTERACTIVE.
            </div>
          </div>

          {/* ── RIGHT: FORM PANEL ── */}
          <div className="w-[55%] p-14 flex flex-col justify-center relative overflow-hidden">
            {/* subtle inner highlight */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#FF7A00]/[0.03] blur-[60px] pointer-events-none" />

            <div className="relative z-10">
              <ContentComponent />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountPage;
