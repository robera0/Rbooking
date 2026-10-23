import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import SalesSummary from "./SalesSummary";
import TelebirrBreakdown from "./TelebirrBreakdown";
import { useSales } from "./api/sales.api";

const etb = (n) => `${(n ?? 0).toLocaleString()} ETB`;

const TICKET_STATE = {
  soldOut: "bg-red-500/10 text-red-400",
  low: "bg-yellow-500/10 text-yellow-400",
  onSale: "bg-emerald-500/10 text-emerald-400",
};

// Treat a type as "almost gone" once 10% or less of its seats remain.
const ticketState = (row) => {
  if (row.soldOut) return { label: "Sold out", tone: TICKET_STATE.soldOut };
  if (row.capacity > 0 && row.left / row.capacity <= 0.1) {
    return { label: "Almost gone", tone: TICKET_STATE.low };
  }
  return { label: "On sale", tone: TICKET_STATE.onSale };
};

const EventSales = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useSales(eventId);

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loader2 size={40} className="text-[#FF7A00] animate-spin" />
      </div>
    );
  }

  if (isError || !data?.event) {
    return (
      <div className="w-full space-y-4">
        <button
          type="button"
          onClick={() => navigate("/admin/events")}
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#FF7A00]"
        >
          <ArrowLeft size={14} /> Events
        </button>
        <p className="text-sm text-gray-400">
          {isError
            ? "We could not load the sales just now. Check your connection and try again."
            : "We could not find that event, or it is not yours."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-8">
      <div className="space-y-4 border-b border-white/[0.04] pb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/events")}
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#FF7A00]"
        >
          <ArrowLeft size={14} /> Events
        </button>
        <h1 className="text-2xl md:text-5xl uppercase tracking-tighter leading-none">
          {data.event.name} <span className="text-[#FF7A00]">Sales</span>
        </h1>
        <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
      </div>

      <SalesSummary summary={data.totals} />

      <div className="w-full bg-[#1C1F22] border border-white/[0.04] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-xl">
        <h2 className="mb-4 text-[11px] font-black uppercase tracking-[0.16em] text-[#FF7A00]">
          Tickets sold by ticket type
        </h2>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm text-left">
            <thead className="border-b border-white/[0.08]">
              <tr className="text-[10px] uppercase tracking-wider text-gray-400">
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold text-right">Price</th>
                <th className="px-4 py-3 font-bold text-right">Sold</th>
                <th className="px-4 py-3 font-bold text-right">Left</th>
                <th className="px-4 py-3 font-bold text-right">Revenue</th>
                <th className="px-4 py-3 font-bold" />
              </tr>
            </thead>
            <tbody className="text-gray-300 tabular-nums">
              {data.byTicketType.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    This event has no ticket types yet.
                  </td>
                </tr>
              )}
              {data.byTicketType.map((row) => {
                const state = ticketState(row);
                return (
                  <tr key={row.ticketId} className="border-b border-white/[0.04]">
                    <td className="px-4 py-3 font-bold text-white">{row.name}</td>
                    <td className="px-4 py-3 text-right">{etb(row.price)}</td>
                    <td className="px-4 py-3 text-right font-black text-white">{row.sold}</td>
                    <td className="px-4 py-3 text-right">{Math.max(row.left, 0)}</td>
                    <td className="px-4 py-3 text-right">{etb(row.revenue)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-widest ${state.tone}`}
                      >
                        {state.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TelebirrBreakdown rows={data.byTelebirr} />
    </div>
  );
};

export default EventSales;
