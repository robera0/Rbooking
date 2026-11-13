import { useMemo, useRef } from "react";
import { ImagePlus, X, Check, Circle } from "lucide-react";
import { useService } from "@/Context/ServiceContext";

const Thumb = ({ src, onRemove, cover }) => (
  <div className="relative aspect-square overflow-hidden rounded-xl border border-white/[0.1]">
    <img src={src} alt="" className="h-full w-full object-cover" />
    {cover && <span className="absolute left-1.5 top-1.5 rounded-full bg-[#FF7A00] px-2 py-0.5 text-[10px] font-extrabold text-black">COVER</span>}
    <button type="button" aria-label="Remove photo" onClick={onRemove} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/70 hover:bg-red-500"><X size={13} /></button>
  </div>
);

// Cover photos (the first one is the cover) and the publish checklist.
const CoverCard = ({ existing, added, onExisting, onAdded, checklist, children }) => {
  const { API_URL } = useService();
  const input = useRef(null);
  const addedUrls = useMemo(() => added.map((f) => URL.createObjectURL(f)), [added]);
  const full = (s) => (s.startsWith("http") ? s : `${API_URL}/${s}`);
  const total = existing.length + added.length;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/[0.08] bg-[#1c1f22] p-5">
        <h3 className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.09em] text-[#8b9097]">
          Cover photo <span className="text-[#FF7A00]">*</span>
        </h3>
        {total === 0 ? (
          <button type="button" onClick={() => input.current?.click()} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-white/[0.2] text-[#8b9097] hover:border-[#FF7A00] hover:text-[#FF7A00]">
            <ImagePlus size={30} />
            <span className="font-bold">Add a photo</span>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {existing.map((s, i) => (
              <Thumb key={`e${s}`} src={full(s)} cover={i === 0} onRemove={() => onExisting(existing.filter((_, x) => x !== i))} />
            ))}
            {added.map((f, i) => (
              <Thumb key={`n${f.name}${i}`} src={addedUrls[i]} cover={existing.length === 0 && i === 0} onRemove={() => onAdded(added.filter((_, x) => x !== i))} />
            ))}
            <button type="button" aria-label="Add photo" onClick={() => input.current?.click()} className="grid aspect-square place-items-center rounded-xl border-[1.5px] border-dashed border-white/[0.2] text-[#8b9097] hover:border-[#FF7A00] hover:text-[#FF7A00]"><ImagePlus size={22} /></button>
          </div>
        )}
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { const files = Array.from(e.target.files || []); if (files.length) onAdded([...added, ...files]); e.target.value = ""; }} />
      </div>

      {checklist && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#1c1f22] p-5">
          <h3 className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.09em] text-[#8b9097]">To publish</h3>
          <ul className="space-y-2">
            {checklist.map((c) => (
              <li key={c.key} className={`flex items-center gap-2.5 text-[14px] font-semibold ${c.ok ? "text-white" : "text-[#8b9097]"}`}>
                {c.ok ? <Check size={16} className="text-[#22c55e]" /> : <Circle size={16} />}
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </div>
  );
};

export default CoverCard;
