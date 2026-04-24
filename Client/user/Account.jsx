import React from "react";
import { LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { useService } from "@/Context/ServiceContext";

const Account = ({ children }) => {
  const { setMenuOpen } = useService();

  return (
    <div className="relative min-h-screen">
      {/* ── Subtle top-right menu trigger (doesn't compete with content) ── */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-[#f4f4f5] bg-[#FF7A00] shadow-lg shadow-[#FF7A00]/20 hover:bg-[#ff8f1f] transition-colors"
        >
          <LayoutGrid size={14} />
          Menu
        </motion.button>
      </div>

      {/* Desktop sidebar trigger — subtle ghost button */}
      <div className="hidden lg:flex fixed top-4 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-medium text-[#9ca3af] bg-[#18191c] border border-[#262729] hover:border-[#35373b] hover:text-[#f4f4f5] transition-all"
        >
          <LayoutGrid size={13} />
          Menu
        </motion.button>
      </div>

      <div className="w-full">{children}</div>
    </div>
  );
};

export default Account;
