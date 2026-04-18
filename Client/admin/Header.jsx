import {
  Bell,
  UserRoundCog,
  ChevronDown,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { SearchInput } from "./Cards";
import { AnimatePresence, motion } from "framer-motion";

// Single dropdown item
export const Dropdown = ({ name, icon, isDanger }) => {
  return (
    <button className={`group w-full px-4 py-3 flex items-center justify-start text-sm transition-colors border-b border-white/[0.04] space-x-3 cursor-pointer ${isDanger ? 'hover:bg-red-500/10' : 'hover:bg-white/[0.04]'}`}>
      <div className={`${isDanger ? 'text-red-400 group-hover:text-red-500' : 'text-gray-400 group-hover:text-[#FF7A00]'}`}>{icon}</div>
      <h1 className={`font-bold ${isDanger ? 'text-red-400 group-hover:text-red-500' : 'text-gray-300 group-hover:text-white'}`}>{name}</h1>
    </button>
  );
};

const Header = () => {
  const [drop, setDrop] = useState(false);

  return (
    <div className="w-full h-20 bg-[#121417]/95 backdrop-blur-md flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 border-b border-white/[0.06]">
      {/* Search bar */}
      <div className="flex-1 max-w-xl pr-6">
        <SearchInput
          placeholder="Search bookings, salons..."
        />
      </div>

      {/* Right side: notifications, language, profile */}
      <div className="flex items-center space-x-6 md:space-x-8">
        {/* Notification */}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors group">
          <Bell strokeWidth={2.5} size={22} className="group-hover:text-[#FF7A00]" />
          <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-[#FF7A00] rounded-full shadow-lg shadow-[#FF7A00]/40">
            <p className="font-bold text-black text-[9px] leading-none">12</p>
          </div>
        </button>

        <div className="h-8 w-px bg-white/[0.08] hidden md:block"></div>

        {/* Profile */}
        <div className="relative flex flex-col justify-center items-center">
          <button
            onClick={() => setDrop((prev) => !prev)}
            className="flex items-center space-x-3 md:space-x-4 px-2 md:px-3 py-1.5 rounded-full border border-transparent hover:border-white/[0.08] hover:bg-white/[0.02] transition-all z-10"
          >
            {/* Profile image */}
            <div
              style={{
                backgroundImage: 'url("/userdefault.webp")',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              className="w-10 h-10 rounded-full border border-white/[0.1] shadow-inner"
            ></div>

            {/* Name */}
            <div className="hidden md:flex flex-col items-start bg-transparent text-left">
              <span className="text-white text-sm font-bold leading-tight">Velvet Admin</span>
              <span className="text-[#FF7A00] text-[10px] font-black uppercase tracking-widest leading-tight">Master</span>
            </div>

            {/* Chevron */}
            <ChevronDown strokeWidth={2.5} size={16} className={`text-gray-400 transition-transform ${drop ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {drop && (
              <motion.div
                key="dropdown"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                className="absolute top-full right-0 mt-3 w-56 bg-[#1C1F22] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
              >
                <Dropdown icon={<UserRoundCog size={18} strokeWidth={2.5} />} name="Manage Account" />
                <Dropdown icon={<KeyRound size={18} strokeWidth={2.5} />} name="Security Settings" />
                <Dropdown icon={<RotateCcw size={18} strokeWidth={2.5} />} name="Activity Log" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Header;
