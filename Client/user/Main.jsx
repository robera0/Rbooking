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
  User,
  CalendarDays,
  X,
  MapPin,
} from "lucide-react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickerDay } from "@mui/x-date-pickers/PickerDay";
import { Badge } from "@mui/material";
import dayjs from "dayjs";

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
import { useQueryClient } from "@tanstack/react-query";
import api from "../src/Context/api/api.config";

// ─── MUI Orange Theme ──────────────────────────────────────────────────────
const orangeTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FF7A00",
      light: "#FF9A40",
      dark: "#CC6200",
      contrastText: "#000000",
    },
    background: { default: "#121417", paper: "#1C1F22" },
    text: { primary: "#FFFFFF", secondary: "#9CA3AF" },
  },
  components: {
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: { color: "#FF7A00", paddingLeft: "16px", paddingRight: "16px" },
        label: {
          color: "#FF7A00",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: "0.75rem",
        },
        switchViewButton: { color: "#FF7A00" },
      },
    },
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        button: {
          color: "#FF7A00",
          "&:hover": { backgroundColor: "rgba(255,122,0,0.1)" },
        },
      },
    },
    MuiDayCalendar: {
      styleOverrides: {
        weekDayLabel: {
          color: "#6B7280",
          fontWeight: 900,
          textTransform: "uppercase",
          fontSize: "0.65rem",
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: "#FFFFFF",
          fontSize: "0.75rem",
          fontWeight: 700,
          "&:hover": {
            backgroundColor: "rgba(255,122,0,0.1)",
            border: "1px solid rgba(255,122,0,0.3)",
          },
          "&.Mui-selected": {
            backgroundColor: "#FF7A00 !important",
            color: "#000000 !important",
            fontWeight: 900,
          },
        },
        today: {
          border: "1px dashed #FF7A00 !important",
        },
      },
    },
  },
});

// ─── Calendar Sidebar Component ─────────────────────────────────────────────
const CalendarSidebar = ({ setIsOpen }) => {
  const { events } = eventService();
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const eventsOnSelectedDate =
    events?.events?.filter((ev) => {
      if (!ev?.dates?.start?.localDate) return false;
      return dayjs(ev.dates.start.localDate).isSame(selectedDate, "day");
    }) || [];

  const ServerDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const hasEvent = events?.events?.some((ev) => {
      if (!ev?.dates?.start?.localDate) return false;
      return dayjs(ev.dates.start.localDate).isSame(day, "day");
    });

    return (
      <div className="relative">
        <PickerDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
        />
        {hasEvent && !outsideCurrentMonth && (
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full scale-[1.3] pointer-events-none"
            style={{ stroke: "#ffb3c6", zIndex: 10 }}
          >
            <path
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M 50 15 C 75 10, 90 30, 85 60 C 80 85, 40 90, 20 75 C 5 60, 15 25, 40 15 C 65 5, 95 30, 80 70"
            />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#121417]">
      <div className="p-6 border-b border-white/[0.04] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-tight">
            Event <span className="text-[#FF7A00]">Calendar</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Discover what's happening
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.03] text-gray-500 hover:text-white hover:bg-white/[0.1] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-6 border-b border-white/[0.04]">
        <ThemeProvider theme={orangeTheme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              slots={{ day: ServerDay }}
              sx={{
                width: "100%",
                "& .MuiPickersCalendarHeader-root": { padding: 0 },
              }}
            />
          </LocalizationProvider>
        </ThemeProvider>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">
          Events on {selectedDate.format("MMMM D, YYYY")}
        </h3>
        {eventsOnSelectedDate.length > 0 ? (
          eventsOnSelectedDate.map((ev) => (
            <Link
              to={
                ev?.tickets?.length > 0
                  ? `/events/${ev?._id}/tickets/${ev.tickets[0]?._id}`
                  : `/events/${ev?._id}`
              }
              key={ev._id}
              onClick={() => setIsOpen(false)}
              className="block bg-[#1A1D20] p-4 rounded-2xl border border-white/[0.04] hover:border-[#FF7A00]/50 transition-all"
            >
              <h4 className="text-sm font-black text-white">{ev.name}</h4>
              <p className="text-[10px] text-gray-500 uppercase mt-1">
                {ev.links?.venues?.name || "TBA"} •{" "}
                {ev.dates?.start?.localTime || "TBA"}
              </p>
            </Link>
          ))
        ) : (
          <div className="text-center py-10 bg-white/[0.02] rounded-2xl border border-dashed border-white/[0.1]">
            <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest">
              No events on this day
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Main = () => {
  const {
    isAccountActive,
    menuOpen,
    setMenuOpen,
    API_URL,
    setType,
    setDate,
    setArtist,
    setVenues,
    setSearch,
  } = useService();

  const location = useLocation();
  const { user, userIsLoading, userProfile, notifications } = eventService();
  const navigate = useNavigate();

  const [activeOverlay, setActiveOverlay] = useState(null);
  const [isMinimalMenu, setIsMinimalMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin/home");
    }
  }, [user, navigate]);

  // Hide bottom nav on account/profile pages
  const isAccountPage = location.pathname.startsWith("/account");

  const handleLogout = async () => {
    try {
      await api.post(`/api/auth/logout`);
      queryClient.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
      window.location.href = "/login";
    }
  };

  const openMenu = useCallback((minimal = false) => {
    setIsMinimalMenu(minimal);
    setActiveOverlay("menu");
  }, []);

  const openNotification = useCallback(() => {
    setActiveOverlay("notification");
  }, []);

  const closeOverlay = useCallback(() => {
    setActiveOverlay(null);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  /* ESC KEY SUPPORT */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeOverlay();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeOverlay]);

  /* ---------------- FOOTER DATA ---------------- */
  const currentYear = new Date().getFullYear();

  const profileImageSrc = useMemo(() => {
    if (userProfile?.user?.avatarUrl) {
      return `${API_URL}/${userProfile.user.avatarUrl}`;
    }
    return "/defaultAvater.jpg";
  }, [userProfile?.user?.avatarUrl, API_URL]);

  const footerSections = useMemo(
    () => [
      {
        title: "Discover",
        links: [
          { label: "Events", path: "/event" },
          { label: "Venues", path: "/venues" },
          { label: "Artists", path: "/artists" },
          { label: "Festivals", path: "/event?type=festival" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "Our Story", path: "/about" },
          { label: "Careers", path: "/careers" },
          { label: "Press", path: "/press" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Help Center", path: "/help" },
          { label: "Contact Us", path: "/contact" },
          { label: "Terms", path: "/terms" },
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
            <Link to="/" className="group flex items-center gap-3">
              <img
                src="/P_logo.png"
                alt="Paysso logo"
                className="h-8 w-8 object-contain"
              />
              <span className="hidden sm:inline text-2xl lg:text-3xl font-black italic uppercase tracking-tight group-hover:text-[#FF7A00] transition">
                Paysso
              </span>
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
                  onClick={() => {
                    if (item.path === "/venues") {
                      setType("");
                      setDate("");
                      setArtist("");
                      setVenues("");
                      setSearch("");
                    }
                  }}
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
              {/* Calendar Icon */}
              <button
                onClick={() => setActiveOverlay("calendar")}
                className="relative text-gray-500 hover:text-[#FF7A00] transition"
              >
                <CalendarDays size={20} />
              </button>

              {/* Notification */}
              {user && (
                <button
                  onClick={openNotification}
                  className="relative text-gray-500 hover:text-[#FF7A00] transition"
                >
                  <Bell size={20} />
                  <span
                    className={`absolute top-1 right-1 w-2 h-2 bg-[#FF7A00] ${
                      notifications?.len > 0 ? "animate-ping" : "hidden"
                    } rounded-full`}
                  />
                </button>
              )}

              {/* Profile Wrapper with Hover Menu */}
              <div
                className="relative flex items-center gap-3"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Mobile Menu Trigger 
                
                 <button
                  onClick={() => openMenu(false)}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/10 text-gray-400"
                >
                  <Menu size={18} />
                </button>

                */}

                {/* Profile Avatar */}
                <Link
                  to="/account"
                  className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-[#FF7A00] transition-colors bg-white/[0.02]"
                >
                  <img
                    src={profileImageSrc}
                    alt="Profile"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/Login.jpg";
                    }}
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
                              icon={<MapPin size={16} />}
                              label="Venues"
                              path="/venues"
                            />
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
                            {/*{" "}
                            <DropdownItem
                              icon={<Settings size={16} />}
                              label="Settings"
                              path="/account/setting"
                            />
                            <DropdownItem
                              icon={<CreditCard size={16} />}
                              label="Payment Detail"
                              path="/account/payment_detail"
                            />{" "}
                            */}
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
          <div className="flex-1 pb-20 md:pb-0">
            <Outlet />
          </div>

          {/* ================= FOOTER ================= */}
          <footer className="border-t border-white/[0.04] bg-[#0D0F11] py-20">
            <div className="max-w-[1536px] mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-16">
              {/* Brand */}
              <div className="col-span-2 space-y-6">
                <Link
                  to="/"
                  onClick={scrollToTop}
                  className="group flex items-center gap-3 w-fit"
                >
                  <img
                    src="/P_logo.png"
                    alt="Paysso logo"
                    className="h-10 w-10 object-contain"
                  />
                  <span className="hidden sm:inline text-3xl font-black italic uppercase tracking-tight group-hover:text-[#FF7A00] transition">
                    Paysso
                  </span>
                </Link>
                <p className="text-gray-500 text-sm max-w-sm">
                  The high performance ticketing engine for live entertainment.
                </p>
              </div>

              {/* Footer Link Sections — FIXED */}
              {footerSections.map((s) => (
                <div key={s.title} className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
                    {s.title}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {s.links.map((l) => (
                      <Link
                        key={l.label}
                        to={l.path}
                        onClick={scrollToTop}
                        className="text-[13px] font-bold text-gray-700 hover:text-[#FF7A00] transition-colors"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Bar */}
            <div className="max-w-[1536px] mx-auto px-6 lg:px-12 mt-16 pt-6 border-t border-white/[0.02] flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-600">
              <span>© {currentYear} Paysso</span>
              <div className="flex gap-6">
                <Link
                  to="/privacy"
                  onClick={scrollToTop}
                  className="hover:text-[#FF7A00] transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  to="/legal"
                  onClick={scrollToTop}
                  className="hover:text-[#FF7A00] transition-colors"
                >
                  Legal
                </Link>
              </div>
            </div>
          </footer>
        </main>

        {/* ================= OVERLAYS ================= */}
        <AnimatePresence>
          {activeOverlay && (
            <div className="fixed inset-0 z-[100]">
              {/* Backdrop */}
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
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
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
                  transition={{ type: "spring", damping: 30, stiffness: 200 }}
                  className="absolute top-0 right-0 w-full sm:w-[420px] lg:w-[480px] h-full bg-[#121417]"
                >
                  <NotificationSidebar setIsOpen={closeOverlay} />
                </motion.div>
              )}
              {/* CALENDAR */}
              {activeOverlay === "calendar" && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 200 }}
                  className="absolute top-0 right-0 w-full sm:w-[420px] lg:w-[480px] h-full bg-[#121417] overflow-y-auto"
                >
                  <CalendarSidebar setIsOpen={closeOverlay} />
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* ================= MOBILE NAV ================= */}
        <AnimatePresence>
          {!isAccountPage && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] bg-[#1A1C1E]/95 backdrop-blur-xl py-3 px-4 z-[55] border border-white/10 rounded-2xl flex justify-between"
            >
              <MenuBar icon={<House size={20} />} header="Home" path="/" />
              <MenuBar
                icon={<Ticket size={20} />}
                header="Tickets"
                path="/tickets_home"
              />

              <MenuBar
                icon={<Heart size={20} />}
                header="Wishlist"
                path="/account/favorites"
              />
              <MenuBar
                icon={<Menu size={20} />}
                header="Menu"
                onClick={() => openMenu(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};

export default Main;
