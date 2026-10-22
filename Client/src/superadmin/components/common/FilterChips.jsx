// src/superadmin/components/common/FilterChips.jsx
// Accessible single-select chip row used for admin / status / role filters.
// Client-side filtering only — mirrors the query params the real endpoints will take.

export default function FilterChips({
  options = [],
  value,
  onChange,
  ariaLabel = "Filter",
  allValue = "all",
  className = "",
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        const isAll = option.value === allValue;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            aria-label={`Filter by ${option.label}`}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60",
              active
                ? "border-[#FF7A00]/50 bg-[#FF7A00]/15 text-[#FF9A3D]"
                : "border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/[0.12] hover:text-white",
            ].join(" ")}
          >
            <span className="truncate">{isAll ? "All" : option.label}</span>

            {typeof option.count === "number" ? (
              <span
                className={[
                  "rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none",
                  active
                    ? "bg-[#FF7A00]/25 text-[#FFB066]"
                    : "bg-white/[0.06] text-gray-500",
                ].join(" ")}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
