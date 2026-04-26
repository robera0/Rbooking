import {
  Menu,
  Heart,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  Bell,
  CircleUser,
  House,
  Ticket,
} from "lucide-react";

import {
  NotificationSidebar,
  MenuBar,
  AccountSideMenu,
} from "../src/components/Reusable";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { useService } from "../src/Context/ServiceContext";

import { Link, useLocation, Outlet } from "react-router-dom";
import { eventService } from "@/Context/ApiEvent";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useCallback } from "react";

const Main = () => {
  const { isAccountActive, menuOpen, setMenuOpen, API_URL } = useService();

  const location = useLocation();
  const { user, userIsLoading, userProfile } = eventService();
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */

  const [activeOverlay, setActiveOverlay] = useState(null);
  const [isMinimalMenu, setIsMinimalMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  /* ---------------- HANDLERS ---------------- */

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const openMenu = useCallback((minimal = false) => {
    setIsMinimalMenu(minimal);
    setActiveOverlay("menu");
  }, []);

  const DropdownItem = ({ icon, label, path }) => (
    <Link
      to={path}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all group"
    >
      <div className="text-gray-500 group-hover:text-[#FF7A00] transition-colors">
        {icon}
      </div>
      <span className="text-xs font-black uppercase tracking-widest">
        {label}
      </span>
      <ChevronRight
        size={12}
        className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#FF7A00]"
      />
    </Link>
  );

  const openNotification = useCallback(() => {
    setActiveOverlay("notification");
  }, []);

  const closeOverlay = useCallback(() => {
    setActiveOverlay(null);
  }, []);

  /* ESC KEY SUPPORT */

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeOverlay();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeOverlay]);

  /* ---------------- FOOTER DATA ---------------- */

  const currentYear = new Date().getFullYear();

  const footerSections = useMemo(
    () => [
      {
        title: "Discover",
        links: ["Events", "Venues", "Artists", "Festivals"],
      },
      {
        title: "Company",
        links: ["Our Story", "Careers", "Press"],
      },
      {
        title: "Support",
        links: [
          { label: "Help Center" },
          { label: "Contact Us" },
          { label: "Terms" },
        ],
      },
    ],
    [],
  );

  return (
    <LayoutGroup>
      <div className="relative min-h-screen w-full bg-[#121417] text-white flex flex-col overflow-x-hidden">
        {/* ================= HEADER ================= */}

        <header className="sticky top-0 z-[80] border-b border-white/[0.04] bg-[#121417]/90 backdrop-blur-xl">
          <div className="max-w-[1536px] mx-auto flex items-center justify-between px-6 py-3 lg:px-12">
            {/* Logo */}

            <Link to="/" className="group">
              <h1 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tight group-hover:text-[#FF7A00] transition">
                Paysso
              </h1>
            </Link>

            {/* Desktop Nav */}

            <nav className="hidden md:flex gap-10">
              {[
                { label: "Explore", path: "/event" },
                { label: "Venues", path: "/venues" },
                { label: "Artists", path: "/artists" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-[11px] font-black uppercase tracking-[0.25em] transition ${
                    location.pathname === item.path
                      ? "text-[#FF7A00]"
                      : "text-gray-500 hover:text-gray-200"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}

            <div className="flex items-center gap-6">
              {/* Notification */}

              <button
                onClick={openNotification}
                className="relative text-gray-500 hover:text-[#FF7A00] transition"
              >
                <Bell size={20} />

                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF7A00] animate-ping rounded-full" />
              </button>

              {/* Profile Wrapper with Hover Menu */}
              <div
                className="relative flex items-center gap-3"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Mobile Menu Trigger (Hamburger) */}
                <button
                  onClick={() => openMenu(false)}
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/10 text-gray-400"
                >
                  <Menu size={22} />
                </button>

                {/* Profile Link (Avatar) - On desktop moves to Profile Page, on mobile shows full menu */}
                <Link
                  to="/account"
                  className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-[#FF7A00] transition-colors bg-white/[0.02]"
                >
                  <img
                    src={userProfile?.pictures?.[0] || "/userdefault.webp"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Desktop Hover Dropdown */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="hidden md:block absolute top-full right-0 mt-3 w-64 bg-[#121417]/98 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden z-[110]"
                    >
                      <div className="p-4 border-b border-white/[0.05] bg-white/[0.02]">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FF7A00]">
                          Account Center
                        </p>
                      </div>

                      <div className="p-2">
                        {user ? (
                          <>
                            <DropdownItem
                              icon={<Ticket size={16} />}
                              label="My Tickets"
                              path="/tickets_home"
                            />
                            <DropdownItem
                              icon={<Heart size={16} />}
                              label="Wishlist"
                              path="/account/favorites"
                            />
                            <DropdownItem
                              icon={<Settings size={16} />}
                              label="Settings"
                              path="/account/setting"
                            />
                            <DropdownItem
                              icon={<CreditCard size={16} />}
                              label="Payment Detail"
                              path="/account/payment_detail"
                            />
                            <hr className="my-2 border-white/[0.05]" />
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors text-xs font-black uppercase tracking-widest"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </>
                        ) : (
                          <div className="p-2 space-y-2">
                            <Link
                              to="/login"
                              className="w-full block text-center py-3 bg-[#FF7A00] text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors"
                            >
                              Sign In
                            </Link>
                            <Link
                              to="/sign_up"
                              className="w-full block text-center py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors"
                            >
                              Create Account
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}

        <main className="flex-1 flex flex-col">
          <div className="flex-1 pb-20 md:pb-0"><Outlet /></div>

          {/* ================= FOOTER ================= */}

          <footer className="border-t border-white/[0.04] bg-[#0D0F11] py-20">
            <div className="max-w-[1536px] mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-16">
              <div className="col-span-2 space-y-6">
                <h2 className="text-3xl font-black italic uppercase">Paysso</h2>

                <p className="text-gray-500 text-sm max-w-sm">
                  The high-performance ticketing engine for live entertainment.
                </p>
              </div>

              {footerSections.map((s) => (
                <div key={s.title} className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
                    {s.title}
                  </h4>

                  <div className="flex flex-col gap-3">
                    {s.links.map((l) => (
                      <Link
                        key={typeof l === "string" ? l : l.label}
                        to="#"
                        className="text-[13px] font-bold text-gray-700 hover:text-[#FF7A00]"
                      >
                        {typeof l === "string" ? l : l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-[1536px] mx-auto px-6 lg:px-12 mt-16 pt-6 border-t border-white/[0.02] flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-600">
              <span>© {currentYear} Paysso</span>

              <div className="flex gap-6">
                <Link to="#">Privacy</Link>

                <Link to="#">Legal</Link>
              </div>
            </div>
          </footer>
        </main>

        {/* ================= OVERLAYS ================= */}

        <AnimatePresence>
          {activeOverlay && (
            <div className="fixed inset-0 z-[100]">
              {/* Background */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeOverlay}
                className="absolute inset-0 bg-black/70 backdrop-blur-xl"
              />

              {/* MENU */}

              {activeOverlay === "menu" && (
                <motion.div
                  initial={
                    isMinimalMenu
                      ? { opacity: 0, scale: 0.9, y: -20 }
                      : { x: "-100%" }
                  }
                  animate={
                    isMinimalMenu ? { opacity: 1, scale: 1, y: 0 } : { x: 0 }
                  }
                  exit={
                    isMinimalMenu
                      ? { opacity: 0, scale: 0.9, y: -20 }
                      : { x: "-100%" }
                  }
                  transition={{
                    type: "spring",
                    damping: 30,
                    stiffness: 300,
                  }}
                  className={
                    isMinimalMenu
                      ? "absolute top-20 right-6 w-72 bg-[#121417]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                      : "absolute top-0 left-0 w-[85%] sm:w-[320px] lg:w-[360px] xl:w-[400px] h-full bg-[#121417] border-r border-white/5"
                  }
                >
                  <AccountSideMenu
                    setIsOpen={closeOverlay}
                    minimal={isMinimalMenu}
                  />
                </motion.div>
              )}

              {/* NOTIFICATION */}

              {activeOverlay === "notification" && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{
                    type: "spring",
                    damping: 30,
                    stiffness: 200,
                  }}
                  className="absolute top-0 right-0 
                             w-full 
                             sm:w-[420px] 
                             lg:w-[480px] 
                             h-full 
                             bg-[#121417]"
                >
                  <NotificationSidebar setIsOpen={closeOverlay} />
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* ================= MOBILE NAV ================= */}

        <AnimatePresence>
          {!isAccountActive && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-[#1A1C1E]/95 backdrop-blur-xl py-4 px-10 z-[55] border border-white/10 rounded-2xl flex justify-between"
            >
              <MenuBar icon={<House size={20} />} path="/" />

              <MenuBar icon={<Ticket size={20} />} path="/tickets_home" />

              <MenuBar icon={<CircleUser size={20} />} onClick={openMenu} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};

export default Main;
