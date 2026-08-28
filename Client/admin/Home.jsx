import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SideBar from "./SideBar";
import Header from "./Header";
import { eventService } from "../src/Context/ApiEvent";
import { AnimatePresence, motion } from "framer-motion";

const Home = () => {
  const { user, usererror } = eventService();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // If there's an auth error or the user is loaded but NOT an admin, redirect.
    if (usererror || (user && user.role !== "admin")) {
      navigate("/");
    }
  }, [user, usererror, navigate]);

  // Optionally show a blank screen or a loader while validating user
  if (!user && !usererror) {
    return <div className="h-screen bg-[#121417]" />;
  }

  return (
    <div className="flex h-screen bg-[#121417] text-white selection:bg-[#FF7A00]/20 font-onest overflow-hidden">
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden lg:block w-64 lg:w-[280px] shrink-0 bg-[#1C1F22] border-r border-white/[0.06] z-20">
        <SideBar />
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            {/* Drawer panel */}
            <motion.div
              key="sidebar-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[#1C1F22] border-r border-white/[0.06] z-50 lg:hidden shadow-2xl"
            >
              <SideBar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto scroll-hidden relative">
          <div className="w-full min-h-full px-4 sm:px-6 md:px-10 py-6 sm:py-8 lg:py-10 max-w-[1600px] mx-auto pb-32">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default Home;
