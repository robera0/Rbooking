import React, { useState } from "react";
import {
  Plus,
  Save,
  ArrowLeft,
  Upload,
  Trash2,
  ShieldCheck,
  Music,
  Tv,
  Tag,
  Zap,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";

const AddEvent = () => {
  const navigate = useNavigate();
  const { API_URL } = useService();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    type: "concert",
    name: "",
    artist: "",
    locale: "",
    desc: "",
    date: "",
    priceRanges: [{ type: "General Admission", price: "45", capacity: "1000" }],
    amenities: ["VIP Lounge", "Safety Escort"],
  });

  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${API_URL}/api/admin/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      toast.success("TRANSMISSION PUBLISHED");
      navigate("/admin/events");
    },
  });

  const handleSubmit = () => {
    if (!formData.name) return setError("Event Title is required to publish");
    setError("");
    createMutation.mutate({
      type: formData.type,
      name: formData.name,
      artist: { name: formData.artist },
      locale: formData.locale,
      desc: formData.desc,
      date: formData.date,
    });
  };

  return (
    <div className="w-full max-w-full space-y-8 pb-20">
      <Toaster position="top-center" />

      {/* Header - Styled like Second Code */}
      <div className="flex flex-wrap justify-between items-end mb-12 border-b border-white/[0.04] pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/[0.04] rounded-full transition-colors text-white"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Create <span className="text-[#FF7A00]">{formData.type}</span>
            </h1>
          </div>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00] ml-14" />
        </div>
        <button
          onClick={handleSubmit}
          disabled={createMutation.isLoading}
          className="mt-4 md:mt-0 px-6 py-4 bg-[#FF7A00] text-black hover:bg-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} strokeWidth={3} />
          {createMutation.isLoading ? "Publishing..." : "Publish Event"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Discriminator Selection - From First Code */}
          {/* LEFT COLUMN: CORE INTEL */}
          <div className="lg:col-span-8 space-y-10">
            {/* TYPE SELECTOR */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Tag size={14} className="text-[#FF7A00]" /> Classification Type
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {["concert", "festival", "event"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`py-4 rounded-xl font-black uppercase italic text-[11px] border transition-all
                    ${
                      formData.type === t
                        ? "bg-[#FF7A00] border-[#FF7A00] text-black"
                        : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Event Details - Background from Second Code */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem] space-y-6">
            <h3 className="text-white font-bold uppercase tracking-tight text-sm">
              Transmission Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full bg-[#121417] border ${
                    error ? "border-red-500/50" : "border-white/[0.06]"
                  } rounded-xl px-4 py-4 text-white focus:border-[#FF7A00]/50 outline-none transition-colors font-bold`}
                  placeholder="e.g. WAREHOUSE PROJECT"
                />
                {error && (
                  <p className="text-red-500 font-black tracking-widest uppercase text-[9px] mt-2">
                    {error}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                    Artist / Talent
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none"
                    placeholder="Main artist"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                    Venue Locale
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none"
                    placeholder="Location"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  rows="4"
                  className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none italic"
                  placeholder="Event details..."
                />
              </div>
            </div>
          </div>

          {/* Ticketing Tiers - Style from Second Code */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem]">
            <h3 className="text-white font-bold uppercase tracking-tight mb-6 text-sm">
              Ticketing Tiers
            </h3>
            <div className="space-y-4">
              {formData.priceRanges.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-center bg-[#121417] p-5 rounded-xl border border-white/[0.06]"
                >
                  <div className="flex-1">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                      Tier Name
                    </label>
                    <input
                      defaultValue={tier.type}
                      className="bg-transparent border-none text-white font-bold outline-none w-full uppercase"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                      Price (ETB)
                    </label>
                    <input
                      defaultValue={tier.price}
                      className="bg-transparent border-none text-[#FF7A00] font-black outline-none w-full"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      defaultValue={tier.capacity}
                      className="bg-transparent border-none text-white font-bold outline-none w-full no-spinner"
                    />
                  </div>
                </div>
              ))}
              <button className="w-full py-4 border border-dashed border-white/[0.2] hover:border-[#FF7A00] text-gray-400 hover:text-[#FF7A00] rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <Plus size={16} /> Add Ticket Tier
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Space */}
        <div className="space-y-8">
          {/* Schedule */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem]">
            <h3 className="text-white font-bold uppercase tracking-tight mb-6 text-sm">
              Schedule
            </h3>
            <input
              type="datetime-local"
              className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-4 text-white font-bold focus:border-[#FF7A00]/50 outline-none"
            />
          </div>

          {/* Amenities Vertical with Plus */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem]">
            <h3 className="text-white font-bold uppercase tracking-tight mb-6 text-sm">
              Amenities
            </h3>
            <div className="space-y-3">
              {formData.amenities.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#121417] px-4 py-3 rounded-xl border border-white/[0.06] group"
                >
                  <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-white transition-colors">
                    {item}
                  </span>
                  <Trash2
                    size={14}
                    className="text-gray-600 hover:text-red-500 cursor-pointer"
                  />
                </div>
              ))}
              <div className="relative pt-2">
                <input
                  className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-[#FF7A00]/50 font-bold uppercase"
                  placeholder="NEW AMENITY..."
                />
                <button className="absolute right-2 top-[13px] p-1.5 bg-[#FF7A00] text-black rounded-lg hover:bg-white transition-all shadow-lg">
                  <Plus size={14} strokeWidth={4} />
                </button>
              </div>
            </div>
          </div>

          {/* Poster Upload */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem]">
            <h3 className="text-white font-bold uppercase tracking-tight mb-6 text-sm">
              Flyer Archive
            </h3>
            <div className="w-full aspect-[4/5] bg-[#121417] border border-dashed border-white/[0.2] rounded-[1.5rem] flex flex-col items-center justify-center text-gray-500 hover:border-[#FF7A00] hover:text-[#FF7A00] transition-colors cursor-pointer group">
              <Upload
                size={32}
                className="mb-4 group-hover:-translate-y-2 transition-transform"
              />
              <p className="font-black text-[10px] uppercase tracking-widest">
                Upload Poster
              </p>
              <p className="text-[9px] mt-2 opacity-50">PNG, JPG UP TO 10MB</p>
            </div>
          </div>

          <div className="p-6 bg-[#FF7A00]/5 border border-[#FF7A00]/10 rounded-3xl flex items-center gap-4">
            <ShieldCheck size={24} className="text-[#FF7A00]" />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-tight">
              Validated <br /> Terminal Ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;
