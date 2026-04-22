import { Menu, Bell, CircleUser, House, Ticket, BellDot } from "lucide-react";
import { NotificationSidebar, MenuBar } from "../src/components/Reusable";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useService } from "../src/Context/ServiceContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

const Main = ({ children }) => {
  const { isAccountActive } = useService();
  const [isNotification, setIsNotification] = useState(false);
  const location = useLocation();
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

        {/* ================= HEADER: RESPONSIVE SCALING ================= */}
        {/* Increased max-w to 1536px (2xl) | Responsive py and text */}
        <header className="sticky top-0 z-[80] w-full border-b border-white/[0.04] bg-[#121417]/90 backdrop-blur-xl">
          <div className="max-w-[1536px] mx-auto flex items-center justify-between px-6 py-3 lg:py-4 lg:px-12">
            {/* Brand - Scaled for LG */}
            <Link to="/" className="group flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black italic tracking-tighter text-white uppercase transition-colors group-hover:text-[#FF7A00]">
                Paysso
              </h1>
            </Link>

            {/* Nav - Better readability on LG */}
            <nav className="hidden md:flex items-center gap-8 lg:gap-12">
              {[
                { label: "Explore", path: "/" },
                { label: "Venues", path: "/venues" },
                { label: "Artists", path: "/artists" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] transition-all ${
                    location.pathname === item.path
                      ? "text-[#FF7A00]"
                      : "text-gray-500 hover:text-gray-200"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions - Better Spacing */}
            <div className="flex items-center gap-5 lg:gap-8">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotification(true);
                }}
                className="text-gray-500 hover:text-[#FF7A00] transition-colors p-1.5 relative"
              >
                <Bell size={20} strokeWidth={2} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF7A00]  animate-ping rounded-full" />
              </button>

              <Link
                to="/account"
                className="w-9 h-9 lg:w-11 lg:h-11 rounded-full overflow-hidden border-2 border-white/10 hover:border-[#FF7A00] transition-all shadow-inner"
              >
                <img
                  src="/userdefault.webp"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  alt="Profile"
                />
              </Link>

              <button className="md:hidden text-white p-1">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <main className="relative z-10 flex-1 flex flex-col">
          <div className="flex-1 pb-20 md:pb-0">{children}</div>

          {/* Footer - Scaled for large screens */}
          <footer className="w-full border-t border-white/[0.04] bg-[#0D0F11] py-20 lg:py-28">
            <div className="max-w-[1536px] mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-16 lg:gap-24">
              <div className="col-span-2 space-y-8">
                <div className="text-3xl font-black italic text-white uppercase tracking-tighter">
                  Paysso
                </div>
                <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-sm">
                  The high-performance ticketing engine for the next generation
                  of live entertainment. Built for speed, scale, and fans.
                </p>
              </div>

              {footerSections.map((s) => (
                <div key={s.title} className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
                    {s.title}
                  </h4>
                  <div className="flex flex-col gap-4">
                    {s.links.map((l) => (
                      <Link
                        key={typeof l === "string" ? l : l.label}
                        to="#"
                        className="text-[13px] font-bold text-gray-700 hover:text-[#FF7A00] transition-colors"
                      >
                        {typeof l === "string" ? l : l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-[1536px] mx-auto px-6 lg:px-12 mt-20 pt-8 border-t border-white/[0.02] flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              <div>&copy; {currentYear} Paysso Interactive</div>
              <div className="flex gap-8">
                <Link to="#" className="hover:text-white">
                  Privacy
                </Link>
                <Link to="#" className="hover:text-white">
                  Legal
                </Link>
              </div>
            </div>
          </footer>
        </main>

        {/* ================= OVERLAYS ================= */}
        <AnimatePresence>
          {isNotification && (
            <div className="fixed inset-0 z-[100]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNotification(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="absolute top-0 right-0 w-full sm:w-[420px] lg:w-[480px] h-full bg-[#121417] border-l border-white/5 shadow-2xl"
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
              className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-[#1A1C1E]/95 backdrop-blur-xl py-4 px-10 z-[55] border border-white/10 rounded-2xl shadow-2xl flex justify-between items-center"
            >
              <MenuBar icon={<House size={20} />} path="/" />
              <MenuBar icon={<Ticket size={20} />} path="/tickets_home" />
              <MenuBar icon={<CircleUser size={20} />} path="/account" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};

export default Main;
