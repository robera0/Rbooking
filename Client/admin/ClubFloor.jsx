import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Upload,
  Image as ImageIcon,
  Sofa,
  RotateCcw,
  Check,
  Search,
} from "lucide-react";
import {
  loadFloorPlan,
  saveFloorPlan,
  resetFloorPlan,
  FLOOR_SECTIONS,
  DEFAULT_FLOOR_PLAN,
} from "../src/lib/clubFloorPlan";

const card = "bg-[#1C1F22] border border-white/[0.06] rounded-2xl";

const inputClass =
  "w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#FF7A00]/50 outline-none transition-colors";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ClubFloor = () => {
  const [items, setItems] = useState(() => loadFloorPlan());
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    section: FLOOR_SECTIONS[0],
    type: "table",
    privacy: "shared",
    seats: 4,
    price: 0,
    status: "available",
    image: "",
  });
  const fileRef = useRef(null);

  useEffect(() => {
    saveFloorPlan(items);
  }, [items]);

  const query = search.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (!query) return items;
    return items.filter((it) =>
      [it.name, it.id, it.section, it.type, it.privacy, it.status]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = {};
    for (const s of FLOOR_SECTIONS) map[s] = [];
    for (const item of filteredItems) {
      if (!map[item.section]) map[item.section] = [];
      map[item.section].push(item);
    }
    return map;
  }, [filteredItems]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      section: FLOOR_SECTIONS[0],
      type: "table",
      privacy: "shared",
      seats: 4,
      price: 0,
      status: "available",
      image: "",
    });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || item.id,
      section: item.section,
      type: item.type,
      privacy: item.privacy,
      seats: item.seats,
      price: item.price ?? 0,
      status: item.status,
      image: item.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageFile = async (file) => {
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch {
      alert("Could not read image file");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.seats || Number(form.seats) < 1) {
      alert("Seats must be at least 1");
      return;
    }
    const payload = {
      id: editingId || `SEAT-${Date.now()}`,
      name: form.name || (form.type === "couch" ? "Couch" : "Table"),
      section: form.section,
      type: form.type,
      privacy: form.privacy,
      seats: Number(form.seats),
      price: Number(form.price) || 0,
      status: form.status,
      image:
        form.image ||
        (form.type === "couch"
          ? "/club/vip-lounge-couch.jpg"
          : "/club/club-table-3.jpg"),
    };

    if (editingId) {
      setItems((prev) => [payload, ...prev.filter((it) => it.id !== editingId)]);
    } else {
      setItems((prev) => [...prev, payload]);
    }
    resetForm();
  };

  const handleDelete = (id) => {
    if (!window.confirm("Remove this seating option?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (editingId === id) resetForm();
  };

  const handleReset = () => {
    if (!window.confirm("Reset floor plan to defaults?")) return;
    const fresh = resetFloorPlan();
    setItems(fresh);
    resetForm();
  };

  return (
    <div className="w-full max-w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 border-b border-white/[0.04] pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-5xl uppercase tracking-tighter leading-none">
            Club <span className="text-[#FF7A00]">Floor Plan</span>
          </h1>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
            Manage tables, shared couches and VIP couches with photos
          </p>
        </div>
        <button
          onClick={handleReset}
          className="mt-4 md:mt-0 px-6 py-3 bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2"
        >
          <RotateCcw size={14} /> Reset defaults
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className={`${card} p-6 space-y-4 border-[#FF7A00]/40`}
      >
        <h2 className="text-sm font-black uppercase tracking-widest text-[#FF7A00]">
          {editingId ? "Edit seating option" : "Add seating option"}
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">
              Name
            </span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Shared Couch A"
            />
          </label>

          <label className="block">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">
              Section
            </span>
            <select
              className={inputClass}
              value={form.section}
              onChange={(e) =>
                setForm((p) => ({ ...p, section: e.target.value }))
              }
            >
              {FLOOR_SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">
              Type
            </span>
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="table">Table</option>
              <option value="couch">Couch</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">
              Privacy
            </span>
            <select
              className={inputClass}
              value={form.privacy}
              onChange={(e) =>
                setForm((p) => ({ ...p, privacy: e.target.value }))
              }
            >
              <option value="shared">Shared</option>
              <option value="private">Private</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">
              Seats
            </span>
            <input
              type="number"
              min="1"
              className={inputClass}
              value={form.seats}
              onChange={(e) =>
                setForm((p) => ({ ...p, seats: e.target.value }))
              }
            />
          </label>

          <label className="block">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">
              Extra price (ETB)
            </span>
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: e.target.value }))
              }
            />
          </label>

          <label className="block">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">
              Status
            </span>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved/Disabled</option>
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">
              Image URL
            </span>
            <input
              className={inputClass}
              value={form.image}
              onChange={(e) =>
                setForm((p) => ({ ...p, image: e.target.value }))
              }
              placeholder="https://... or upload below"
            />
          </label>
        </div>

        {/* Image upload */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            <Upload size={14} /> Upload image
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImageFile(f);
              e.target.value = "";
            }}
          />
          {form.image && (
            <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/[0.06]">
              <img src={form.image} alt="preview" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#FF7A00] text-black text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#ff8f1f] transition-colors"
          >
            <Check size={14} strokeWidth={3} />
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-white/[0.04] text-gray-300 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search seating by name, section, type or privacy..."
          className="w-full bg-[#121417] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-[#FF7A00]/50 outline-none transition-colors"
        />
      </div>

      {filteredItems.length === 0 && (
        <p className="text-[12px] text-gray-500 mb-4">No seating options match your search.</p>
      )}

      {/* List by section */}
      <div className="space-y-6">
        {FLOOR_SECTIONS.map((section) => (
          <div key={section} className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">
                {section}
              </h3>
              <span className="text-[10px] font-bold text-gray-500">
                {grouped[section]?.length || 0} items
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(grouped[section] || []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/[0.06] bg-[#121417] overflow-hidden"
                >
                  <div className="relative h-32 bg-[#0a0b0c]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || item.id}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-600">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <span
                      className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                        item.privacy === "private"
                          ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                          : "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                      }`}
                    >
                      {item.privacy}
                    </span>
                    <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                      {item.type}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-white text-sm">
                        {item.name || item.id}
                      </p>
                      <p className="text-[10px] font-mono text-gray-500">
                        {item.id}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Seats {item.seats} · {item.status}
                      {item.price ? ` · +ETB ${Number(item.price).toLocaleString()}` : ""}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-300 hover:bg-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(grouped[section] || []).length === 0 && (
                <p className="text-[11px] text-gray-500 col-span-full">
                  No seating options in this section yet.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClubFloor;
