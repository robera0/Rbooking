// src/superadmin/components/common/StatCard.jsx
// Summary KPI card used on the Revenue (and other) tabs.
// Maps to the aggregate fields returned by GET /api/superadmin/revenue-overview.

import { motion } from "framer-motion";

const TONES = {
  default: {
    iconWrap: "border-white/[0.06] bg-white/[0.03] text-gray-300",
    value: "text-white",
  },
  accent: {
    iconWrap: "border-[#FF7A00]/25 bg-[#FF7A00]/10 text-[#FF9A3D]",
    value: "text-white",
  },
  success: {
    iconWrap:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    value: "text-emerald-300",
  },
  danger: {
    iconWrap: "border-red-500/25 bg-red-500/10 text-red-400",
    value: "text-red-400",
  },
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  delay = 0,
  className = "",
}) {
  const palette = TONES[tone] || TONES.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-[1.5rem] border border-white/[0.06] bg-[#1C1F22] p-5 transition-colors hover:border-white/[0.1] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            {label}
          </p>
          <p
            className={`mt-2 truncate font-black tracking-tighter text-2xl leading-none md:text-3xl ${palette.value}`}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-xs font-medium text-gray-500">{hint}</p>
          ) : null}
        </div>

        {Icon ? (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${palette.iconWrap}`}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
