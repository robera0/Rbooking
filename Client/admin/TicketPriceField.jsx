// Price input with a "Free" switch. A price of 0 means free; switching it
// off clears the field so the organizer types a real price.
export default function TicketPriceField({ value, onChange, placeholder = "Price" }) {
  const isFree = String(value) === "0";

  return (
    <div>
      <input
        type="number"
        min="0"
        step="any"
        inputMode="decimal"
        value={isFree ? "0" : (value ?? "")}
        disabled={isFree}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-transparent border-none font-black outline-none w-full placeholder:text-gray-400 ${
          isFree ? "text-gray-500" : "text-[#FF7A00]"
        }`}
      />
      <button
        type="button"
        role="switch"
        aria-checked={isFree}
        onClick={() => onChange(isFree ? "" : "0")}
        className="mt-2 flex items-center gap-2 select-none"
      >
        <span
          className={`w-7 h-4 rounded-full transition-all relative flex-shrink-0 ${
            isFree ? "bg-[#FF7A00]" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-[2px] w-3 h-3 bg-white rounded-full transition-all shadow ${
              isFree ? "left-[14px]" : "left-[2px]"
            }`}
          />
        </span>
        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
          Free
        </span>
      </button>
    </div>
  );
}
