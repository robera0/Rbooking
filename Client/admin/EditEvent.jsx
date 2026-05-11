import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Save,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Tag,
  Check,
  Loader2,
} from "lucide-react";
import { CustomSelect } from "./Cards";
import { useNavigate, useParams, useLoaderData } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useService();
  const queryClient = useQueryClient();

  const eventData = useLoaderData();

  const [formData, setFormData] = useState(() => {
    if (eventData?.event) {
      const ev = eventData.event;
      return {
        type: ev.type || "concert",
        eventName: ev.name || "",
        artistName: ev.artist?.name || "",
        venue: ev.locale || "",
        description: ev.desc || "",
        eventDate: ev.dates?.start?.dateTime ? new Date(ev.dates.start.dateTime).toISOString().slice(0, 16) : "",
        tickets: ev.priceRanges?.map(pr => ({
          name: pr.type,
          price: pr.min,
          capacity: pr.max 
        })) || [],
        policies: ev.policies || [],
        amenities: ev.amenities?.activity || [],
        existingPictures: ev.pictures || [],
        newPictures: [],
      };
    }
    return {
      type: "",
      eventName: "",
      artistName: "",
      venue: "",
      description: "",
      eventDate: "",
      tickets: [],
      policies: [],
      amenities: [],
      existingPictures: [],
      newPictures: [],
    };
  });

  const [newAmenity, setNewAmenity] = useState("");
  const [newTicket, setNewTicket] = useState({
    name: "",
    price: "",
    capacity: "",
  });
  const dateInputRef = useRef(null);
  const posterInputRef = useRef(null);
  const [error, setError] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const form = new FormData();

      form.append("type", payload.type);
      form.append("name", payload.name);
      form.append("locale", payload.locale);
      form.append("desc", payload.desc);

      form.append("artist", JSON.stringify(payload.artist));
      form.append("priceRanges", JSON.stringify(payload.priceRanges));
      form.append("policies", JSON.stringify(payload.policies));
      form.append("dates", JSON.stringify(payload.dates));
      form.append("amenities", JSON.stringify(payload.amenities));
      form.append("existingPictures", JSON.stringify(payload.existingPictures));

      // Append new files
      formData.newPictures.forEach((img) => {
        form.append("pictures", img);
      });

      const res = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: "PUT",
        body: form,
      });

      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Event Updated Successfully!", {
        duration: 2000,
        style: {
          background: "#1C1F22",
          color: "#fff",
          border: "1px solid #FF7A00",
        },
      });
      queryClient.invalidateQueries(["adminEvents"]);
      
      setTimeout(() => {
        navigate("/admin/events");
      }, 2000);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.eventName) return setError("Event Name is required");
    setError("");
    
    updateMutation.mutate({
      type: formData.type.toLowerCase(),
      name: formData.eventName,
      artist: { name: formData.artistName },
      locale: formData.venue,
      desc: formData.description,
      existingPictures: formData.existingPictures,
      policies: formData.policies,
      priceRanges: formData.tickets.map((t) => ({
        type: t.name,
        currency: "ETB",
        min: Number(t.price),
        max: Number(t.price),
      })),
      dates: {
        start: {
          localDate: formData.eventDate?.split("T")[0],
          localTime: formData.eventDate?.split("T")[1],
          dateTime: formData.eventDate ? new Date(formData.eventDate) : null,
        },
        timezone: "Africa/Addis_Ababa",
        status: { code: "onsale" },
      },
      amenities: {
        activity: formData.amenities,
        payment_method: [],
        safety: [],
        other: [],
      },
    });
  };

  if (!formData.eventName && !eventData?.event) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-[#FF7A00] animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-[0.2em]">Syncing Terminal...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-8 pb-20">
      <Toaster position="top-center" />

      {/* Header */}
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
              Manage <span className="text-[#FF7A00]">{formData.type}</span>
            </h1>
          </div>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00] ml-14" />
        </div>
        <button
          onClick={handleSubmit}
          disabled={updateMutation.isLoading}
          className="mt-4 md:mt-0 px-6 py-4 bg-[#FF7A00] text-black hover:bg-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} strokeWidth={3} />
          {updateMutation.isLoading ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Classification Selection */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Tag size={14} className="text-[#FF7A00]" /> Classification Type
              </h3>
              <CustomSelect 
                options={[
                  { label: "Concert", value: "concert" },
                  { label: "Festival", value: "festival" },
                  { label: "Generic", value: "generic" }
                ]}
                value={formData.type.toLowerCase()}
                onChange={(val) => setFormData({ ...formData, type: val })}
                placeholder="Select Type"
              />
            </div>
          </section>

          {/* Event Details */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem] space-y-6">
            <h3 className="text-white font-bold uppercase tracking-tight text-sm">Transmission Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Event Title</label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  className={`w-full bg-[#121417] border ${error ? "border-red-500/50" : "border-white/[0.06]"} rounded-xl px-4 py-4 text-white focus:border-[#FF7A00]/50 outline-none transition-colors font-bold`}
                />
                {error && <p className="text-red-500 font-black tracking-widest uppercase text-[9px] mt-2">{error}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Artist / Talent</label>
                  <input
                    type="text"
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                    className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Venue Locale</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Description</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none italic"
                />
              </div>
            </div>
          </div>

          {/* Tickets */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem]">
            <h3 className="text-white font-bold uppercase tracking-tight mb-6 text-sm">Event Tickets</h3>
            <div className="space-y-4">
              {formData.tickets.map((ticket, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-[#121417] p-5 rounded-xl border border-white/[0.06]">
                  <div className="flex-1">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Ticket Name</label>
                    <input
                      value={ticket.name}
                      onChange={(e) => {
                        const updated = [...formData.tickets];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, tickets: updated });
                      }}
                      className="bg-transparent border-none text-white font-bold outline-none w-full uppercase"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Price (ETB)</label>
                    <input
                      value={ticket.price}
                      onChange={(e) => {
                        const updated = [...formData.tickets];
                        updated[idx].price = e.target.value;
                        setFormData({ ...formData, tickets: updated });
                      }}
                      className="bg-transparent border-none text-[#FF7A00] font-black outline-none w-full"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Capacity</label>
                    <input
                      type="number"
                      value={ticket.capacity}
                      onChange={(e) => {
                        const updated = [...formData.tickets];
                        updated[idx].capacity = e.target.value;
                        setFormData({ ...formData, tickets: updated });
                      }}
                      className="bg-transparent border-none text-white font-bold outline-none w-full no-spinner"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.tickets.filter((_, i) => i !== idx);
                      setFormData({ ...formData, tickets: updated });
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {/* New Ticket Adder */}
              <div className="flex gap-4 items-center bg-[#121417] p-5 rounded-xl border border-dashed border-[#FF7A00] mt-4">
                <div className="flex-1">
                  <input
                    value={newTicket?.name || ""}
                    onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                    className="bg-transparent border-none text-white font-bold outline-none w-full uppercase"
                    placeholder="New Ticket Name"
                  />
                </div>
                <div className="w-24">
                  <input
                    value={newTicket?.price || ""}
                    onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
                    className="bg-transparent border-none text-[#FF7A00] font-black outline-none w-full placeholder:text-gray-400"
                    placeholder="Price"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={newTicket?.capacity || ""}
                    onChange={(e) => setNewTicket({ ...newTicket, capacity: e.target.value })}
                    className="bg-transparent border-none text-white font-bold outline-none w-full no-spinner"
                    placeholder="Cap"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newTicket?.name && newTicket?.price && newTicket?.capacity) {
                      setFormData({
                        ...formData,
                        tickets: [...formData.tickets, { ...newTicket }],
                      });
                      setNewTicket({ name: "", price: "", capacity: "" });
                    }
                  }}
                  className="ml-2 text-[#22c55e] border border-[#22c55e] rounded-full p-2"
                >
                  <Check size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Event Policies */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem]">
            <h3 className="text-white font-bold uppercase tracking-tight mb-6 text-sm">Event Policies</h3>
            <div className="space-y-4">
              {formData.policies.map((policy, idx) => (
                <div key={idx} className="bg-[#121417] p-5 rounded-xl border border-white/[0.06] space-y-3">
                  <div className="flex justify-between items-start">
                    <input
                      value={policy.header}
                      onChange={(e) => {
                        const updated = [...formData.policies];
                        updated[idx].header = e.target.value;
                        setFormData({ ...formData, policies: updated });
                      }}
                      className="bg-transparent border-none text-white font-bold outline-none w-full uppercase text-xs"
                      placeholder="Policy Header"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.policies.filter((_, i) => i !== idx);
                        setFormData({ ...formData, policies: updated });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    value={policy.descriptions}
                    onChange={(e) => {
                      const updated = [...formData.policies];
                      updated[idx].descriptions = e.target.value;
                      setFormData({ ...formData, policies: updated });
                    }}
                    className="w-full bg-transparent border-none text-gray-400 text-[11px] outline-none italic resize-none"
                    placeholder="Policy details..."
                    rows={2}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, policies: [...formData.policies, { header: "", descriptions: "" }] })}
                className="w-full py-4 border border-dashed border-white/[0.1] rounded-xl text-gray-500 hover:text-[#FF7A00] hover:border-[#FF7A00] transition-all text-[10px] font-black uppercase tracking-widest"
              >
                + Add New Policy
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem]">
            <h3 className="text-white font-bold uppercase tracking-tight mb-6 text-sm">Schedule</h3>
            <button
              type="button"
              onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
              className="flex items-center gap-2 px-4 py-4 w-full bg-[#121417] border border-[#FF7A00] rounded-xl text-white font-bold outline-none"
            >
              <input
                type="datetime-local"
                ref={dateInputRef}
                className="absolute opacity-0 w-0 h-0"
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                value={formData.eventDate}
              />
              <span className="text-white font-bold">
                {formData.eventDate ? new Date(formData.eventDate).toLocaleString() : "Pick Date & Time"}
              </span>
            </button>
          </div>

          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem]">
            <h3 className="text-white font-bold uppercase tracking-tight mb-6 text-sm">Amenities</h3>
            <div className="space-y-3">
              {formData.amenities.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-[#121417] px-4 py-3 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] font-black uppercase text-gray-400">{item}</span>
                  <Trash2 size={14} className="text-gray-600 hover:text-red-500 cursor-pointer" onClick={() => setFormData({ ...formData, amenities: formData.amenities.filter((_, idx) => idx !== i) })} />
                </div>
              ))}
              <div className="relative pt-2">
                <input
                  className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-[10px] text-white outline-none font-bold uppercase"
                  placeholder="NEW AMENITY..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newAmenity.trim()) {
                      setFormData({ ...formData, amenities: [...formData.amenities, newAmenity.trim()] });
                      setNewAmenity("");
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem] space-y-6">
            <h3 className="text-white font-bold uppercase tracking-tight text-sm">Flyer Archive</h3>
            <div className="space-y-4">
              {/* Existing Pictures */}
              {formData.existingPictures.map((src, index) => (
                <div key={`existing-${index}`} className="w-full bg-[#121417] border border-white/10 rounded-[1.5rem] p-4 flex gap-4 items-center group relative">
                  <img src={`${API_URL}/${src}`} className="w-16 h-16 rounded-xl object-cover opacity-80" alt="existing" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-gray-300 truncate">Existing Asset</p>
                  </div>
                  <button onClick={() => setFormData({ ...formData, existingPictures: formData.existingPictures.filter((_, i) => i !== index) })} className="p-2 text-red-500/60 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {/* New Pictures */}
              {formData.newPictures.map((file, index) => (
                <div key={`new-${index}`} className="w-full bg-[#121417] border border-white/10 rounded-[1.5rem] p-4 flex gap-4 items-center group relative">
                  <img src={URL.createObjectURL(file)} className="w-16 h-16 rounded-xl object-cover opacity-80" alt="new" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-[#FF7A00] truncate">{file.name}</p>
                  </div>
                  <button onClick={() => setFormData({ ...formData, newPictures: formData.newPictures.filter((_, i) => i !== index) })} className="p-2 text-red-500/60 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => posterInputRef.current && posterInputRef.current.click()}
              className="w-full h-32 bg-[#121417] border border-dashed border-white/[0.2] hover:border-[#FF7A00] text-gray-500 hover:text-[#FF7A00] rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-colors active:scale-95"
            >
              <input type="file" multiple className="hidden" ref={posterInputRef} onChange={(e) => setFormData({ ...formData, newPictures: [...formData.newPictures, ...Array.from(e.target.files)] })} />
              <Plus size={32} strokeWidth={4} />
              <p className="font-black text-[11px] uppercase tracking-[0.2em] italic">Add New Media</p>
            </button>
          </div>

          <div className="p-6 bg-[#FF7A00]/5 border border-[#FF7A00]/10 rounded-3xl flex items-center gap-4">
            <ShieldCheck size={24} className="text-[#FF7A00]" />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-tight">Terminal Root Access <br /> Authorized</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
