// src/superadmin/components/common/StatusChip.jsx
// Small uppercase pill for event status, scan result and user role.

import {
  ROLE_LABELS,
  ROLE_STYLES,
  SCAN_STATUS_LABELS,
  SCAN_STATUS_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "../../constants";

const REGISTRY = {
  event: { labels: STATUS_LABELS, styles: STATUS_STYLES },
  scan: { labels: SCAN_STATUS_LABELS, styles: SCAN_STATUS_STYLES },
  role: { labels: ROLE_LABELS, styles: ROLE_STYLES },
};

export default function StatusChip({
  value,
  kind = "event",
  label,
  className = "",
  pulse = false,
  dot = false,
}) {
  const registry = REGISTRY[kind] || REGISTRY.event;
  const text = label ?? registry.labels[value] ?? String(value ?? "").toUpperCase();
  const style = registry.styles[value] ?? "border-white/10 bg-white/5 text-gray-300";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]",
        style,
        pulse ? "animate-pulse" : "",
        className,
      ].join(" ")}
    >
      {dot ? (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      ) : null}
      {text}
    </span>
  );
}
