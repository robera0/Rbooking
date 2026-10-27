import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Calendar,
  Table as TableIcon,
  Phone,
  Wallet,
  Receipt,
  ClipboardList,
  LogOut,
} from "lucide-react";

const card = "bg-[#1C1F22] border border-white/[0.06] rounded-2xl";
const inputClass =
  "w-full bg-[#121417] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-[#FF7A00]/50 outline-none transition-colors";

const readReservations = () => {
  try {
    const raw = localStorage.getItem("clubRsvpReservations");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeReservations = (items) => {
  localStorage.setItem("clubRsvpReservations", JSON.stringify(items));
  window.dispatchEvent(new Event("club-reservations-updated"));
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const seedSampleReservation = () => ({
  id: "sample-rsvp-1",
  type: "club-rsvp",
  club: "Midnight Echo",
  cover: "",
  date: todayISO(),
  table: "PC1",
  seatName: "VIP Couch A",
  seatType: "couch",
  privacy: "private",
  pass: "Private",
  passPrice: "ETB 500",
  guests: 4,
  customerName: "Abebe Kebede",
  customerPhone: "+251911223344",
  customerEmail: "abebe@example.com",
  paymentMethod: "telebirr",
  receiptUrl: "https://example.com/receipt/123",
  total: "ETB 2,980",
  venue: "Bole",
  status: "paid",
  createdAt: new Date().toISOString(),
});

const ClubReservations = () => {
  const [reservations, setReservations] = useState(() => readReservations());
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const seeded = localStorage.getItem("clubRsvpSeeded");
    const current = readReservations();

    // Refresh the old sample that referenced a removed VIP Table.
    const hasStaleSample = current.some(
      (r) =>
        r.id === "sample-rsvp-1" &&
        (r.table === "VT1" || r.seatName === "VIP Table A"),
    );
    if (hasStaleSample) {
      const sample = seedSampleReservation();
      const updated = current.map((r) =>
        r.id === "sample-rsvp-1" ? sample : r,
      );
      localStorage.setItem("clubRsvpReservations", JSON.stringify(updated));
      setReservations(updated);
      return;
    }

    if (!seeded && current.length === 0) {
      const sample = seedSampleReservation();
      localStorage.setItem("clubRsvpReservations", JSON.stringify([sample]));
      localStorage.setItem("clubRsvpSeeded", "1");
      setReservations([sample]);
    }
  }, []);

  useEffect(() => {
    const sync = () => setReservations(readReservations());
    window.addEventListener("storage", sync);
    window.addEventListener("club-reservations-updated", sync);
    const id = setInterval(sync, 2000);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("club-reservations-updated", sync);
      clearInterval(id);
    };
  }, []);

  const markLeft = (reservation) => {
    if (!window.confirm(`Mark ${reservation.customerName || "this guest"} as left? The seat will become available again.`)) return;
    const updated = reservations.map((item) =>
      item.id === reservation.id
        ? { ...item, status: "left", leftAt: new Date().toISOString() }
        : item,
    );
    writeReservations(updated);
    try {
      const latest = JSON.parse(localStorage.getItem("clubRsvpReservation") || "null");
      if (latest?.id === reservation.id) {
        localStorage.setItem(
          "clubRsvpReservation",
          JSON.stringify({ ...latest, status: "left", leftAt: new Date().toISOString() }),
        );
      }
    } catch {
      /* ignore malformed legacy reservation data */
    }
    setReservations(updated);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations.filter((r) => {
      if (dateFilter && r.date !== dateFilter) return false;
      if (!q) return true;
      return [
        r.customerName,
        r.customerPhone,
        r.club,
        r.table,
        r.seatName,
        r.pass,
        r.paymentMethod,
        r.receiptUrl,
        r.venue,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [reservations, search, dateFilter]);

  const totalRevenue = useMemo(
    () =>
      filtered.reduce((sum, r) => {
        const num = Number(String(r.total || "").replace(/[^0-9.]/g, ""));
        return sum + (isNaN(num) ? 0 : num);
      }, 0),
    [filtered],
  );

  return (
    <div className="w-full max-w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-5xl uppercase tracking-tighter leading-none">
            RSVP <span className="text-[#FF7A00]">Table</span>
          </h1>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
            People who reserved tables
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={`${card} p-5 flex flex-wrap items-center gap-4`}>
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, club, table..."
            className={inputClass}
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-[#FF7A00]/50 outline-none"
        />
        {dateFilter && (
          <button
            type="button"
            onClick={() => setDateFilter("")}
            className="px-4 py-3 bg-white/[0.04] text-gray-300 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-white/[0.08]"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-6">
        <div className={`${card} flex-1 min-w-[180px] p-6`}>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
            Total reservations
          </p>
          <p className="text-3xl font-black text-white">{filtered.length}</p>
        </div>
        <div className={`${card} flex-1 min-w-[180px] p-6`}>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
            Total revenue
          </p>
          <p className="text-3xl font-black text-[#FF7A00]">
            ETB {totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#121417] text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="text-left px-4 py-3">Guest</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Club</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Arrival</th>
                <th className="text-left px-4 py-3">Table</th>
                <th className="text-left px-4 py-3">Guests</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Receipt</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center px-4 py-8 text-gray-500 text-[12px]"
                  >
                    No reservations found.
                  </td>
                </tr>
              )}
              {filtered.map((r, idx) => (
                <tr
                  key={r.id || idx}
                  className="border-t border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-bold text-white">
                    {r.customerName || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <span className="flex items-center gap-1">
                      <Phone size={11} /> {r.customerPhone || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{r.club || "—"}</td>
                  <td className="px-4 py-3 text-gray-300">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {r.date || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{r.arrivalTime || "—"}</td>
                  <td className="px-4 py-3 text-gray-300">
                    <span className="flex items-center gap-1">
                      <TableIcon size={11} /> {r.table || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {r.guests ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{r.pass || "—"}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {r.paymentMethod || "—"}
                  </td>
                  <td className="px-4 py-3 font-bold text-[#FF7A00]">
                    {r.total || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-[160px] truncate">
                    {r.receiptUrl ? (
                      <a
                        href={r.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[#FF7A00] hover:underline"
                      >
                        <Receipt size={11} /> link
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${r.status === "left" ? "bg-gray-500/15 text-gray-400" : "bg-emerald-500/15 text-emerald-300"}`}>
                      {r.status === "left" ? "Left" : r.status || "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status !== "left" && r.status !== "cancelled" ? (
                      <button type="button" onClick={() => markLeft(r)} className="flex items-center gap-1.5 rounded-lg bg-[#FF7A00]/10 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-[#FF7A00] hover:bg-[#FF7A00] hover:text-black">
                        <LogOut size={11} /> Mark left
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-600">Released</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClubReservations;
