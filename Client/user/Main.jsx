import {
  Heart,
  Bell,
  House,
  Ticket,
  CalendarDays,
  X,
  MapPin,
  ArrowUpRight,
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
  SideMenuPanel,
} from "../src/components/Reusable";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useService } from "../src/Context/ServiceContext";
import { Link, useLocation, Outlet } from "react-router-dom";
import { eventService } from "@/Context/ApiEvent";
import api from "../src/Context/api/api.config";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useCallback } from "react";

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
    setType,
    setDate,
    setArtist,
    setVenues,
    setSearch,
  } = useService();

  const location = useLocation();
  const { user, notifications } = eventService();
  const navigate = useNavigate();

  const [activeOverlay, setActiveOverlay] = useState(null);
  const [isMinimalMenu, setIsMinimalMenu] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuItems = useMemo(
    () => [
      {
        label: "My tickets",
        path: "/tickets_home",
        icon: <Ticket size={15} />,
      },
      {
        label: "Wishlist",
        path: "/account/favorites",
        icon: <Heart size={15} />,
      },
      { label: "Venues", path: "/venues", icon: <MapPin size={15} /> },
    ],
    [],
  );

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout", {});
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin/home");
    }
  }, [user, navigate]);

  // Hide bottom nav on account/profile pages
  const isAccountPage = location.pathname.startsWith("/account");

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
      <div className="relative min-h-screen w-full bg-[#121417] text-white flex flex-col [overflow-x:clip]">
        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-[80] bg-[#121417]/25 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1536px] items-center justify-between px-6 py-3 lg:px-12">
            {/* Logo */}
            <Link
              to="/"
              aria-label="PAYSSO home"
              className="group inline-flex shrink-0 items-center self-end rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7A00]"
            >
              <img
                src="/paysso-lockup.png"
                alt="PAYSSO"
                className="h-[2.6rem] w-auto translate-y-[2px] object-contain opacity-95 transition-opacity group-hover:opacity-100"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
              {[
                { label: "Discover", path: "/" },
                { label: "Explore", path: "/event" },
                // { label: "Venues", path: "/venues" },
                { label: "Clubs", path: "/club/rsvp" },
              ].map((item) => {
                const active = location.pathname === item.path;
                return (
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
                    className={`leading-none text-[12px] font-bold uppercase tracking-[0.18em] no-underline decoration-transparent transition-colors ${
                      active ? "text-white" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              {/* Calendar Icon — temporarily hidden
              <button
                type="button"
                aria-label="Open calendar"
                onClick={() => setActiveOverlay("calendar")}
                className="relative text-gray-400 transition hover:text-[#FF7A00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7A00]"
              >
                <CalendarDays size={19} />
              </button>
              */}

              {/* Notification */}
              {user && (
                <button
                  type="button"
                  aria-label="Open notifications"
                  onClick={openNotification}
                  className="relative text-gray-400 transition hover:text-[#FF7A00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7A00]"
                >
                  <Bell size={20} />
                  <span
                    className={`absolute top-1 right-1 w-2 h-2 bg-[#FF7A00] ${
                      notifications?.len > 0 ? "animate-ping" : "hidden"
                    } rounded-full`}
                  />
                </button>
              )}

              {user ? (
                <div
                  className="relative hidden md:block"
                  onMouseEnter={() => setAccountMenuOpen(true)}
                  onMouseLeave={() => setAccountMenuOpen(false)}
                >
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-2 rounded-full px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 no-underline decoration-transparent transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A00]"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-white/[0.04]">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                    </span>
                    Account
                  </Link>

                  <AnimatePresence>
                    {accountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute right-0 top-full z-50 mt-3 w-[260px] overflow-hidden rounded-[1.4rem] border border-white/[0.08] bg-[#0E1012]/95 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                      >
                        <div className="border-b border-white/[0.06] px-4 py-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#FF7A00]">
                            Account center
                          </p>
                        </div>
                        <div className="space-y-1 p-2">
                          {accountMenuItems.map((item) => (
                            <Link
                              key={item.label}
                              to={item.path}
                              className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-[12px] font-semibold text-gray-200 transition hover:bg-white/[0.04] hover:text-white"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-[#FF7A00]">
                                  {item.icon}
                                </span>
                                {item.label}
                              </span>
                              <span className="text-gray-600">›</span>
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-white/[0.06] p-2">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-[12px] font-semibold text-red-400 transition hover:bg-red-500/10"
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                                <X size={15} />
                              </span>
                              Sign out
                            </span>
                            <span className="text-red-400">›</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full px-2 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 no-underline decoration-transparent transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A00]"
                >
                  Login
                </Link>
              )}

              <Link
                to={
                  user?.role === "admin" || user?.role === "club_owner"
                    ? "/admin/events/add"
                    : "/admin/register"
                }
                className="inline-flex min-h-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.02] px-3 text-[10px] font-semibold text-white no-underline decoration-transparent transition-colors hover:border-[#FF7A00] hover:bg-[#FF7A00] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A00] sm:px-3.5 md:min-h-9 md:px-4 md:text-xs"
              >
                Create event
              </Link>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 pb-20 md:pb-0">
            <Outlet />
          </div>

          {/* ================= FOOTER ================= */}
          <footer className="relative z-10 border-t border-white/[0.08] bg-[#0D0F11]">
            <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-6 px-6 py-5 lg:px-12">
              <Link
                to="/"
                aria-label="PAYSSO home"
                className="group inline-flex shrink-0 items-center self-end rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7A00]"
              >
                <img
                  src="/paysso-lockup.png"
                  alt="PAYSSO"
                  className="h-[2.6rem] w-auto translate-y-[2px] object-contain opacity-95 transition-opacity group-hover:opacity-100"
                />
              </Link>

              <div className="hidden items-center gap-8 text-[12px] font-medium text-white/80 md:flex">
                <Link
                  to="/terms"
                  onClick={scrollToTop}
                  className="transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/privacy"
                  onClick={scrollToTop}
                  className="transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </div>

              <Link
                to="/contact"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-3 text-[12px] font-semibold text-white transition-colors hover:bg-white/[0.12] md:px-5 md:text-[14px]"
              >
                <span>Need help? Contact us</span>
                <ArrowUpRight size={16} className="shrink-0" />
              </Link>
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
                <SideMenuPanel
                  setIsOpen={closeOverlay}
                  minimal={isMinimalMenu}
                />
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
              className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] bg-[#1A1C1E]/95 backdrop-blur-xl py-3 px-4 z-[55] border border-white/10 rounded-2xl grid grid-cols-4 gap-2"
            >
              <MenuBar icon={<House size={20} />} header="Home" path="/" />
              <MenuBar
                icon={<MapPin size={20} />}
                header="Clubs"
                path="/club/rsvp"
              />
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};

export default Main;
