import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Shirt,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data (mock). Prices are in ETB.                                     */
/* ------------------------------------------------------------------ */

const clubOptions = [
  {
    id: "midnight-echo",
    name: "Midnight Echo",
    area: "Bole",
    vibe: "Live jazz · Rooftop lounge",
    rating: 4.9,
    price: 1200,
    glow: "#FF7A00",
    cover:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    description:
      "An intimate late-night lounge with a live DJ, handcrafted cocktails, and a striped velvet VIP section.",
    openSlots: 14,
    nextBest: "Tonight · 9:30 PM",
  },
  {
    id: "velvet-room",
    name: "Velvet Room",
    area: "Kazanchis",
    vibe: "High-energy club · Bottle service",
    rating: 4.8,
    price: 1800,
    glow: "#A855F7",
    cover:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    description:
      "A premium nightlife destination with a skyline terrace, private booths, and curated guest-list experiences.",
    openSlots: 9,
    nextBest: "Saturday · 11:00 PM",
  },
  {
    id: "silver-lane",
    name: "Silver Lane",
    area: "Old Airport",
    vibe: "House music · Open patio",
    rating: 4.7,
    price: 1500,
    glow: "#38BDF8",
    cover:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
    description:
      "A warm, neon-lit dance floor and an open patio designed for elevated after-hours gatherings.",
    openSlots: 11,
    nextBest: "Friday · 10:15 PM",
  },
  {
    id: "sunset-lane",
    name: "Sunset Lane",
    area: "Sarbet",
    vibe: "Indie house · Sunset terrace",
    rating: 4.8,
    price: 1400,
    glow: "#F59E0B",
    cover:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    description:
      "A rooftop club experience with warm lighting, glow cocktails, and a soft after-hours crowd ready to dance.",
    openSlots: 12,
    nextBest: "Friday · 10:00 PM",
  },
  {
    id: "ember-room",
    name: "Ember Room",
    area: "Bole",
    vibe: "Electric set · Lounge bar",
    rating: 4.9,
    price: 1900,
    glow: "#EF4444",
    cover:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80",
    description:
      "A moody, high-energy lounge focused on late-night sets, velvet seating, and premium bottle service.",
    openSlots: 8,
    nextBest: "Saturday · 12:30 AM",
  },
  {
    id: "nova-atelier",
    name: "Nova Atelier",
    area: "CMC",
    vibe: "Minimal luxe · DJ sessions",
    rating: 4.7,
    price: 1300,
    glow: "#14B8A6",
    cover:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    description:
      "A polished nightlife lounge with curated sets, a lounge terrace, and a refined guest-experience flow.",
    openSlots: 15,
    nextBest: "Thursday · 9:45 PM",
  },
  {
    id: "crimson-park",
    name: "Crimson Park",
    area: "Piassa",
    vibe: "Mainroom energy · VIP booths",
    rating: 4.8,
    price: 1700,
    glow: "#F43F5E",
    cover:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
    description:
      "An iconic nightlife venue known for its glowing dance floor, elevated booth service, and city-night atmosphere.",
    openSlots: 10,
    nextBest: "Sunday · 11:15 PM",
  },
];

const floorTables = [
  { id: "A1", section: "Main Dance Floor", seats: 2, status: "available" },
  { id: "A2", section: "Main Dance Floor", seats: 4, status: "reserved" },
  { id: "A3", section: "Main Dance Floor", seats: 6, status: "available" },
  { id: "B1", section: "VIP Deck", seats: 4, status: "available" },
  { id: "B2", section: "VIP Deck", seats: 8, status: "available" },
  { id: "B3", section: "VIP Deck", seats: 2, status: "reserved" },
  { id: "C1", section: "Rooftop Terrace", seats: 6, status: "available" },
  { id: "C2", section: "Rooftop Terrace", seats: 4, status: "available" },
  { id: "C3", section: "Rooftop Terrace", seats: 8, status: "reserved" },
  { id: "D1", section: "Private Booths", seats: 10, status: "available" },
  { id: "D2", section: "Private Booths", seats: 6, status: "available" },
  { id: "D3", section: "Private Booths", seats: 4, status: "reserved" },
];

const sections = [...new Set(floorTables.map((t) => t.section))];

const vipPasses = [
  {
    id: "gold",
    name: "Gold Pass",
    price: 890,
    perks: ["Priority entry", "2 drinks", "Table priority"],
  },
  {
    id: "platinum",
    name: "Platinum Pass",
    price: 1490,
    perks: ["Fast lane", "Bottle service access", "Guest list priority"],
    popular: true,
  },
  {
    id: "royal",
    name: "Royal Pass",
    price: 2490,
    perks: ["Private host", "VIP booth", "Complimentary valet"],
  },
];

const steps = [
  { id: "explore", label: "Venue" },
  { id: "floor", label: "Table" },
  { id: "passes", label: "VIP Pass" },
  { id: "checkout", label: "Checkout" },
];

const paymentMethods = [
  { id: "telebirr", label: "Telebirr", hint: "Pay with receipt link" },
  { id: "cbe", label: "CBE Birr", hint: "Mobile wallet" },
  { id: "card", label: "Bank card", hint: "Visa / Mastercard" },
];

const RESERVATION_FEE = 180;
const etb = (n) => `ETB ${Number(n).toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

const card = "rounded-3xl bg-[#111214] border border-[#1f2023]";
const label = "text-[10px] text-gray-400 font-black uppercase tracking-widest";
const field =
  "w-full bg-[#0a0b0c] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-[#FF7A00]/50 outline-none transition-colors";

function Stepper({ active, onChange }) {
  const activeIndex = steps.findIndex((s) => s.id === active);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const current = index === activeIndex;

        return (
          <div key={step.id} className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onChange(step.id)}
              aria-current={current ? "step" : undefined}
              className="flex items-center gap-2 group"
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-colors ${
                  current
                    ? "bg-[#FF7A00] text-black"
                    : done
                    ? "bg-[#FF7A00]/15 text-[#FF7A00]"
                    : "bg-white/[0.05] text-gray-500 group-hover:text-white"
                }`}
              >
                {done ? <Check size={13} strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                  current
                    ? "text-white"
                    : "text-gray-500 group-hover:text-gray-300"
                }`}
              >
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <span className="w-6 sm:w-10 h-px bg-white/[0.08]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function ClubRsvpPage() {
  const navigate = useNavigate();
  const [selectedClubId, setSelectedClubId] = useState(clubOptions[0].id);
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedDate, setSelectedDate] = useState("2026-10-15");
  const [partySize, setPartySize] = useState(4);
  const [selectedTable, setSelectedTable] = useState("B1");
  const [selectedPayment, setSelectedPayment] = useState("telebirr");
  const [selectedPass, setSelectedPass] = useState("platinum");

  const selectedClub = useMemo(
    () =>
      clubOptions.find((club) => club.id === selectedClubId) ?? clubOptions[0],
    [selectedClubId],
  );

  const table = floorTables.find((t) => t.id === selectedTable);
  const pass = vipPasses.find((p) => p.id === selectedPass);
  const tableFits = Boolean(table && table.seats >= partySize);
  const availableCount = floorTables.filter(
    (t) => t.status !== "reserved" && t.seats >= partySize,
  ).length;

  const totalEstimate =
    selectedClub.price + (pass?.price ?? 0) + RESERVATION_FEE;

  const activeIndex = steps.findIndex((s) => s.id === activeTab);
  const isLast = activeIndex === steps.length - 1;

  const goNext = () => {
    if (activeTab === "floor" && !tableFits) {
      toast.error(
        `Table ${selectedTable} seats ${table?.seats}. Pick a bigger table.`,
      );
      return;
    }
    if (isLast) {
      handleReserve();
      return;
    }
    setActiveTab(steps[activeIndex + 1].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (activeIndex > 0) setActiveTab(steps[activeIndex - 1].id);
  };

  const handleReserve = () => {
    if (!tableFits) {
      toast.error("Choose a table that fits your party first");
      setActiveTab("floor");
      return;
    }

    const clubTheme = {
      bandGradient:
        "linear-gradient(120deg, #0EA5E9 0%, #7C3AED 38%, #F97316 100%)",
      accentColor: "#7DD3FC",
      ctaGradient:
        "linear-gradient(135deg, #0EA5E9 0%, #7C3AED 45%, #F97316 100%)",
    };

    const reservationData = {
      id: `club-rsvp-${Date.now()}`,
      type: "club-rsvp",
      club: selectedClub.name,
      date: selectedDate,
      table: selectedTable,
      pass: pass?.name ?? "VIP",
      passPrice: etb(pass?.price ?? 0),
      total: etb(totalEstimate),
      venue: selectedClub.area,
      status: "paid",
      createdAt: new Date().toISOString(),
      theme: clubTheme,
    };

    localStorage.setItem(
      "clubRsvpReservation",
      JSON.stringify(reservationData),
    );

    toast.success(
      `Table reserved at ${selectedClub.name}! Your RSVP is now on the ticket page.`,
      { duration: 2500, position: "top-center" },
    );

    navigate("/tickets_home");
  };

  return (
    <div className="min-h-screen bg-[#0a0b0c] text-[#f4f4f5]">
      {/* Ambient venue glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px] opacity-30 transition-colors duration-700"
        style={{
          background: `radial-gradient(60% 100% at 50% 0%, ${selectedClub.glow}55 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-4 pb-32 sm:px-6 lg:pb-16">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[13px] font-medium text-[#6b7280] hover:text-[#f4f4f5] transition-colors group"
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back
          </button>
        </div>

        {/* Header */}
        <header className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#FF7A00]">
            Club RSVP
          </p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-[-0.04em]">
            Reserve your <span className="text-[#FF7A00]">table</span>
          </h1>
          <p className="mt-2 text-[13px] text-[#6b7280]">
            Pick The best Clubs, choose your spot on the floor, and pay with
            Telebirr.
          </p>
        </header>

        {/* Venue picker: horizontal on mobile, always visible */}
        <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <div className="flex gap-3 w-max sm:w-auto sm:flex-wrap">
            {clubOptions.map((club) => {
              const selected = selectedClubId === club.id;
              return (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => setSelectedClubId(club.id)}
                  aria-pressed={selected}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all ${
                    selected
                      ? "border-[#FF7A00]/60 bg-[#FF7A00]/10"
                      : "border-[#1f2023] bg-[#111214] hover:border-white/20"
                  }`}
                >
                  <span
                    className="h-9 w-9 rounded-xl shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${club.glow}, ${club.glow}55)`,
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block text-[12px] font-black uppercase tracking-wide text-white whitespace-nowrap">
                      {club.name}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
                      {club.area} · {club.rating}★
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stepper */}
        <div className={`${card} p-4 mb-6`}>
          <Stepper active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* ---------------- Main column ---------------- */}
          <main className="min-w-0 space-y-6">
            {/* STEP 1: Venue */}
            {activeTab === "explore" && (
              <section className={`${card} overflow-hidden`}>
                <div className="relative">
                  <img
                    src={selectedClub.cover}
                    alt={selectedClub.name}
                    className="h-64 sm:h-80 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-[#111214]/30 to-transparent" />
                  <div className="absolute left-5 right-5 bottom-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">
                        Featured venue
                      </p>
                      <h2 className="mt-1 text-3xl font-black uppercase tracking-[-0.03em]">
                        {selectedClub.name}
                      </h2>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-200">
                      {selectedClub.openSlots} open tables
                    </span>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                    <Pill>{selectedClub.vibe}</Pill>
                    <Pill>{selectedClub.nextBest}</Pill>
                    <Pill>{etb(selectedClub.price)} / guest</Pill>
                  </div>

                  <p className="text-sm leading-7 text-gray-300">
                    {selectedClub.description}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      [Sparkles, "Best for", "Date night"],
                      [Shirt, "Dress code", "Smart chic"],
                      [Clock, "Arrival", "45 min prior"],
                    ].map(([Icon, k, v]) => (
                      <div
                        key={k}
                        className="rounded-2xl border border-[#1f2023] bg-[#0a0b0c] p-4"
                      >
                        <Icon size={15} className="text-[#FF7A00]" />
                        <p className={`${label} mt-3`}>{k}</p>
                        <p className="mt-1 text-base font-bold">{v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <label className="block">
                      <span className={`${label} mb-2 block`}>Date</span>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={field}
                      />
                    </label>

                    <label className="block">
                      <span className={`${label} mb-2 block`}>
                        Party size (1–12)
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={partySize}
                        onChange={(e) =>
                          setPartySize(
                            Math.min(
                              12,
                              Math.max(1, Number(e.target.value) || 1),
                            ),
                          )
                        }
                        className={`no-spinner ${field}`}
                      />
                    </label>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2: Floor plan */}
            {activeTab === "floor" && (
              <section className={`${card} p-5 sm:p-6`}>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className={label}>Floor plan</p>
                    <h3 className="mt-1 text-2xl font-black uppercase tracking-[-0.03em]">
                      {selectedClub.name}
                    </h3>
                  </div>
                  <span className="self-start rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300">
                    {availableCount} tables fit {partySize}{" "}
                    {partySize === 1 ? "guest" : "guests"}
                  </span>
                </div>

                {/* Stage */}
                <div
                  className="mb-5 rounded-2xl py-3 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/80"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${selectedClub.glow}40, transparent)`,
                    border: `1px solid ${selectedClub.glow}33`,
                  }}
                >
                  DJ · Stage
                </div>

                <div className="space-y-5">
                  {sections.map((section) => (
                    <div
                      key={section}
                      className="rounded-2xl border border-[#1f2023] bg-[#0a0b0c] p-4"
                    >
                      <p className={`${label} mb-3`}>{section}</p>
                      <div className="grid grid-cols-3 gap-3">
                        {floorTables
                          .filter((t) => t.section === section)
                          .map((t) => {
                            const booked = t.status === "reserved";
                            const tooSmall = !booked && t.seats < partySize;
                            const disabled = booked || tooSmall;
                            const selected = selectedTable === t.id;

                            return (
                              <button
                                key={t.id}
                                type="button"
                                disabled={disabled}
                                onClick={() => setSelectedTable(t.id)}
                                aria-pressed={selected}
                                aria-label={`Table ${t.id}, seats ${t.seats}${
                                  booked
                                    ? ", booked"
                                    : tooSmall
                                    ? ", too small"
                                    : ""
                                }`}
                                className={`rounded-2xl border p-3 text-left transition-all ${
                                  booked
                                    ? "cursor-not-allowed border-red-500/20 bg-red-500/[0.04] opacity-60"
                                    : tooSmall
                                    ? "cursor-not-allowed border-white/[0.05] opacity-40"
                                    : selected
                                    ? "border-[#FF7A00] bg-[#FF7A00]/10 shadow-lg shadow-[#FF7A00]/10"
                                    : "border-white/[0.08] bg-[#111214] hover:border-[#FF7A00]/40"
                                }`}
                              >
                                <p className="text-lg font-black">{t.id}</p>
                                <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                                  <Users size={11} /> {t.seats}
                                </p>
                                <p
                                  className={`mt-2 text-[9px] font-black uppercase tracking-widest ${
                                    booked
                                      ? "text-red-300"
                                      : tooSmall
                                      ? "text-gray-500"
                                      : selected
                                      ? "text-[#FFB067]"
                                      : "text-emerald-300"
                                  }`}
                                >
                                  {booked
                                    ? "Booked"
                                    : tooSmall
                                    ? "Too small"
                                    : selected
                                    ? "Selected"
                                    : "Open"}
                                </p>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-5 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span className="flex items-center gap-2">
                    <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    Open
                  </span>
                  <span className="flex items-center gap-2">
                    <i className="h-2.5 w-2.5 rounded-full bg-[#FF7A00]" />
                    Selected
                  </span>
                  <span className="flex items-center gap-2">
                    <i className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    Booked
                  </span>
                </div>
              </section>
            )}

            {/* STEP 3: VIP pass */}
            {activeTab === "passes" && (
              <section className={`${card} p-5 sm:p-6`}>
                <p className={label}>VIP access</p>
                <h3 className="mt-1 mb-5 text-2xl font-black uppercase tracking-[-0.03em]">
                  Choose your pass
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  {vipPasses.map((p) => {
                    const selected = selectedPass === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPass(p.id)}
                        aria-pressed={selected}
                        className={`relative rounded-2xl border p-5 text-left transition-all ${
                          selected
                            ? "border-[#FF7A00] bg-[#FF7A00]/10"
                            : "border-[#1f2023] bg-[#0a0b0c] hover:border-white/20"
                        }`}
                      >
                        {p.popular && (
                          <span className="absolute -top-2.5 left-4 rounded-full bg-[#FF7A00] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-black">
                            Popular
                          </span>
                        )}
                        <p className="text-lg font-black">{p.name}</p>
                        <p className="mt-1 text-xl font-black text-[#FFB067]">
                          {etb(p.price)}
                        </p>
                        <ul className="mt-4 space-y-2 text-[13px] text-gray-300">
                          {p.perks.map((perk) => (
                            <li key={perk} className="flex items-start gap-2">
                              <Check
                                size={14}
                                className="mt-0.5 shrink-0 text-[#FF7A00]"
                                strokeWidth={3}
                              />
                              {perk}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* STEP 4: Checkout */}
            {activeTab === "checkout" && (
              <section className={`${card} p-5 sm:p-6`}>
                <p className={label}>Reservation details</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Venue", selectedClub.name],
                    ["Date", selectedDate],
                    ["Table", `Table ${selectedTable}`],
                    ["Guests", String(partySize)],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-2xl border border-[#1f2023] bg-[#0a0b0c] p-4"
                    >
                      <p className={label}>{k}</p>
                      <p className="mt-2 text-xl font-black">{v}</p>
                    </div>
                  ))}
                </div>

                {!tableFits && (
                  <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12px] font-bold text-red-300">
                    Table {selectedTable} seats {table?.seats}, but your party
                    is {partySize}. Go back and pick a bigger table.
                  </p>
                )}

                <p className={`${label} mt-6 mb-3`}>Payment method</p>
                <div className="space-y-3">
                  {paymentMethods.map((m) => {
                    const selected = selectedPayment === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedPayment(m.id)}
                        aria-pressed={selected}
                        className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-[#FF7A00]/60 bg-[#FF7A00]/10"
                            : "border-[#1f2023] bg-[#0a0b0c] hover:border-white/20"
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-bold">
                            {m.label}
                          </span>
                          <span className="block text-[11px] text-gray-500">
                            {m.hint}
                          </span>
                        </span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            selected ? "border-[#FF7A00]" : "border-white/20"
                          }`}
                        >
                          {selected && (
                            <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-[#FF7A00]/10 bg-[#FF7A00]/[0.04] px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF7A00]">
                    Priority note
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#9ca3af]">
                    Your table is held for 30 minutes after check-in. A host
                    will greet you at the podium.
                  </p>
                </div>
              </section>
            )}

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={activeIndex === 0}
                className="flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:border-[#FF7A00] hover:text-[#FF7A00] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 rounded-2xl bg-[#FF7A00] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[#FF7A00]/10 transition-colors hover:bg-[#ff8f1f]"
              >
                {isLast ? "Confirm reservation" : "Continue"}
                <ArrowRight size={14} strokeWidth={3} />
              </button>
            </div>
          </main>

          {/* ---------------- Summary (desktop) ---------------- */}
          <aside className="hidden lg:block">
            <div className={`${card} sticky top-6 overflow-hidden`}>
              <img
                src={selectedClub.cover}
                alt=""
                className="h-28 w-full object-cover"
              />
              <div className="p-5">
                <p className="text-lg font-black uppercase">
                  {selectedClub.name}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                  <MapPin size={11} /> {selectedClub.area}, Addis Ababa
                  <Star size={11} className="ml-2 text-[#FFB067]" />
                  {selectedClub.rating}
                </p>

                <div className="my-4 h-px bg-white/[0.06]" />

                <div className="space-y-3 text-sm text-gray-300">
                  <Row k="Date" v={selectedDate} />
                  <Row k="Table" v={`${selectedTable} · ${partySize} guests`} />
                  <div className="my-1 h-px bg-white/[0.06]" />
                  <Row k="Club booking" v={etb(selectedClub.price)} />
                  <Row k="Reservation fee" v={etb(RESERVATION_FEE)} />
                  <Row k={pass?.name ?? "VIP pass"} v={etb(pass?.price ?? 0)} />
                  <div className="my-1 h-px bg-white/[0.06]" />
                  <div className="flex items-center justify-between text-base font-black text-white">
                    <span>Total</span>
                    <span className="text-[#FF7A00]">{etb(totalEstimate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ---------------- Mobile sticky bar ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#1f2023] bg-[#0a0b0c]/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              aria-label="Previous step"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 text-gray-400"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Total
            </p>
            <p className="truncate text-lg font-black text-[#FF7A00]">
              {etb(totalEstimate)}
            </p>
          </div>
          <button
            type="button"
            onClick={goNext}
            className="flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-[#FF7A00] px-5 text-[11px] font-black uppercase tracking-[0.18em] text-black"
          >
            {isLast ? "Confirm" : "Continue"}
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-400">{k}</span>
      <span className="text-right font-medium text-gray-200">{v}</span>
    </div>
  );
}

export default ClubRsvpPage;
