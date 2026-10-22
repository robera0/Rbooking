// src/superadmin/components/common/Drawer.jsx
// Right-hand slide-over with backdrop, Escape-to-close and body scroll lock.
// Used by UserDetailsDrawer (GET /api/superadmin/users/:id).

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer = null,
  ariaLabel,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="superadmin-drawer"
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close panel"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel || title || "Details panel"}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative flex h-full w-full max-w-md flex-col border-l border-white/[0.06] bg-[#16191C] shadow-2xl sm:max-w-lg"
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-5 backdrop-blur-xl sm:px-6">
              <div className="min-w-0">
                <h2 className="truncate font-black uppercase tracking-tighter text-xl text-white">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                autoFocus
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-gray-400 transition-colors hover:border-white/[0.12] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {children}
            </div>

            {footer ? (
              <footer className="border-t border-white/[0.06] px-5 py-4 sm:px-6">
                {footer}
              </footer>
            ) : null}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
