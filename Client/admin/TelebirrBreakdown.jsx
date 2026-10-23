const etb = (n) => `${(n ?? 0).toLocaleString()} ETB`;

const LABELS = {
  unassigned: { title: "Shared name", note: "Two numbers use this holder name" },
  before_tracking: {
    title: "Before tracking",
    note: "Paid before numbers were recorded",
  },
  free: { title: "Free tickets", note: "No payment" },
};

const Name = ({ row }) => {
  if (row.kind === "number") {
    return (
      <>
        <p className="font-bold text-white tabular-nums">{row.accountNumber}</p>
        {row.receiverName && (
          <p className="text-[11px] text-gray-500">{row.receiverName}</p>
        )}
      </>
    );
  }
  const label = LABELS[row.kind];
  return (
    <>
      <p className="font-bold text-gray-300">{label.title}</p>
      <p className="text-[11px] text-gray-500">
        {row.kind === "unassigned" && row.receiverName
          ? `${label.note}: ${row.receiverName}`
          : label.note}
      </p>
    </>
  );
};

// Tickets, orders and money received on each of the organizer's Telebirr
// numbers, for paid orders only. The rows add up to net revenue (refunded
// orders are not in it).
const TelebirrBreakdown = ({
  rows = [],
  isLoading = false,
  title = "Received by Telebirr number",
}) => {
  const totals = rows.reduce(
    (sum, row) => ({
      tickets: sum.tickets + row.tickets,
      orders: sum.orders + row.orders,
      amount: sum.amount + row.amount,
    }),
    { tickets: 0, orders: 0, amount: 0 },
  );

  return (
    <div className="w-full bg-[#1C1F22] border border-white/[0.04] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-xl">
      <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF7A00]">
        {title}
      </h2>
      <p className="mb-4 mt-1 text-[11px] text-gray-500">
        Paid orders only. Refunded orders are not counted.
      </p>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm text-left">
          <thead className="border-b border-white/[0.08]">
            <tr className="text-[10px] uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3 font-bold">Number</th>
              <th className="px-4 py-3 font-bold text-right">Tickets</th>
              <th className="px-4 py-3 font-bold text-right">Orders</th>
              <th className="px-4 py-3 font-bold text-right">Total received</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 tabular-nums">
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  No Telebirr numbers set up yet, and no paid orders.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-white/[0.04]">
                <td className="px-4 py-3">
                  <Name row={row} />
                </td>
                <td className="px-4 py-3 text-right font-black text-white">
                  {row.tickets}
                </td>
                <td className="px-4 py-3 text-right">{row.orders}</td>
                <td className="px-4 py-3 text-right">{etb(row.amount)}</td>
              </tr>
            ))}
          </tbody>
          {!isLoading && rows.length > 0 && (
            <tfoot>
              <tr className="text-white font-black">
                <td className="px-4 py-3 text-[10px] uppercase tracking-wider">
                  Total
                </td>
                <td className="px-4 py-3 text-right">{totals.tickets}</td>
                <td className="px-4 py-3 text-right">{totals.orders}</td>
                <td className="px-4 py-3 text-right">{etb(totals.amount)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default TelebirrBreakdown;
