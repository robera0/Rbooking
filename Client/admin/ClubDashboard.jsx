import { useMemo, useState, useEffect } from "react";
import {
  CalendarCheck,
  Clock,
  Sofa,
  CheckCircle2,
  Filter,
  Calendar,
  Wallet,
} from "lucide-react";
import { loadFloorPlan } from "../src/lib/clubFloorPlan";

const card = "bg-[#1C1F22] border border-white/[0.06] rounded-2xl";

const todayISO = () => new Date().toISOString().slice(0, 10);

const readReservation = () => {
  try {
    const raw = localStorage.getItem("clubRsvpReservation");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const ClubDashboard = () => {
  const [floorPlan, setFloorPlan] = useState(() => loadFloorPlan());
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [activeFirst, setActiveFirst] = useState(true);

  useEffect(() => {
    const sync = () => setFloorPlan(loadFloorPlan());
    window.addEventListener("storage", sync);
    const id = setInterval(sync, 2000);
    return () => {
      window.removeEventListener("storage", sync);
      clearInterval(id);
    };
  }, []);

  const reservation = useMemo(readReservation, []);

  const bookedIds = useMemo(() => {
    const set = new Set();
    for (const item of floorPlan) {
      if (item.status === "reserved") set.add(item.id);
    }
    if (reservation && reservation.date === selectedDate) {
      set.add(reservation.table);
    }
    return set;
  }, [floorPlan, reservation, selectedDate]);

  const itemsWithState = useMemo(
    () =>
      floorPlan.map((item) => ({
        ...item,
        booked: bookedIds.has(item.id),
        active: item.status !== "reserved" && !bookedIds.has(item.id),
      })),
    [floorPlan, bookedIds],
  );

  const revenueToday = useMemo(() => {
    let total = 0;
    if (reservation && reservation.date === selectedDate) {
      const num = Number(String(reservation.total || "").replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) total += num;
    }
    return total;
  }, [reservation, selectedDate]);

  const sortedItems = useMemo(() => {
    const list = [...itemsWithState];
    if (activeFirst) {
      list.sort((a, b) => Number(b.active) - Number(a.active));
    }
    return list;
  }, [itemsWithState, activeFirst]);

  const bookedToday = itemsWithState.filter((i) => i.booked).length;
  const activeToday = itemsWithState.filter((i) => i.active).length;
  const totalSeats = itemsWithState.reduce((sum, i) => sum + (i.seats || 0), 0);

  return (
    <div className="w-full max-w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-5xl uppercase tracking-tighter leading-none">
            Club <span className="text-[#FF7A00]">Dashboard</span>
          </h1>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
            Daily table bookings and active tables
          </p>
        </div>
      </div>

      {/* Date + filter controls */}
      <div className={`${card} p-5 flex flex-wrap items-center gap-4`}>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#FF7A00]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#FF7A00]/50 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveFirst((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors ${
            activeFirst
              ? "bg-[#FF7A00] text-black"
              : "bg-white/[0.04] text-gray-300 hover:bg-white/[0.08]"
          }`}
        >
          <Filter size={14} />
          {activeFirst ? "Active tables on top" : "Default order"}
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-6">
        <div className={`${card} flex-1 min-w-[200px] p-6`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Tables booked today
            </p>
            <CalendarCheck size={18} className="text-[#FDC142]" />
          </div>
          <p className="text-4xl font-black text-white">{bookedToday}</p>
          <p className="text-[11px] text-gray-500 mt-2">
            For {selectedDate}
          </p>
        </div>
        <div className={`${card} flex-1 min-w-[200px] p-6`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Active tables today
            </p>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <p className="text-4xl font-black text-white">{activeToday}</p>
          <p className="text-[11px] text-gray-500 mt-2">
            Available right now
          </p>
        </div>
        <div className={`${card} flex-1 min-w-[200px] p-6`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Total seats
            </p>
            <Sofa size={18} className="text-[#FF7A00]" />
          </div>
          <p className="text-4xl font-black text-white">{totalSeats}</p>
          <p className="text-[11px] text-gray-500 mt-2">
            Across all seating options
          </p>
        </div>
        <div className={`${card} flex-1 min-w-[200px] p-6`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Revenue today
            </p>
            <Wallet size={18} className="text-[#FF7A00]" />
          </div>
          <p className="text-4xl font-black text-white">
            ETB {revenueToday.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 mt-2">
            For {selectedDate}
          </p>
        </div>
      </div>

      {/* Seating list */}
      <div className={`${card} p-5 space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Seating for {selectedDate}
          </h2>
          <span className="text-[10px] text-gray-500">
            {sortedItems.length} options
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border overflow-hidden bg-[#121417] ${
                item.active
                  ? "border-emerald-500/30"
                  : item.booked
                  ? "border-red-500/30"
                  : "border-white/[0.06]"
              }`}
            >
              <div className="relative h-28">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name || item.id}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-600">
                    <Sofa size={20} />
                  </div>
                )}
                <span
                  className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                    item.active
                      ? "bg-emerald-500/80 text-white"
                      : item.booked
                      ? "bg-red-500/80 text-white"
                      : "bg-gray-500/80 text-white"
                  }`}
                >
                  {item.active ? "Active" : item.booked ? "Booked" : "Inactive"}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <p className="font-black text-white text-sm">
                  {item.name || item.id}
                </p>
                <p className="text-[11px] text-gray-400">
                  {item.section} · {item.type} · {item.privacy} · {item.seats} seats
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClubDashboard;
