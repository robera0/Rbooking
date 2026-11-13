import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import TicketModal from "./TicketModal";

const priceText = (p) => (Number(p) === 0 ? "Free" : `${Number(p).toLocaleString()} ETB`);

const TicketList = ({ tickets, onChange }) => {
  // editing: null = closed, -1 = adding, n = editing ticket n
  const [editing, setEditing] = useState(null);

  const save = (t) => {
    onChange(editing === -1 ? [...tickets, t] : tickets.map((x, i) => (i === editing ? { ...x, ...t } : x)));
    setEditing(null);
  };

  return (
    <div>
      {tickets.length === 0 ? (
        <button
          type="button"
          onClick={() => setEditing(-1)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-white/[0.2] py-6 font-bold text-[#8b9097] hover:border-[#FF7A00] hover:text-[#FF7A00]"
        >
          <Plus size={18} /> Add your first ticket
        </button>
      ) : (
        <div className="space-y-2.5">
          {tickets.map((t, i) => (
            <div key={t.ticketId || i} className={`flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-[#23272b] px-4 py-3.5 ${t.isActive === false ? "opacity-60" : ""}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{t.name}{t.isActive === false && <span className="ml-2 text-[11px] font-semibold text-[#8b9097]">hidden</span>}</p>
                <p className="text-[13px] text-[#8b9097]">
                  {priceText(t.price)} · {Number(t.capacity).toLocaleString()} seats{t.sold > 0 ? ` · ${t.sold} sold` : ""}
                </p>
              </div>
              <button type="button" aria-label={`Edit ${t.name}`} onClick={() => setEditing(i)} className="rounded-full p-2 text-[#8b9097] hover:bg-white/10 hover:text-white"><Pencil size={16} /></button>
              <button
                type="button"
                aria-label={`Remove ${t.name}`}
                disabled={t.sold > 0}
                title={t.sold > 0 ? "Tickets have been sold, hide it instead" : undefined}
                onClick={() => onChange(tickets.filter((_, x) => x !== i))}
                className="rounded-full p-2 text-[#8b9097] hover:bg-red-500/15 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
              ><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setEditing(-1)} className="flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-white/[0.2] py-3 font-bold text-[#8b9097] hover:border-[#FF7A00] hover:text-[#FF7A00]">
            <Plus size={16} /> Add another ticket
          </button>
        </div>
      )}
      {editing !== null && (
        <TicketModal
          ticket={editing === -1 ? null : tickets[editing]}
          others={tickets.filter((_, i) => i !== editing)}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};

export default TicketList;
