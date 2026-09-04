import {
  Bell,
  UserRoundCog,
  ChevronDown,
  KeyRound,
  RotateCcw,
  CheckCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { SearchInput } from "./Cards";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { eventService } from "@/Context/ApiEvent";
import { useNavigate } from "react-router-dom";
import { useService } from "@/Context/ServiceContext";
// Single dropdown item
export const Dropdown = ({ name, icon, isDanger, path }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className={`group w-full px-4 py-3 flex items-center justify-start text-sm transition-colors border-b border-white/[0.04] space-x-3 cursor-pointer ${
        isDanger ? "hover:bg-red-500/10" : "hover:bg-white/[0.04]"
      }`}
    >
      <div
        className={`${
          isDanger
            ? "text-red-400 group-hover:text-red-500"
            : "text-gray-400 group-hover:text-[#FF7A00]"
        }`}
      >
        {icon}
      </div>
      <h1
        className={`font-bold ${
          isDanger
            ? "text-red-400 group-hover:text-red-500"
            : "text-gray-300 group-hover:text-white"
        }`}
      >
        {name}
      </h1>
    </button>
  );
};

const Header = ({ onMenuToggle }) => {
  const [drop, setDrop] = useState(false);
  const [notifDrop, setNotifDrop] = useState(false);
  const { userProfile, notifications, readNotification } = eventService();
  const { API_URL } = useService();

  const unreadCount =
    notifications?.notifications?.filter((n) => !n.read)?.length || 0;
  const unreadNotifs =
    notifications?.notifications
      ?.filter((n) => !n.read)
      ?.slice()
      ?.reverse()
      ?.slice(0, 8) || [];

  const userName =
    [userProfile?.user?.firstName, userProfile?.user?.lastName]
      .filter(Boolean)
      .join(" ") || "Your Name";
  const userEmail = userProfile?.user?.userId?.email || "";

  const userRole = userProfile?.role || "Admin";
  return (
    <div className="w-full h-16 sm:h-20 bg-[#121417]/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 md:px-10 sticky top-0 z-40 border-b border-white/[0.06]">
      {/* Left side: Hamburger + Logo */}
      <div className="flex-1 flex items-center gap-3 pl-0 sm:pl-2">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <Menu size={24} />
        </button>

        <h1 className="text-xl sm:text-2xl text-white font-black uppercase tracking-tighter">
          PAY<span className="text-[#FF7A00]">SSO</span>
        </h1>
      </div>

      {/* Right side: notifications, language, profile */}
      <div className="flex items-center space-x-3 sm:space-x-6 md:space-x-8">
        {/* Notification */}
        <div className="relative flex flex-col justify-center items-center">
          <button
            onClick={() => setNotifDrop((prev) => !prev)}
            className="relative p-2 text-gray-400 hover:text-white transition-colors group z-10"
          >
            <Bell
              strokeWidth={2.5}
              size={20}
              className="group-hover:text-[#FF7A00] sm:w-[22px] sm:h-[22px]"
            />
            {unreadCount > 0 && (
              <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-[#FF7A00] rounded-full shadow-lg shadow-[#FF7A00]/40">
                <p className="font-bold text-black text-[9px] leading-none">
                  {unreadCount}
                </p>
              </div>
            )}
          </button>

          <AnimatePresence>
            {notifDrop && (
              <motion.div
                key="notif-dropdown"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                className="absolute top-full right-[-50px] sm:right-[-50px] mt-3 w-[calc(100vw-2rem)] sm:w-72 max-w-72 bg-[#1C1F22] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50 origin-top"
              >
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.04] bg-white/[0.02]">
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() =>
                        unreadNotifs.forEach((n) => readNotification(n._id))
                      }
                      className="text-[9px] text-[#FF7A00] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                    >
                      <CheckCheck size={12} /> Mark read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {unreadNotifs.map((notif, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        readNotification(notif._id);
                      }}
                      className={`w-full text-left p-4 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors bg-[#FF7A00]/5`}
                    >
                      <p className={`text-xs text-white font-bold`}>
                        {notif.title || "Activity"}
                      </p>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </button>
                  ))}
                  {unreadNotifs.length === 0 && (
                    <div className="p-6 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest border-dashed border-white/[0.04]">
                      No notifications yet
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-white/[0.08] hidden sm:block"></div>

        {/* Profile */}
        <div className="relative flex flex-col justify-center items-center">
          <button
            onClick={() => setDrop((prev) => !prev)}
            className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 px-1.5 sm:px-2 md:px-3 py-1.5 rounded-full border border-transparent hover:border-white/[0.08] hover:bg-white/[0.02] transition-all z-10"
          >
            {/* Profile image */}
            <div
              style={{
                backgroundImage: `url(${
                  userProfile?.user?.avatarUrl
                    ? `${API_URL}/${userProfile.user.avatarUrl}`
                    : "/userdefault.webp"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/[0.1] shadow-inner"
            ></div>

            {/* Name */}
            <div className="hidden md:flex flex-col items-start bg-transparent text-left">
              <span className="text-white text-sm font-bold leading-tight">
                {userName || "Admin User"}
              </span>
            </div>

            {/* Chevron */}
            <ChevronDown
              strokeWidth={2.5}
              size={16}
              className={`text-gray-400 transition-transform hidden sm:block ${
                drop ? "rotate-180" : ""
              }`}
            />
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
                <Dropdown
                  icon={<UserRoundCog size={18} strokeWidth={2.5} />}
                  name="Manage Account"
                  path="/admin/profile"
                />
                <Dropdown
                  icon={<KeyRound size={18} strokeWidth={2.5} />}
                  name="Security Settings"
                  path="/admin/setting"
                />
                <Dropdown
                  icon={<RotateCcw size={18} strokeWidth={2.5} />}
                  name="Activity Log"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Header;
