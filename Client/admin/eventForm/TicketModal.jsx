import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { InputBox } from "@/components/form/InputBox";
import Switch from "@/components/form/Switch";
import { ticketProblems } from "@/lib/eventForm";

const SUGGESTIONS = ["Regular", "Early Bird", "VIP", "VVIP"];
const EMPTY = { name: "", price: "", capacity: "", isActive: true };

// Add or change one ticket. Nothing is pre-filled: the organizer types it all.
const TicketModal = ({ ticket, others, onSave, onClose }) => {
  const [draft, setDraft] = useState(() => ({ ...EMPTY, ...ticket }));
  const [showErrors, setShowErrors] = useState(false);
  const problems = ticketProblems(draft, others);
  const free = String(draft.price) === "0";
  const isNew = !ticket;
  const err = (key) => (showErrors ? problems[key] : "");
  const patch = (p) => setDraft((d) => ({ ...d, ...p }));

  const save = () => {
    if (Object.keys(problems).length) return setShowErrors(true);
    onSave({ ...draft, name: draft.name.trim() });
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-label={isNew ? "Add ticket" : "Edit ticket"}
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-auto rounded-t-3xl border border-white/[0.1] bg-[#1c1f22] p-6 sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">{isNew ? "Add a ticket" : "Edit ticket"}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-1.5 text-[#8b9097] hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <InputBox
          id="ticket-name"
          label="Ticket name"
          required
          autoFocus
          value={draft.name}
          maxLength={60}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="e.g. General admission"
          error={err("name")}
          reserveError={false}
        />
        <div className="mb-4 mt-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => patch({ name: s })} className="rounded-full border border-white/[0.14] px-3 py-1 text-[12px] font-semibold text-[#8b9097] hover:border-[#FF7A00] hover:text-[#FF7A00]">
              {s}
            </button>
          ))}
        </div>
        {err("name") && <p className="-mt-2 mb-3 text-[12.5px] text-[#ff8a8a]">{err("name")}</p>}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <InputBox
              id="ticket-price"
              label="Price (ETB)"
              required
              inputMode="decimal"
              value={draft.price}
              disabled={free}
              onChange={(e) => patch({ price: e.target.value.replace(/[^\d.]/g, "") })}
              placeholder="Amount"
              error={err("price")}
            />
          </div>
          <InputBox
            id="ticket-seats"
            label="Seats"
            required
            inputMode="numeric"
            value={draft.capacity}
            onChange={(e) => patch({ capacity: e.target.value.replace(/\D/g, "") })}
            placeholder="How many"
            error={err("capacity")}
          />
        </div>
        {draft.sold > 0 && <p className="-mt-2 mb-3 text-[12.5px] text-[#8b9097]">{draft.sold} already sold</p>}

        <div className="mb-2 flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3">
          <span className="font-semibold">Free ticket</span>
          <Switch label="Free ticket" checked={free} onChange={(on) => patch({ price: on ? "0" : "" })} />
        </div>
        <div className="mb-5 flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3">
          <span className="font-semibold">Visible to buyers</span>
          <Switch label="Visible to buyers" checked={draft.isActive !== false} onChange={(on) => patch({ isActive: on })} />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-white/[0.14] py-3 font-bold hover:bg-white/5">Cancel</button>
          <button type="button" onClick={save} className="flex-1 rounded-full bg-[#FF7A00] py-3 font-extrabold text-black hover:bg-white">
            {isNew ? "Add ticket" : "Save ticket"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TicketModal;
