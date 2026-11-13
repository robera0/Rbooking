const etb = (n) => `${(n ?? 0).toLocaleString()} ETB`;

const Tile = ({ label, value, tone }) => (
  <div className="rounded-2xl border border-white/[0.06] bg-[#1A1D20] px-5 py-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
      {label}
    </p>
    <p
      className={`mt-1 text-xl font-black tabular-nums ${tone || "text-white"}`}
    >
      {value}
    </p>
  </div>
);

// Tickets sold, money paid, refunds and net revenue for whatever the page is
// currently showing.
const SalesSummary = ({ summary, isLoading = false }) => (
  <div
    className="grid grid-cols-2 gap-3 md:grid-cols-4"
    aria-busy={isLoading}
    aria-label="Sales summary"
  >
    <Tile label="Tickets sold" value={summary?.tickets ?? 0} />
    <Tile label="Paid" value={etb(summary?.grossCollected)} />
    <Tile label="Refunded" value={etb(summary?.refunded)} />
    <Tile
      label="Net revenue"
      value={etb(summary?.netRevenue)}
      tone="text-emerald-400"
    />
  </div>
);

export default SalesSummary;
