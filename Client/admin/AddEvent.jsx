import React, { useState, useRef } from "react";
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
    eventType: "Event",
    eventName: "",
    artistName: [],
    venue: "",
    description: "",
    eventDate: "",
    ticketTiers: [],
    amenities: [],
    images: [],
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [newTier, setNewTier] = useState({
    tierName: "",
    price: "",
    capacity: "",
  });
  const dateInputRef = useRef(null);
  const posterInputRef = useRef(null);

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
      toast.success(`${formData.eventType} PUBLISHED`);
      navigate("/admin/events");
    },
  });

  const handleSubmit = () => {
    if (!formData.eventName)
      return setError("Event Name is required to publish");
    setError("");
    createMutation.mutate({
      type: formData.eventType,
      name: formData.eventName,
      artist: { name: formData.artistName },
      locale: formData.venue,
      desc: formData.description,
      date: formData.eventDate,
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
                    className={`py-4 rounded-xl font-black uppercase  text-[11px] border transition-all
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
                  value={formData.eventName}
                  onChange={(e) =>
                    setFormData({ ...formData, eventName: e.target.value })
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
                    value={formData.artistName}
                    onChange={(e) =>
                      setFormData({ ...formData, artistName: e.target.value })
                    }
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
                    value={formData.venue}
                    onChange={(e) =>
                      setFormData({ ...formData, venue: e.target.value })
                    }
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
              {formData.ticketTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-center bg-[#121417] p-5 rounded-xl border border-white/[0.06]"
                >
                  <div className="flex-1">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                      Tier Name
                    </label>
                    <input
                      value={tier.tierName}
                      onChange={(e) => {
                        const updated = [...formData.ticketTiers];
                        updated[idx].tierName = e.target.value;
                        setFormData({ ...formData, ticketTiers: updated });
                      }}
                      className="bg-transparent border-none text-white font-bold outline-none w-full uppercase"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                      Price (ETB)
                    </label>
                    <input
                      value={tier.price}
                      onChange={(e) => {
                        const updated = [...formData.ticketTiers];
                        updated[idx].price = e.target.value;
                        setFormData({ ...formData, ticketTiers: updated });
                      }}
                      className="bg-transparent border-none text-[#FF7A00] font-black outline-none w-full"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={tier.capacity}
                      onChange={(e) => {
                        const updated = [...formData.ticketTiers];
                        updated[idx].capacity = e.target.value;
                        setFormData({ ...formData, ticketTiers: updated });
                      }}
                      className="bg-transparent border-none text-white font-bold outline-none w-full no-spinner"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.ticketTiers.filter(
                        (_, i) => i !== idx,
                      );
                      setFormData({ ...formData, ticketTiers: updated });
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Remove tier"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {/* New Tier Adder */}
              <div className="flex gap-4 items-center bg-[#121417] p-5 rounded-xl border border-dashed border-[#FF7A00] mt-4">
                <div className="flex-1">
                  <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                    Tier Name
                  </label>
                  <input
                    value={newTier?.tierName || ""}
                    onChange={(e) =>
                      setNewTier({ ...newTier, tierName: e.target.value })
                    }
                    className="bg-transparent border-none text-white font-bold outline-none w-full uppercase"
                    placeholder="Tier Name"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                    Price (ETB)
                  </label>
                  <input
                    value={newTier?.price || ""}
                    onChange={(e) =>
                      setNewTier({ ...newTier, price: e.target.value })
                    }
                    className="bg-transparent border-none text-[#FF7A00] font-black outline-none w-full placeholder:text-gray-400"
                    placeholder="Add Price"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={newTier?.capacity || ""}
                    onChange={(e) =>
                      setNewTier({ ...newTier, capacity: e.target.value })
                    }
                    className="bg-transparent border-none text-white font-bold outline-none w-full no-spinner"
                    placeholder="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      newTier?.tierName &&
                      newTier?.price &&
                      newTier?.capacity
                    ) {
                      setFormData({
                        ...formData,
                        ticketTiers: [...formData.ticketTiers, { ...newTier }],
                      });
                      setNewTier({ tierName: "", price: "", capacity: "" });
                    }
                  }}
                  className="ml-2 text-[#22c55e] hover:text-green-700 border border-[#22c55e] rounded-full p-2 flex items-center justify-center"
                  title="Add tier"
                >
                  <Check size={18} />
                </button>
              </div>
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
            <div className="relative">
              <div className="relative flex items-center">
                <input
                  type="datetime-local"
                  ref={dateInputRef}
                  className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                  value={formData.eventDate}
                  tabIndex={-1}
                />
                <button
                  type="button"
                  onClick={() =>
                    dateInputRef.current && dateInputRef.current.showPicker()
                  }
                  className="flex items-center gap-2 px-4 py-4 w-full bg-[#121417] border border-[#FF7A00] rounded-xl text-white font-bold focus:border-[#FF7A00] outline-none"
                  style={{ position: "relative", zIndex: 20 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#FF7A00"
                    className="w-6 h-6"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="16"
                      rx="2"
                      stroke="#FF7A00"
                      strokeWidth="2"
                    />
                    <path
                      d="M16 3v4M8 3v4M3 9h18"
                      stroke="#FF7A00"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="ml-2 text-white font-bold">
                    {formData.eventDate
                      ? new Date(formData.eventDate).toLocaleString()
                      : "Pick Date & Time"}
                  </span>
                </button>
              </div>
            </div>
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
                    onClick={() => {
                      setFormData({
                        ...formData,
                        amenities: formData.amenities.filter(
                          (_, idx) => idx !== i,
                        ),
                      });
                    }}
                  />
                </div>
              ))}
              <div className="relative pt-2">
                <input
                  className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-[#FF7A00]/50 font-bold uppercase"
                  placeholder="NEW AMENITY..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newAmenity.trim()) {
                      setFormData({
                        ...formData,
                        amenities: [...formData.amenities, newAmenity.trim()],
                      });
                      setNewAmenity("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-2 top-[13px] p-1.5 bg-[#FF7A00] text-black rounded-lg hover:bg-white transition-all shadow-lg"
                  onClick={() => {
                    if (newAmenity.trim()) {
                      setFormData({
                        ...formData,
                        amenities: [...formData.amenities, newAmenity.trim()],
                      });
                      setNewAmenity("");
                    }
                  }}
                >
                  <Plus size={14} strokeWidth={4} />
                </button>
              </div>
            </div>
          </div>

          {/* FLYER ARCHIVE - INDIVIDUAL DIV BOXES */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem] space-y-6">
            <h3 className="text-white font-bold uppercase tracking-tight text-sm">
              Flyer Archive
            </h3>

            <div className="space-y-4">
              {formData?.images?.map((file, index) => (
                <div
                  key={index}
                  className="w-full bg-[#121417] border border-white/10 rounded-[1.5rem] p-4 flex gap-4 items-center group relative"
                >
                  <div className="w-16 h-16 rounded-xl border border-white/5 overflow-hidden shrink-0 bg-black">
                    {file.type && file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">No Preview</span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-gray-300 truncate">
                      {file.name}
                    </p>
                    <p className="text-[9px] font-bold text-gray-600 uppercase italic">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = formData.images.filter(
                        (_, i) => i !== index,
                      );
                      setFormData({ ...formData, images: updated });
                    }}
                    className="p-2 text-red-500/60 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                posterInputRef.current && posterInputRef.current.click()
              }
              className="w-full h-32 bg-[#121417] border border-dashed border-white/[0.2] hover:border-[#FF7A00] text-gray-500 hover:text-[#FF7A00] rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-colors active:scale-95 group"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={posterInputRef}
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length)
                    setFormData({
                      ...formData,
                      images: [...formData.images, ...files],
                    });
                }}
              />
              <Plus
                size={32}
                strokeWidth={4}
                className="group-hover:scale-110 transition-transform"
              />
              <p className="font-black text-[11px] uppercase tracking-[0.2em] italic">
                Add Visual Intel
              </p>
            </button>
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
