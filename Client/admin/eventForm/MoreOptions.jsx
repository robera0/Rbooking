import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import Switch from "@/components/form/Switch";
import { InputBox, Label, TextAreaBox } from "@/components/form/InputBox";

const TYPES = [
  { value: "generic", label: "Event" },
  { value: "concert", label: "Concert" },
  { value: "festival", label: "Festival" },
];
const GENRES = ["Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Afrobeats", "Gospel", "R&B", "Other"];

const Pill = ({ on, onClick, children }) => (
  <button type="button" onClick={onClick} className={`rounded-full border px-4 py-2 text-[13px] font-bold transition ${on ? "border-[#FF7A00] bg-[#FF7A00] text-black" : "border-white/[0.16] text-[#8b9097] hover:border-[#FF7A00] hover:text-[#FF7A00]"}`}>
    {children}
  </button>
);

const ToggleRow = ({ title, hint, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] px-4 py-3">
    <div><p className="font-semibold">{title}</p>{hint && <p className="text-[12.5px] text-[#8b9097]">{hint}</p>}</div>
    <Switch label={title} checked={checked} onChange={onChange} />
  </div>
);

const Chips = ({ label, items, onChange, placeholder }) => {
  const [val, setVal] = useState("");
  const add = () => { const v = val.trim(); if (v) { onChange([...items, v]); setVal(""); } };
  return (
    <div>
      <Label>{label}</Label>
      {items.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {items.map((it, i) => (
            <span key={`${it}${i}`} className="flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1.5 text-[13px] font-semibold">
              {it}<button type="button" aria-label={`Remove ${it}`} onClick={() => onChange(items.filter((_, x) => x !== i))} className="text-[#8b9097] hover:text-red-400">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <InputBox className="flex-1" value={val} reserveError={false} placeholder={placeholder} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} className="self-start rounded-xl bg-[#FF7A00] px-4 py-3.5 font-extrabold text-black hover:bg-white">Add</button>
      </div>
    </div>
  );
};

const MoreOptions = ({ form, set, extra }) => {
  const [open, setOpen] = useState(false);
  const policies = form.policies;
  const setPolicy = (i, p) => set({ policies: policies.map((x, n) => (n === i ? { ...x, ...p } : x)) });

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#1c1f22]">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-6 py-5 text-left">
        <span><span className="block font-extrabold">More options</span><span className="text-[13px] text-[#8b9097]">Event type, policies, amenities, invitations</span></span>
        <ChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-6 border-t border-white/[0.06] p-6">
          <div>
            <Label>Type of event</Label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => <Pill key={t.value} on={form.type === t.value} onClick={() => set({ type: t.value })}>{t.label}</Pill>)}
            </div>
          </div>
          <InputBox id="artist" label="Artist / host" value={form.artistName} reserveError={false} placeholder="Main artist or host" onChange={(e) => set({ artistName: e.target.value })} />

          {form.type === "concert" && (
            <>
              <div>
                <Label>Music genre</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => <Pill key={g} on={form.musicGenre.includes(g)} onClick={() => set({ musicGenre: form.musicGenre.includes(g) ? form.musicGenre.filter((x) => x !== g) : [...form.musicGenre, g] })}>{g}</Pill>)}
                </div>
              </div>
              <Chips label="Supporting artists" items={form.supportingArtists} onChange={(v) => set({ supportingArtists: v })} placeholder="Opening act name" />
            </>
          )}
          {form.type === "festival" && (
            <>
              <InputBox id="days" label="Duration (days)" inputMode="numeric" value={form.durationDays} reserveError={false} placeholder="e.g. 3" onChange={(e) => set({ durationDays: e.target.value.replace(/\D/g, "") })} />
              <Chips label="Stages" items={form.stages} onChange={(v) => set({ stages: v })} placeholder="e.g. Main stage" />
            </>
          )}
          {(form.type === "concert" || form.type === "festival") && (
            <ToggleRow title="Family friendly" checked={form.familyFriendly} onChange={(v) => set({ familyFriendly: v })} />
          )}

          <Chips label="Amenities" items={form.amenities} onChange={(v) => set({ amenities: v })} placeholder="e.g. Parking" />

          <div>
            <Label>Policies</Label>
            <div className="space-y-3">
              {policies.map((p, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.1] bg-[#23272b] p-4">
                  <div className="flex items-center gap-2">
                    <InputBox className="flex-1" reserveError={false} value={p.header} placeholder="Title, e.g. Refunds" onChange={(e) => setPolicy(i, { header: e.target.value })} />
                    <button type="button" aria-label="Remove policy" onClick={() => set({ policies: policies.filter((_, x) => x !== i) })} className="rounded-full p-2 text-[#8b9097] hover:text-red-400"><Trash2 size={16} /></button>
                  </div>
                  <TextAreaBox className="mt-3" reserveError={false} value={p.descriptions} placeholder="Details" onChange={(e) => setPolicy(i, { descriptions: e.target.value })} />
                </div>
              ))}
              <button type="button" onClick={() => set({ policies: [...policies, { header: "", descriptions: "" }] })} className="flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-white/[0.2] py-3 font-bold text-[#8b9097] hover:border-[#FF7A00] hover:text-[#FF7A00]"><Plus size={16} /> Add a policy</button>
            </div>
          </div>

          <ToggleRow title="Show tickets left" hint="Buyers see how many tickets remain" checked={form.showAvailability} onChange={(v) => set({ showAvailability: v })} />
          <ToggleRow title="Invitations" hint="Send a personal pass to each guest (set up after you save)" checked={form.invitation} onChange={(v) => set({ invitation: v })} />
          {extra}
        </div>
      )}
    </div>
  );
};

export default MoreOptions;
