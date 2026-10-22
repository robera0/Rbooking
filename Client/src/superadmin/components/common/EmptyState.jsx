// src/superadmin/components/common/EmptyState.jsx
// Shared empty / no-results card so every list has a graceful zero state.

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  message = "Once there is data, it will show up in this space.",
  action = null,
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/[0.08] bg-[#1C1F22]/60 px-6 py-14 text-center ${className}`}
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-gray-500"
        aria-hidden="true"
      >
        <Icon className="h-6 w-6" />
      </span>

      <h3 className="mt-5 font-black uppercase tracking-tighter text-lg text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm font-medium text-gray-500">
        {message}
      </p>

      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
