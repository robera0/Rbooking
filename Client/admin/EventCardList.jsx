import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, MapPin, CalendarDays } from "lucide-react";
import { isPostponed, isDateTbd } from "@/lib/postponed";
import EventStatusBadge from "./EventStatusBadge";

// The events list on a phone: one card per event, so the name is always fully
// readable. The less common actions live behind the three-dots menu.
const Menu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-gray-300 active:scale-95"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div role="menu" className="absolute bottom-12 right-0 z-30 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#23272b] py-1 shadow-2xl">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className="block w-full px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/[0.06]"
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const EventCardList = ({ events, selected, onSelect, rowKey, loading }) => {
  const navigate = useNavigate();

  if (loading) return <p className="py-8 text-center text-gray-400">Loading events...</p>;
  if (!events?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.12] py-10 text-center">
        <p className="font-semibold text-white">No event created.</p>
        <p className="mt-2 text-sm text-gray-400">Create your first event to get started.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {events.map((ev, idx) => {
        const key = rowKey(ev, idx);
        const isSelected = selected.includes(key);
        const date = isDateTbd(ev) ? "Date TBA" : ev?.dates?.start?.localDate || "N/A";
        const id = ev?._id;
        return (
          <li
            key={key}
            className={`rounded-2xl border p-4 ${isSelected ? "border-red-500/40 bg-red-500/[0.05]" : "border-white/[0.06] bg-[#15181b]"}`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                aria-label={`Select ${ev?.name}`}
                className="mt-1 h-4 w-4 flex-none accent-[#FF7A00]"
                checked={isSelected}
                onChange={() => onSelect(key)}
              />
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/events/${id}/sales`)}
                  className="block w-full text-left text-base font-bold leading-snug text-white break-words"
                >
                  {ev?.name}
                </button>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#FF7A00]">{ev?.type}</p>
              </div>
              <div className="flex-none"><EventStatusBadge event={ev} /></div>
            </div>

            <div className="mt-3 space-y-1.5 text-sm text-gray-400">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-none" />
                <span className="break-words">{ev?.links?.venues?.name || ev?.locale || "N/A"}</span>
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays size={14} className="flex-none" />
                {date}
                {isPostponed(ev) && ev?.dates?.postponedFrom?.localDate && (
                  <span className="text-xs text-gray-500">(was {ev.dates.postponedFrom.localDate})</span>
                )}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sold</p>
                <p className="font-black text-white">
                  {ev?.sales?.sold ?? 0}
                  <span className="font-bold text-gray-500"> / {ev?.sales?.capacity ?? 0}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Net revenue</p>
                <p className="font-black text-white">{(ev?.sales?.netRevenue ?? 0).toLocaleString()} ETB</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/admin/events/${id}`)}
                className="flex-1 rounded-xl bg-[#FF7A00] py-2.5 text-sm font-extrabold text-black active:scale-95"
              >
                Edit
              </button>
              <Menu
                items={[
                  { label: "View sales", onClick: () => navigate(`/admin/events/${id}/sales`) },
                  { label: "Get QR", onClick: () => navigate(`/admin/events/${id}/qr`) },
                  { label: "Invitation tickets", onClick: () => navigate(`/admin/events/${id}/invitation_qr`) },
                ]}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default EventCardList;
