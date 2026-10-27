import { useEffect, useState } from "react";
import { Check, Clock, Copy, RotateCcw, Save } from "lucide-react";
import {
  CLUB_DAYS,
  defaultOpeningHours,
  loadClubSettings,
  saveClubSettings,
} from "../src/lib/clubSettings";

const card = "rounded-2xl border border-white/[0.06] bg-[#1C1F22]";
const input = "rounded-xl border border-white/[0.07] bg-[#121417] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF7A00]/50";

export default function ClubSettings() {
  const [settings, setSettings] = useState(loadClubSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSettings(loadClubSettings());
    window.addEventListener("club-settings-updated", sync);
    return () => window.removeEventListener("club-settings-updated", sync);
  }, []);

  const updateDay = (day, patch) =>
    setSettings((current) => ({
      ...current,
      openingHours: current.openingHours.map((hour) =>
        hour.day === day ? { ...hour, ...patch } : hour,
      ),
    }));

  const save = (event) => {
    event.preventDefault();
    saveClubSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const copyToAllOpenDays = (sourceDay) => {
    const source = settings.openingHours.find((hour) => hour.day === sourceDay);
    if (!source) return;
    setSettings((current) => ({
      ...current,
      openingHours: current.openingHours.map((hour) =>
        hour.isOpen
          ? { ...hour, opensAt: source.opensAt, closesAt: source.closesAt }
          : hour,
      ),
    }));
  };

  return (
    <form onSubmit={save} className="w-full max-w-4xl space-y-8">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF7A00]">Club operations</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight md:text-5xl">Opening hours</h1>
        <p className="mt-3 text-sm text-gray-500">Choose which days guests can reserve and set the opening and closing time.</p>
      </header>

      <section className={`${card} space-y-4 p-5 sm:p-6`}>
        {settings.openingHours.map((hour) => (
          <div key={hour.day} className="rounded-2xl border border-white/[0.06] bg-[#121417] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-[#FF7A00]" />
                <span className="font-bold text-white">{CLUB_DAYS[hour.day]}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hour.isOpen}
                onClick={() => updateDay(hour.day, { isOpen: !hour.isOpen })}
                className={`relative h-6 w-11 rounded-full transition ${hour.isOpen ? "bg-[#FF7A00]" : "bg-white/10"}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${hour.isOpen ? "left-6" : "left-1"}`} />
              </button>
            </div>
            {hour.isOpen && (
              <div className="mt-4 flex items-center gap-3 pl-7">
                <input type="time" className={input} value={hour.opensAt} onChange={(e) => updateDay(hour.day, { opensAt: e.target.value })} />
                <span className="text-xs text-gray-500">to</span>
                <input type="time" className={input} value={hour.closesAt} onChange={(e) => updateDay(hour.day, { closesAt: e.target.value })} />
                <button
                  type="button"
                  onClick={() => copyToAllOpenDays(hour.day)}
                  title="Copy this time to every open day"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:border-[#FF7A00]/50 hover:text-[#FF7A00]"
                >
                  <Copy size={12} /> <span className="hidden sm:inline">Copy to open days</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className={`${card} flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6`}>
        <div>
          <p className="font-bold text-white">Accept reservations</p>
          <p className="mt-1 text-xs text-gray-500">Disable this when the club is not taking online bookings.</p>
        </div>
        <button type="button" onClick={() => setSettings((s) => ({ ...s, acceptsReservations: !s.acceptsReservations }))} className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${settings.acceptsReservations ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
          {settings.acceptsReservations ? "Accepting" : "Paused"}
        </button>
      </section>

      <div className="flex gap-3">
        <button type="submit" className="flex items-center gap-2 rounded-xl bg-[#FF7A00] px-6 py-3 text-[11px] font-black uppercase tracking-widest text-black hover:bg-white">
          {saved ? <Check size={14} /> : <Save size={14} />} {saved ? "Saved" : "Save hours"}
        </button>
        <button type="button" onClick={() => setSettings({ openingHours: defaultOpeningHours(), acceptsReservations: true, holdMinutes: 30 })} className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/[0.1]">
          <RotateCcw size={14} /> Defaults
        </button>
      </div>
    </form>
  );
}
