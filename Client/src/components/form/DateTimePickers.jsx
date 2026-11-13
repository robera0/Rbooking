import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { formatDate, formatTime, timeOptions } from "@/lib/eventForm";

// Our own date and time pickers, in the app's colours, instead of the
// browser's. Both open in a small panel under the box (a sheet from the bottom
// on a phone) and close when you pick, press Escape or click away.

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const SHEET_BREAKPOINT = 900;

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Opens a floating panel anchored to a button.
function usePopover() {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const [sheet, setSheet] = useState(false);
  const anchorRef = useRef(null);
  const popRef = useRef(null);

  const place = () => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    if (window.innerWidth <= SHEET_BREAKPOINT) {
      setSheet(true);
      setStyle({});
      return;
    }
    setSheet(false);
    const r = anchor.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    let top = r.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
    const left = Math.min(window.innerWidth - w - 8, Math.max(8, r.right - w));
    setStyle({ top, left });
  };

  useLayoutEffect(() => {
    if (open) place();
  });

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (popRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onMove = () => place();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  return { open, setOpen, anchorRef, popRef, style, sheet };
}

const Panel = ({ pop, children, width }) =>
  createPortal(
    <div
      ref={pop.popRef}
      role="dialog"
      style={pop.sheet ? undefined : { ...pop.style, width }}
      className={`z-[200] rounded-2xl border border-white/[0.14] bg-[#1c1f22] p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.65)] ${
        pop.sheet ? "fixed inset-x-3 bottom-3" : "fixed"
      }`}
    >
      {children}
    </div>,
    document.body,
  );

const boxClass = (open, bad) =>
  `inline-flex min-w-0 flex-1 items-center justify-between gap-2 whitespace-nowrap rounded-[10px] border-[1.5px] bg-[#23272b] px-3 py-[9px] text-[14px] font-semibold leading-[1.3] text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
    open
      ? "border-[#FF7A00] shadow-[0_0_0_3px_rgba(255,122,0,0.12)]"
      : bad
      ? "border-red-500"
      : "border-white/[0.16] hover:border-white/[0.28]"
  }`;

// ─── Date ───────────────────────────────────────────────────────────────────
export const DatePickerField = ({ value, onChange, min = "", disabled, invalid, label }) => {
  const pop = usePopover();
  const todayStr = ymd(new Date());
  const [month, setMonth] = useState(() => {
    const base = value ? new Date(`${value}T00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const toggle = () => {
    if (!pop.open) {
      const base = value ? new Date(`${value}T00:00`) : min ? new Date(`${min}T00:00`) : new Date();
      setMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    }
    pop.setOpen(!pop.open);
  };

  const days = useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    const first = new Date(y, m, 1).getDay();
    const count = new Date(y, m + 1, 0).getDate();
    const cells = Array.from({ length: first }, () => null);
    for (let d = 1; d <= count; d += 1) {
      cells.push(`${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return cells;
  }, [month]);

  const prevMonthEnd = ymd(new Date(month.getFullYear(), month.getMonth(), 0));
  const canGoBack = !min || prevMonthEnd >= min;

  return (
    <>
      <button
        ref={pop.anchorRef}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={pop.open}
        onClick={toggle}
        className={boxClass(pop.open, invalid)}
      >
        <span className={value ? "" : "font-medium text-[#5b6067]"}>
          {value ? formatDate(value) : "Pick a date"}
        </span>
        <CalendarDays size={16} className={pop.open ? "text-[#FF7A00]" : "text-[#8b9097]"} />
      </button>
      {pop.open && (
        <Panel pop={pop} width={288}>
          <div className="mb-2.5 flex items-center justify-between">
            <button
              type="button"
              disabled={!canGoBack}
              aria-label="Previous month"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-[10px] border border-white/[0.07] bg-[#23272b] hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <b className="text-[15px]">
              {MONTHS[month.getMonth()]} {month.getFullYear()}
            </b>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-[10px] border border-white/[0.07] bg-[#23272b] hover:border-white/25"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-[3px] text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="py-1.5 text-[11px] font-bold text-[#5b6067]">
                {d}
              </div>
            ))}
            {days.map((d, i) =>
              d === null ? (
                <span key={`b${i}`} />
              ) : (
                <button
                  key={d}
                  type="button"
                  disabled={Boolean(min && d < min)}
                  onClick={() => {
                    onChange(d);
                    pop.setOpen(false);
                  }}
                  className={`aspect-square rounded-[10px] text-[14px] font-semibold transition disabled:cursor-not-allowed disabled:text-[#4a4f55] ${
                    value === d
                      ? "bg-[#FF7A00] font-extrabold text-[#111]"
                      : `hover:bg-white/[0.08] ${d === todayStr ? "shadow-[inset_0_0_0_1.5px_rgba(255,122,0,0.55)]" : ""}`
                  }`}
                >
                  {Number(d.slice(8))}
                </button>
              ),
            )}
          </div>
        </Panel>
      )}
    </>
  );
};

// ─── Time ───────────────────────────────────────────────────────────────────
const TIMES = timeOptions(15);

export const TimePickerField = ({ value, onChange, disabled, invalid, label, isDisabled }) => {
  const pop = usePopover();
  const listRef = useRef(null);

  useEffect(() => {
    if (!pop.open || !listRef.current) return;
    const target =
      listRef.current.querySelector("[data-selected='true']") ||
      listRef.current.querySelector("[data-time='19:00']");
    if (target) listRef.current.scrollTop = Math.max(0, target.offsetTop - 80);
  }, [pop.open]);

  return (
    <>
      <button
        ref={pop.anchorRef}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={pop.open}
        onClick={() => pop.setOpen(!pop.open)}
        className={boxClass(pop.open, invalid)}
      >
        <span className={value ? "" : "font-medium text-[#5b6067]"}>
          {value ? formatTime(value) : "Pick a time"}
        </span>
        <Clock size={16} className={pop.open ? "text-[#FF7A00]" : "text-[#8b9097]"} />
      </button>
      {pop.open && (
        <Panel pop={pop} width={168}>
          <div ref={listRef} className="grid max-h-[264px] gap-0.5 overflow-auto sm:max-h-[264px] max-lg:max-h-[40vh]">
            {TIMES.map((t) => (
              <button
                key={t}
                type="button"
                data-time={t}
                data-selected={value === t}
                disabled={Boolean(isDisabled?.(t))}
                onClick={() => {
                  onChange(t);
                  pop.setOpen(false);
                }}
                className={`rounded-[9px] px-3 py-[9px] text-left text-[14px] font-semibold transition disabled:cursor-not-allowed disabled:text-[#4a4f55] ${
                  value === t ? "bg-[#FF7A00] font-extrabold text-[#111]" : "hover:bg-white/[0.08]"
                }`}
              >
                {formatTime(t)}
              </button>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
};
