import React from "react";
import { Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AccountPage = ({ children, pa, h = "h-[70vh]" }) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#121417] overflow-x-hidden font-sans selection:bg-[#FF7A00]/30">
      {/* Background Image Layer with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-center bg-cover opacity-40 grayscale-[0.5]"
        style={{ backgroundImage: 'url("/Login.jpg")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#121417]/60 via-[#121417]/90 to-[#121417]" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-center lg:min-h-screen lg:px-10">
        {/* ================= MOBILE HEADER ================= */}
        <div className="lg:hidden flex flex-col justify-between h-screen">
          <div className="text-white mt-12 space-y-4 p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="bg-[#FF7A00] p-2 rounded-xl shadow-lg shadow-[#FF7A00]/20">
                <Ticket className="text-white w-8 h-8 rotate-[-15deg]" />
              </div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                PAYSSO
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-gray-200"
            >
              {pa}
            </motion.p>
          </div>

          {/* MOBILE CONTENT CARD (The Drawer) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`flex flex-col w-screen ${h} bg-[#191B1D] rounded-t-[50px] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/[0.05] p-8`}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />
            <div className="overflow-y-auto pb-10">{children}</div>
          </motion.div>
        </div>

        {/* ================= DESKTOP / TABLET VIEW ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden lg:flex w-full max-w-5xl bg-[#1C1F22]/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/[0.08] overflow-hidden min-h-[650px]"
        >
          {/* Left Side: Brand/Visual Section */}
          <div className="w-1/2 p-16 flex flex-col justify-between border-r border-white/[0.05]">
            <div className="space-y-8 my-auto">
              <div className="flex items-center gap-4">
                <div className="bg-[#FF7A00] p-3 rounded-2xl shadow-xl shadow-[#FF7A00]/20">
                  <Ticket className="text-white w-10 h-10 rotate-[-15deg]" />
                </div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                  PAYSSO
                </h1>
              </div>

              {/* FIXED: Impactful H2 Header */}
              <h2 className="text-4xl  uppercase  tracking-wider text-white leading-[1.2] max-w-sm">
                {pa || (
                  <>
                    Access the{" "}
                    <span className="text-[#FF7A00]">exclusive pulse</span> of
                    the night.
                  </>
                )}
              </h2>
            </div>

            <div className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">
              &copy; 2026 PAYSSO INTERACTIVE.
            </div>
          </div>

          {/* Right Side: Content Area */}
          <div className="w-1/2 p-12 bg-black/20 flex flex-col justify-center">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountPage;
