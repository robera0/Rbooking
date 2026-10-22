// src/superadmin/components/common/SearchBar.jsx
// Debounce-friendly search input with a leading icon and a clear button.
// Client-side filtering only — mirrors the `?q=` query param the real endpoints will take.

import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search",
  id = "superadmin-search",
  className = "",
}) {
  const hasValue = Boolean(value && value.length);

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <div className="group relative flex items-center rounded-2xl border border-white/[0.06] bg-[#1C1F22] transition-colors focus-within:border-[#FF7A00]/50">
        <Search
          className="pointer-events-none absolute left-4 h-4 w-4 text-gray-500"
          aria-hidden="true"
        />

        <input
          id={id}
          type="search"
          inputMode="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="h-12 w-full bg-transparent pl-11 pr-11 text-sm font-medium text-white placeholder:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/50 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
        />

        {hasValue ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
