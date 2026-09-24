import React, { useState, useCallback } from "react";
import { LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AccountSideMenu } from "@/components/Reusable";

const Account = ({ children }) => {
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [isMinimalMenu, setIsMinimalMenu] = useState(false);

  const openMenu = useCallback((minimal = false) => {
    setIsMinimalMenu(minimal);
    setActiveOverlay("menu");
  }, []);

  const closeOverlay = useCallback(() => setActiveOverlay(null), []);

  return (
    <div className="relative min-h-screen">
      {/* Mobile floating button */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={(e) => {
            e.stopPropagation();
            openMenu(false);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-[#f4f4f5] bg-[#FF7A00] shadow-lg shadow-[#FF7A00]/20 hover:bg-[#ff8f1f] transition-colors"
        >
          <LayoutGrid size={14} />
          Menu
        </motion.button>
      </div>

      {/* Desktop button */}
      <div className="hidden lg:flex fixed top-4 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={(e) => {
            e.stopPropagation();
            openMenu(false);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-medium text-[#9ca3af] bg-[#18191c] border border-[#262729] hover:border-[#35373b] hover:text-[#f4f4f5] transition-all"
        >
          <LayoutGrid size={13} />
          Menu
        </motion.button>
      </div>

      <div className="w-full">{children}</div>

      {/* The part that was missing: render the drawer */}
      <AnimatePresence>
        {activeOverlay === "menu" && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOverlay}
              className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 left-0 w-[85%] sm:w-[320px] lg:w-[360px] h-full bg-[#121417] border-r border-white/5"
            >
              <AccountSideMenu
                setIsOpen={closeOverlay}
                minimal={isMinimalMenu}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Account;
