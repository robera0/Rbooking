import {
  Menu,
  Bell,
  CircleUser,
  House,
  Ticket,
  Share2,
  Mic2,
  MonitorPlay,
  Search,
} from "lucide-react";
import { NotificationSidebar, MenuBar } from "../src/components/Reusable";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useService } from "../src/Context/ServiceContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

const Main = ({ children }) => {
  const { isAccountActive } = useService();
  const [isNotification, setIsNotification] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerSections = useMemo(
    () => [
      {
        title: "Discover",
        links: ["Events", "Venues", "Artists", "Festivals"],
      },
      { title: "Company", links: ["Our Story", "Careers", "Press"] },
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
      <div className="relative min-h-screen w-full bg-[#121417] text-white flex flex-col selection:bg-[#FF7A00]/20 overflow-x-hidden">
        {/* Grain Texture */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] brightness-125" />
        </div>

        {/* ================= HEADER: COMPACT 90% ZOOM STYLE ================= */}
        {/* Reduced py-4 to py-2.5 | Reduced max-w to 1380px | Reduced text sizes */}
        <header className="sticky top-0 z-[80] w-full border-b border-white/[0.04] bg-[#121417]/80 backdrop-blur-md">
          <div className="max-w-[1380px] mx-auto flex items-center justify-between px-6 py-2.5 lg:px-10">
            {/* Brand - Scaled Down */}
            <Link to="/" className="group flex items-center gap-2">
              <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase transition-colors group-hover:text-[#FF7A00]">
                Paysso
              </h1>
            </Link>

            {/* Nav - Reduced Gap & Font Size */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: "Explore", path: "/" },
                { label: "Venues", path: "/venues" },
                { label: "Artists", path: "/artists" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-[9px] font-black uppercase tracking-[0.25em] transition-all ${
                    location.pathname === item.path
                      ? "text-[#FF7A00]"
                      : "text-gray-500 hover:text-gray-200"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions - Smaller Icons & Padding */}
            <div className="flex items-center gap-4 lg:gap-6">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevents triggers from parent containers
                  setIsNotification(true);
                }}
                className="text-gray-500 hover:text-white transition-colors p-1.5"
              >
                <Bell size={18} strokeWidth={2.5} />
              </button>

              <Link
                to="/tickets"
                className="group flex items-center gap-2 px-5 py-2 bg-[#FF7A00] text-black text-[9px] font-black uppercase tracking-widest rounded-md transition-all hover:bg-white active:scale-95 shadow-lg"
              >
                Tickets
                <Ticket size={12} strokeWidth={3} />
              </Link>

              <Link
                to="/account"
                className="w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-[#FF7A00] transition-all"
              >
                <img
                  src="/userdefault.webp"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  alt="Me"
                />
              </Link>

              <button className="md:hidden text-white p-1">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <main className="relative z-10 flex-1 flex flex-col">
          <div className="flex-1 pb-20 md:pb-0">{children}</div>

          <footer className="w-full border-t border-white/[0.04] bg-[#0D0F11] py-16">
            <div className="max-w-[1380px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
              <div className="col-span-2 lg:col-span-2 space-y-6">
                <div className="text-2xl font-black italic text-white uppercase">
                  Paysso
                </div>
                <p className="text-gray-600 text-xs font-medium leading-relaxed max-w-xs">
                  A high-performance ticketing engine built for the next
                  generation of live entertainment.
                </p>
              </div>
              {footerSections.map((s) => (
                <div key={s.title} className="space-y-4">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                    {s.title}
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {s.links.map((l) => (
                      <Link
                        key={typeof l === "string" ? l : l.label}
                        to="#"
                        className="text-[11px] font-bold text-gray-700 hover:text-[#FF7A00] transition-colors"
                      >
                        {typeof l === "string" ? l : l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </footer>
        </main>

        {/* ================= OVERLAYS (Notification Fix) ================= */}
        <AnimatePresence>
          {isNotification && (
            <div className="fixed inset-0 z-[100]">
              {" "}
              {/* Wrapper with highest Z */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNotification(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute top-0 right-0 w-full sm:w-[380px] h-full bg-[#121417] border-l border-white/5 shadow-2xl"
              >
                <NotificationSidebar setIsOpen={setIsNotification} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Mobile Nav */}
        <AnimatePresence>
          {!isAccountActive && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-[#1A1C1E]/95 backdrop-blur-xl py-3 px-8 z-[55] border border-white/10 rounded-2xl shadow-2xl flex justify-between items-center"
            >
              <MenuBar icon={<House size={18} />} path="/" />

              <MenuBar icon={<Ticket size={18} />} path="/tickets" />
              <MenuBar icon={<CircleUser size={18} />} path="/account" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};

export default Main;
