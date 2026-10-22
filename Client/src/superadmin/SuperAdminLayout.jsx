// src/superadmin/SuperAdminLayout.jsx
// Shell for the Super Admin area: sticky blurred top bar, 4 pill tabs and
// animated tab switching. Each tab renders a page that owns its own data fetch.
// Route mount: /superadmin/*  ·  data: GET /api/superadmin/*

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  LogOut,
  ScanLine,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from "lucide-react";

import {
  CURRENT_SUPERADMIN,
  SUPERADMIN_SUBTITLE,
  SUPERADMIN_TITLE,
  TABS,
  TIMEZONE,
} from "./constants";
import EventsPage from "./pages/EventsPage";
import RevenuePage from "./pages/RevenuePage";
import ScannerPage from "./pages/ScannerPage";
import UsersPage from "./pages/UsersPage";

const TAB_ICONS = {
  events: CalendarDays,
  revenue: Wallet,
  scanner: ScanLine,
  users: Users,
};

const PAGE_BY_TAB = {
  events: EventsPage,
  revenue: RevenuePage,
  scanner: ScannerPage,
  users: UsersPage,
};

export default function SuperAdminLayout() {
  const [activeTab, setActiveTab] = useState("events");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleTabChange = useCallback((key) => {
    setActiveTab((current) => (current === key ? current : key));
  }, []);

  /* Close the account menu on outside click or Escape. */
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  /* UI-only sign out. The real app posts /api/auth/logout and clears its auth
     context; this module stays self-contained, so it just leaves the area. */
  const handleSignOut = useCallback(() => {
    setMenuOpen(false);
    toast.success("Signed out");
    navigate("/login");
  }, [navigate]);

  const ActivePage = PAGE_BY_TAB[activeTab] || EventsPage;
  const activeMeta = TABS.find((tab) => tab.key === activeTab);

  return (
    <div className="relative min-h-screen w-full bg-[#121417] text-white">
      {/* Ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(60rem 40rem at 12% -10%, rgba(255,122,0,0.08), transparent 60%), radial-gradient(50rem 34rem at 95% 0%, rgba(94,199,80,0.06), transparent 55%)",
        }}
      />

      {/* Sticky top bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#121417]/80 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FF7A00]/25 bg-[#FF7A00]/10 text-[#FF9A3D]"
                aria-hidden="true"
              >
                <ShieldCheck className="h-5 w-5" />
              </span>

              <div>
                <h1 className="font-black uppercase tracking-tighter text-xl leading-none text-white sm:text-2xl">
                  {SUPERADMIN_TITLE}
                </h1>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                  {SUPERADMIN_SUBTITLE}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 md:inline-flex">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="truncate">{TIMEZONE}</span>
              </span>

              {/* Account menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                  className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#1C1F22] p-1 pr-2.5 transition-colors hover:border-white/[0.16] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/15 text-[#FF9A3D]"
                    aria-hidden="true"
                  >
                    <User className="h-4 w-4" />
                  </span>

                  <span className="hidden text-[10px] font-black uppercase tracking-[0.16em] text-gray-300 sm:inline">
                    {CURRENT_SUPERADMIN.name}
                  </span>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      key="account-menu"
                      role="menu"
                      aria-label="Account"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1C1F22] shadow-2xl"
                    >
                      <div className="px-4 py-4">
                        <p className="font-black uppercase tracking-tighter text-sm text-white">
                          {CURRENT_SUPERADMIN.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-gray-500">
                          {CURRENT_SUPERADMIN.email}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#FF9A3D]">
                          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                          Super admin
                        </span>
                      </div>

                      <div className="h-px bg-white/[0.06]" aria-hidden="true" />

                      <div className="p-2">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleSignOut}
                          aria-label="Sign out of the super admin area"
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-[0.16em] text-red-400 transition-colors hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
                        >
                          <LogOut className="h-4 w-4" aria-hidden="true" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Tab pills */}
          <nav
            aria-label="Super admin sections"
            className="scroll-hidden -mx-1 mt-4 flex items-center gap-2 overflow-x-auto px-1 pb-3"
          >
            {TABS.map((tab) => {
              const Icon = TAB_ICONS[tab.key];
              const active = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${tab.label} — ${tab.hint}`}
                  className={[
                    "relative inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60",
                    active
                      ? "border-[#FF7A00]/50 text-white"
                      : "border-white/[0.06] text-gray-400 hover:border-white/[0.12] hover:text-white",
                  ].join(" ")}
                >
                  {active ? (
                    <motion.span
                      layoutId="superadmin-tab-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-[#FF7A00]/15"
                      aria-hidden="true"
                    />
                  ) : null}

                  <Icon className="relative h-4 w-4" aria-hidden="true" />
                  <span className="relative">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Tab content — pages unmount on switch, so their intervals and the
          scanner instance are cleaned up automatically. */}
      <main className="relative mx-auto w-full max-w-[1500px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <ActivePage />
          </motion.section>
        </AnimatePresence>

        <p className="mt-12 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-700">
          {activeMeta ? activeMeta.hint : ""} · Mock data · {TIMEZONE}
        </p>
      </main>
    </div>
  );
}
