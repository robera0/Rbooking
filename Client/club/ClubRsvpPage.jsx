import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const clubOptions = [
  {
    id: "midnight-echo",
    name: "Midnight Echo",
    city: "Los Angeles",
    vibe: "Live jazz · Rooftop lounge",
    rating: 4.9,
    price: "$120",
    color: "from-[#FF7A00] to-[#FFB067]",
    cover:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
    description:
      "An intimate late-night lounge with a live DJ, handcrafted cocktails, and a striped velvet VIP section.",
    openSlots: 14,
    nextBest: "Tonight · 9:30 PM",
  },
  {
    id: "velvet-room",
    name: "Velvet Room",
    city: "New York",
    vibe: "High-energy club · Bottle service",
    rating: 4.8,
    price: "$180",
    color: "from-[#A855F7] to-[#7C3AED]",
    cover:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    description:
      "A premium nightlife destination with a skyline terrace, private booths, and curated guest-list experiences.",
    openSlots: 9,
    nextBest: "Saturday · 11:00 PM",
  },
  {
    id: "silver-lane",
    name: "Silver Lane",
    city: "Miami",
    vibe: "House music · Coastal patio",
    rating: 4.7,
    price: "$150",
    color: "from-[#38BDF8] to-[#2563EB]",
    cover:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80",
    description:
      "A warm, neon-lit dance floor and a sea-facing patio designed for elevated after-hours gatherings.",
    openSlots: 11,
    nextBest: "Friday · 10:15 PM",
  },
  {
    id: "sunset-lane",
    name: "Sunset Lane",
    city: "Chicago",
    vibe: "Indie house · Sunset terrace",
    rating: 4.8,
    price: "$140",
    color: "from-[#F59E0B] to-[#FB7185]",
    cover:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
    description:
      "A rooftop club experience with warm lighting, glow cocktails, and a soft after-hours crowd ready to dance.",
    openSlots: 12,
    nextBest: "Friday · 10:00 PM",
  },
  {
    id: "ember-room",
    name: "Ember Room",
    city: "Austin",
    vibe: "Electric set · Lounge bar",
    rating: 4.9,
    price: "$190",
    color: "from-[#F97316] to-[#EF4444]",
    cover:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=900&q=80",
    description:
      "A moody, high-energy lounge focused on late-night sets, velvet seating, and premium bottle service.",
    openSlots: 8,
    nextBest: "Saturday · 12:30 AM",
  },
  {
    id: "nova-atelier",
    name: "Nova Atelier",
    city: "Seattle",
    vibe: "Minimal luxe · DJ sessions",
    rating: 4.7,
    price: "$130",
    color: "from-[#22D3EE] to-[#14B8A6]",
    cover:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    description:
      "A polished nightlife lounge with curated sets, a lounge terrace, and a refined guest-experience flow.",
    openSlots: 15,
    nextBest: "Thursday · 9:45 PM",
  },
  {
    id: "crimson-park",
    name: "Crimson Park",
    city: "Boston",
    vibe: "Mainroom energy · VIP booths",
    rating: 4.8,
    price: "$170",
    color: "from-[#F43F5E] to-[#7C2D12]",
    cover:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80",
    description:
      "An iconic nightlife venue known for its glowing dance floor, elevated booth service, and city-night atmosphere.",
    openSlots: 10,
    nextBest: "Sunday · 11:15 PM",
  },
];

const floorTables = [
  {
    id: "A1",
    section: "Main Dance Floor",
    seats: 2,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "A2",
    section: "Main Dance Floor",
    seats: 4,
    status: "reserved",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "A3",
    section: "Main Dance Floor",
    seats: 6,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "B1",
    section: "VIP Deck",
    seats: 4,
    status: "selected",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "B2",
    section: "VIP Deck",
    seats: 8,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "B3",
    section: "VIP Deck",
    seats: 2,
    status: "reserved",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "C1",
    section: "Rooftop Terrace",
    seats: 6,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "C2",
    section: "Rooftop Terrace",
    seats: 4,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "C3",
    section: "Rooftop Terrace",
    seats: 8,
    status: "reserved",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "D1",
    section: "Private Booths",
    seats: 10,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "D2",
    section: "Private Booths",
    seats: 6,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "D3",
    section: "Private Booths",
    seats: 4,
    status: "reserved",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
  },
];

const vipPasses = [
  {
    id: "gold",
    name: "Gold Pass",
    price: "$89",
    perks: ["Priority entry", "2 drinks", "Table priority"],
  },
  {
    id: "platinum",
    name: "Platinum Pass",
    price: "$149",
    perks: ["Fast lane", "Bottle service access", "Guest list priority"],
  },
  {
    id: "royal",
    name: "Royal Pass",
    price: "$249",
    perks: ["Private host", "VIP booth", "Complimentary valet"],
  },
];

const tabs = [
  { id: "explore", label: "Explore Clubs" },
  { id: "floor", label: "Floor Plan & Tables" },
  { id: "checkout", label: "Reservation Checkout" },
  { id: "passes", label: "My VIP Passes" },
];

const paymentMethods = [
  { id: "card", label: "Card ending in 4242" },
  { id: "paypal", label: "PayPal" },
  { id: "wallet", label: "Wallet" },
];

function ClubRsvpPage() {
  const navigate = useNavigate();
  const [selectedClubId, setSelectedClubId] = useState(clubOptions[0].id);
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedDate, setSelectedDate] = useState("2026-10-15");
  const [partySize, setPartySize] = useState(4);
  const [selectedTable, setSelectedTable] = useState("B1");
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [selectedPass, setSelectedPass] = useState("platinum");
  const [reservationPlaced, setReservationPlaced] = useState(false);

  const selectedClub = useMemo(
    () =>
      clubOptions.find((club) => club.id === selectedClubId) ?? clubOptions[0],
    [selectedClubId],
  );

  const availableTables = useMemo(
    () => floorTables.filter((table) => table.status !== "reserved"),
    [],
  );

  const totalEstimate = useMemo(() => {
    const base =
      Number.parseInt(selectedClub.price.replace(/[^\d]/g, ""), 10) || 120;
    const passPremium = vipPasses.find(
      (pass) => pass.id === selectedPass,
    )?.price;
    const passValue =
      Number.parseInt(String(passPremium).replace(/[^\d]/g, ""), 10) || 0;
    return base + passValue + 18;
  }, [selectedClub, selectedPass]);

  const handleReserve = () => {
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
      pass: vipPasses.find((pass) => pass.id === selectedPass)?.name ?? "VIP",
      passPrice:
        vipPasses.find((pass) => pass.id === selectedPass)?.price ?? "$0",
      total: `$${totalEstimate}`,
      venue: selectedClub.city,
      status: "paid",
      createdAt: new Date().toISOString(),
      theme: clubTheme,
    };

    localStorage.setItem(
      "clubRsvpReservation",
      JSON.stringify(reservationData),
    );
    setReservationPlaced(true);
    setActiveTab("passes");

    toast.success(
      `Table reserved at ${selectedClub.name}! Your RSVP is now on the ticket page.`,
      {
        duration: 2500,
        position: "top-center",
      },
    );

    navigate("/tickets_home");
  };

  return (
    <div className="min-h-screen bg-[#121417] text-white">
      <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-10">
        <header className="mb-6 rounded-[2rem] border border-white/[0.04] bg-[#1A1D20]/90 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#FF7A00]">
                Club RSVP
              </p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white md:text-5xl">
                My <span className="text-[#FF7A00]">Club Reservation</span>
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                {selectedClub.name} · {selectedClub.city} ·{" "}
                {selectedClub.nextBest}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-[#FF7A00]/35 bg-[#FF7A00]/10 px-4 py-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFB067]">
                Live availability
              </span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-white/[0.04] bg-[#1A1D20] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-gray-500">
              Venue shortlist
            </p>
            <div className="space-y-3">
              {clubOptions.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => setSelectedClubId(club.id)}
                  className={`w-full rounded-[1.5rem] border p-3 text-left transition-all ${
                    selectedClubId === club.id
                      ? "border-[#FF7A00]/60 bg-[#FF7A00]/10 shadow-[0_0_0_1px_rgba(255,122,0,0.35)]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${club.color}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-black uppercase tracking-[0.08em] text-white">
                          {club.name}
                        </p>
                        <span className="text-[10px] font-bold text-[#FFB067]">
                          {club.rating}★
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        {club.city}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="space-y-6">
            <section className="rounded-[2rem] border border-white/[0.04] bg-[#1A1D20] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)] sm:p-5">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                      activeTab === tab.id
                        ? "bg-white text-[#121417]"
                        : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </section>

            {activeTab === "explore" && (
              <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_360px]">
                <div className="overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#1A1D20] shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                  <div className="relative">
                    <img
                      src={selectedClub.cover}
                      alt={selectedClub.name}
                      className="h-72 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121417] via-transparent to-transparent" />
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF7A00]">
                          Featured venue
                        </p>
                        <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-white">
                          {selectedClub.name}
                        </h2>
                      </div>
                      <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                        {selectedClub.openSlots} open tables
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]">
                        {selectedClub.vibe}
                      </span>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]">
                        {selectedClub.nextBest}
                      </span>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]">
                        {selectedClub.price}/guest
                      </span>
                    </div>

                    <p className="text-sm leading-7 text-gray-300">
                      {selectedClub.description}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["Best for", "Date night"],
                        ["Dress code", "Smart chic"],
                        ["Arrival", "45 min prior"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-[1.5rem] border border-white/[0.05] bg-[#121417] p-3"
                        >
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                            {label}
                          </p>
                          <p className="mt-2 text-base font-bold text-white">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/[0.04] bg-[#1A1D20] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                    Quick reservation
                  </p>
                  <div className="mt-4 space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-gray-300">
                        Date
                      </span>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(event) =>
                          setSelectedDate(event.target.value)
                        }
                        className="w-full rounded-[1.25rem] border border-white/[0.08] bg-[#121417] px-3 py-2.5 text-white outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-gray-300">
                        Party size
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={partySize}
                        onChange={(event) =>
                          setPartySize(
                            Math.max(1, Number(event.target.value) || 1),
                          )
                        }
                        className="no-spinner w-full rounded-[1.25rem] border border-white/[0.08] bg-[#121417] px-3 py-2.5 text-white outline-none"
                      />
                    </label>

                    <div className="rounded-[1.5rem] border border-white/[0.06] bg-[#121417] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                        Suggested table
                      </p>
                      <p className="mt-2 text-xl font-black text-white">
                        Table {selectedTable}
                      </p>
                      <p className="text-sm text-gray-400">
                        Best fit for {partySize} guests
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("floor")}
                      className="w-full rounded-[1.25rem] bg-[#FF7A00] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-[#FF8E2B]"
                    >
                      Continue to floor plan
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "floor" && (
              <section className="rounded-[2rem] border border-white/[0.04] bg-[#1A1D20] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                      Floor plan
                    </p>
                    <h3 className="mt-1 text-2xl font-black uppercase tracking-[-0.03em] text-white">
                      {selectedClub.name}
                    </h3>
                  </div>
                  <div className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-300">
                    {availableTables.length} tables available
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {floorTables.map((table) => (
                    <button
                      key={table.id}
                      type="button"
                      disabled={table.status === "reserved"}
                      onClick={() => setSelectedTable(table.id)}
                      className={`overflow-hidden rounded-[1.5rem] border text-left transition-all ${
                        table.status === "reserved"
                          ? "cursor-not-allowed border-red-500/25 opacity-50"
                          : selectedTable === table.id
                          ? "border-[#FF7A00]/60 shadow-[0_0_0_1px_rgba(255,122,0,0.35)]"
                          : "border-white/[0.08] hover:border-white/10"
                      }`}
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(16,18,20,0.28) 0%, rgba(10,12,14,0.78) 65%, rgba(10,12,14,0.9) 100%), url(${table.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-lg font-black text-white">
                            Table {table.id}
                          </p>
                          <span
                            className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.14rem] ${
                              table.status === "reserved"
                                ? "bg-red-500/10 text-red-200"
                                : selectedTable === table.id
                                ? "bg-[#FF7A00]/15 text-[#FFB067]"
                                : "bg-emerald-500/10 text-emerald-200"
                            }`}
                          >
                            {table.status === "reserved"
                              ? "Booked"
                              : selectedTable === table.id
                              ? "Selected"
                              : "Open"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-200">
                          {table.section}
                        </p>
                        <p className="mt-1 text-sm text-gray-300/90">
                          Seats up to {table.seats}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <div className="rounded-[1.25rem] border border-white/[0.06] bg-[#121417] px-4 py-3 text-sm text-gray-300">
                    Selected:{" "}
                    <span className="font-bold text-white">
                      Table {selectedTable}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("checkout")}
                    className="rounded-[1.25rem] bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#121417] transition hover:bg-gray-200"
                  >
                    Proceed to checkout
                  </button>
                </div>
              </section>
            )}

            {activeTab === "checkout" && (
              <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_380px]">
                <div className="rounded-[2rem] border border-white/[0.04] bg-[#1A1D20] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.18rem] text-gray-500">
                    Reservation details
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-white/[0.06] bg-[#121417] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                          Venue
                        </p>
                        <p className="mt-2 text-xl font-black text-white">
                          {selectedClub.name}
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] border border-white/[0.06] bg-[#121417] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                          Date
                        </p>
                        <p className="mt-2 text-xl font-black text-white">
                          {selectedDate}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-white/[0.06] bg-[#121417] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                          Table
                        </p>
                        <p className="mt-2 text-xl font-black text-white">
                          Table {selectedTable}
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] border border-white/[0.06] bg-[#121417] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                          Guests
                        </p>
                        <p className="mt-2 text-xl font-black text-white">
                          {partySize}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-bold text-gray-300">
                        Payment method
                      </p>
                      <div className="space-y-3">
                        {paymentMethods.map((payment) => (
                          <button
                            key={payment.id}
                            type="button"
                            onClick={() => setSelectedPayment(payment.id)}
                            className={`flex w-full items-center justify-between rounded-[1.25rem] border p-3 text-left transition ${
                              selectedPayment === payment.id
                                ? "border-[#FF7A00]/60 bg-[#FF7A00]/10"
                                : "border-white/[0.06] bg-[#121417] hover:border-white/10 hover:bg-white/[0.02]"
                            }`}
                          >
                            <span className="text-sm font-medium text-gray-200">
                              {payment.label}
                            </span>
                            <span className="h-4 w-4 rounded-full border border-gray-400 bg-transparent ring-1 ring-white/20" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-dashed border-[#FF7A00]/35 bg-[#FF7A00]/5 p-4 text-sm text-[#FFD7B2]">
                      <p className="font-black uppercase tracking-[0.15em] text-[#FFB067]">
                        Priority note
                      </p>
                      <p className="mt-2 text-gray-200">
                        Your table is held for 30 minutes after check-in. A host
                        will greet you at the podium.
                      </p>
                    </div>
                  </div>
                </div>

                <aside className="rounded-[2rem] border border-white/[0.04] bg-[#1A1D20] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.18rem] text-gray-500">
                    Receipt
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-gray-300">
                    <div className="flex items-center justify-between">
                      <span>Club booking</span>
                      <span>{selectedClub.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reservation fee</span>
                      <span>$18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>VIP pass</span>
                      <span>
                        {vipPasses.find((pass) => pass.id === selectedPass)
                          ?.price ?? "$0"}
                      </span>
                    </div>
                    <div className="my-3 h-px bg-white/[0.08]" />
                    <div className="flex items-center justify-between text-base font-black text-white">
                      <span>Total</span>
                      <span>${totalEstimate}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReserve}
                    className="mt-6 w-full rounded-[1.25rem] bg-[#FF7A00] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-[#FF8E2B]"
                  >
                    Confirm reservation
                  </button>
                </aside>
              </section>
            )}

            {activeTab === "passes" && (
              <section className="rounded-[2rem] border border-white/[0.04] bg-[#1A1D20] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18rem] text-gray-500">
                      VIP access
                    </p>
                    <h3 className="mt-1 text-2xl font-black uppercase tracking-[-0.03em] text-white">
                      My VIP Passes
                    </h3>
                  </div>
                  {reservationPlaced && (
                    <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                      Reservation secured
                    </div>
                  )}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  {vipPasses.map((pass) => (
                    <button
                      key={pass.id}
                      type="button"
                      onClick={() => setSelectedPass(pass.id)}
                      className={`rounded-[1.5rem] border p-4 text-left transition ${
                        selectedPass === pass.id
                          ? "border-[#FF7A00]/60 bg-[#FF7A00]/10"
                          : "border-white/[0.06] bg-[#121417] hover:border-white/10 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xl font-black text-white">
                          {pass.name}
                        </span>
                        <span className="text-sm font-bold text-[#FFB067]">
                          {pass.price}
                        </span>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-gray-300">
                        {pass.perks.map((perk) => (
                          <li key={perk}>• {perk}</li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-white/[0.06] bg-[#121417] p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.18rem] text-gray-500">
                    Next stop
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-black text-white">
                        {selectedClub.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {selectedDate} · Table {selectedTable}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("checkout")}
                      className="rounded-[1.25rem] bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#121417] hover:bg-gray-200"
                    >
                      Review booking
                    </button>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ClubRsvpPage;
