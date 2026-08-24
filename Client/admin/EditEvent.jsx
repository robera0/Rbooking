import React, { useState, useRef } from "react";
import {
  Plus,
  Save,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Tag,
  Check,
  Loader2,
  Music,
  Flag,
  Zap,
  CalendarDays,
} from "lucide-react";
import { CustomSelect } from "./Cards";
import { useNavigate, useParams, useLoaderData, useBlocker } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import api from "../src/Context/api/api.config";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StaticDateTimePicker } from "@mui/x-date-pickers/StaticDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DatePickerPanel from "@/components/DatePickerPanel";

// ─── Section Card ──────────────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, title, badge, children }) => (
  <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem] space-y-6">
    <h3 className="text-white font-bold uppercase tracking-tight text-sm flex items-center gap-2">
      {Icon && <Icon size={14} className="text-[#FF7A00]" />}
      {title}
      {badge && (
        <span className="ml-1 text-[8px] px-2 py-0.5 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20 font-black uppercase tracking-widest">
          {badge}
        </span>
      )}
    </h3>
    {children}
  </div>
);

// ─── Toggle ────────────────────────────────────────────────────────────────
const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between pt-5 border-t border-white/[0.04] mt-2">
    <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">
      {label}
    </span>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${
        value ? "bg-[#FF7A00]" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${
          value ? "left-6" : "left-1"
        }`}
      />
    </button>
  </div>
);

// ─── Chip Input ────────────────────────────────────────────────────────────
const ChipInput = ({ label, items, onAdd, onRemove, placeholder }) => {
  const [val, setVal] = useState("");
  const add = () => {
    if (val.trim()) {
      onAdd(val.trim());
      setVal("");
    }
  };
  return (
    <div>
      <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#121417] border border-white/[0.06] rounded-full text-[10px] text-gray-300 font-bold uppercase"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-gray-600 hover:text-red-400 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-3">
        <input
          className="flex-1 bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-[11px] font-bold uppercase outline-none focus:border-[#FF7A00]/50 transition-colors"
          placeholder={placeholder}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2 bg-[#FF7A00] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// ─── Pill Multi Select ─────────────────────────────────────────────────────
const PillMultiSelect = ({ label, options, value, onChange }) => {
  const toggle = (opt) => {
    const next = value.includes(opt)
      ? value.filter((x) => x !== opt)
      : [...value, opt];
    onChange(next);
  };
  return (
    <div>
      <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
              value.includes(opt)
                ? "bg-[#FF7A00] text-black border-[#FF7A00]"
                : "bg-transparent text-gray-500 border-white/10 hover:border-[#FF7A00] hover:text-[#FF7A00]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Pill Select (single) ──────────────────────────────────────────────────
const PillSelect = ({ label, options, value, onChange }) => (
  <div>
    <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">
      {label}
    </label>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
            value === opt
              ? "bg-[#FF7A00] text-black border-[#FF7A00]"
              : "bg-transparent text-gray-500 border-white/10 hover:border-[#FF7A00] hover:text-[#FF7A00]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useService();
  const queryClient = useQueryClient();
  const eventData = useLoaderData();

  const initialFormRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    let initialObj = {};
    if (eventData?.event) {
      const ev = eventData.event;
      initialObj = {
        type: ev.type || "concert",
        eventName: ev.name || "",
        artistName: ev.artist?.name || "",
        supportingArtists: ev.artist?.supporting || [],
        venue: {
          name: ev.links?.venues?.name || "",
          city: ev.links?.venues?.city || "",
          address: ev.links?.venues?.address || "",
        },
        description: ev.desc || "",
        eventDate: ev.dates?.start?.dateTime
          ? new Date(ev.dates.start.dateTime).toISOString().slice(0, 16)
          : "",
        tickets:
          ev.priceRanges?.map((pr) => ({
            name: pr.type || "",
            price: pr.min || 0,
            capacity: pr.capacity || pr.max || 0,
          })) || [],
        policies: ev.policies || [],
        amenities: ev.amenities?.activity || [],
        existingPictures: ev.pictures || [],
        newPictures: [],
        musicGenre: Array.isArray(ev.musicGenre)
          ? ev.musicGenre
          : ev.musicGenre
          ? [ev.musicGenre]
          : [],
        familyFriendly: ev.familyFriendly || false,
        durationDays: ev.durationDays || "",
        stages: ev.stages || [],
        category: ev.category || "",
      };
    } else {
      initialObj = {
        type: "",
        eventName: "",
        artistName: "",
        supportingArtists: [],
        venue: { name: "", city: "", address: "" },
        description: "",
        eventDate: "",
        tickets: [],
        policies: [],
        amenities: [],
        existingPictures: [],
        newPictures: [],
        musicGenre: [],
        familyFriendly: false,
        durationDays: "",
        stages: [],
        category: "",
      };
    }
    initialFormRef.current = initialObj;
    return initialObj;
  });

  const set = (patch) => setFormData((prev) => ({ ...prev, ...patch }));
  const [isSaved, setIsSaved] = useState(false);

  const hasUnsavedChanges = React.useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormRef.current);
  }, [formData]);

  useBlocker(({ currentLocation, nextLocation }) => {
    if (hasUnsavedChanges && !isSaved && currentLocation.pathname !== nextLocation.pathname) {
      return !window.confirm("You have unsaved changes. Are you sure you want to leave?");
    }
    return false;
  });

  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !isSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const [newAmenity, setNewAmenity] = useState("");
  const [newTicket, setNewTicket] = useState({
    name: "",
    price: "",
    capacity: "",
  });
  const posterInputRef = useRef(null);
  const [error, setError] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const form = new FormData();
      if (payload.status) form.append("status", payload.status);
      form.append("type", payload.type);
      form.append("name", payload.name);
      form.append("locale", payload.locale ?? "");
      form.append("desc", payload.desc ?? "");
      form.append("artist", JSON.stringify(payload.artist));
      form.append("links", JSON.stringify(payload.links));
      form.append("priceRanges", JSON.stringify(payload.priceRanges));
      form.append("policies", JSON.stringify(payload.policies));
      form.append("dates", JSON.stringify(payload.dates));
      form.append("amenities", JSON.stringify(payload.amenities));
      form.append("musicGenre", JSON.stringify(payload.musicGenre));
      form.append("familyFriendly", payload.familyFriendly);
      form.append("existingPictures", JSON.stringify(payload.existingPictures));
      if (payload.durationDays !== undefined)
        form.append("durationDays", payload.durationDays);
      if (payload.stages) form.append("stages", JSON.stringify(payload.stages));
      if (payload.category) form.append("category", payload.category);

      formData.newPictures.forEach((img) => form.append("pictures", img));

      const res = await api.put(`/api/auth/admin/events/${eventId}`, form);
      return res.data;
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
      queryClient.invalidateQueries(["events"]);
      setIsSaved(true);
      setTimeout(() => navigate("/admin/events"), 2000);
    },
    onError: (err) => toast.error(getFriendlyErrorMessage(err)),
  });

  const handleSubmit = (publishStatus = null) => {
    if (!formData.eventName) return setError("Event Name is required");
    if (!formData.venue.name) return setError("Venue name is required");
    setError("");

    const type = formData.type.toLowerCase();

    const payload = {
      type,
      name: formData.eventName,
      artist: {
        name: formData.artistName,
        ...(type === "concert" && { supporting: formData.supportingArtists }),
      },
      locale: "",
      desc: formData.description,
      existingPictures: formData.existingPictures,
      policies: formData.policies,
      links: {
        self: {
          href: `/events/${formData.eventName
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
        },
        attractions: [],
        venues: {
          name: formData.venue.name,
          city: formData.venue.city,
          address: formData.venue.address,
          pictures: [],
        },
      },
      priceRanges: formData.tickets.map((t) => ({
        type: t.name,
        currency: "ETB",
        min: Number(t.price),
        max: Number(t.price),
        capacity: Number(t.capacity),
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
      musicGenre: type === "concert" ? formData.musicGenre : ["General"],
      familyFriendly: formData.familyFriendly,
      ...(type === "festival" && {
        durationDays: Number(formData.durationDays) || 0,
        stages: formData.stages,
      }),
      ...(type === "generic" && { category: formData.category }),
    };

    if (publishStatus) {
      payload.status = publishStatus;
    }

    updateMutation.mutate(payload);
  };

  if (!formData.eventName && !eventData?.event) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-[#FF7A00] animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-[0.2em]">
          Syncing Terminal...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-8 pb-20">

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
        <div className="flex gap-4">
          <button
            onClick={() => handleSubmit()}
            disabled={updateMutation.isLoading}
            className="mt-4 md:mt-0 px-6 py-4 bg-transparent border border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-black text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} strokeWidth={3} />
            {updateMutation.isLoading ? "Saving..." : "Save Changes"}
          </button>

          {eventData?.event?.status === "draft" && (
            <button
              onClick={() => handleSubmit("published")}
              disabled={updateMutation.isLoading}
              className="mt-4 md:mt-0 px-6 py-4 bg-[#FF7A00] text-black hover:bg-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <Upload size={16} strokeWidth={3} />
              Publish Event
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Classification */}
          <SectionCard icon={Tag} title="Classification Type">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                Choose event type — extra fields will appear below
              </p>
              <CustomSelect
                options={[
                  { label: "Concert", value: "concert" },
                  { label: "Festival", value: "festival" },
                  { label: "Generic", value: "generic" },
                ]}
                value={formData.type.toLowerCase()}
                onChange={(val) => set({ type: val })}
                placeholder="Select Type"
              />
            </div>
          </SectionCard>

          {/* Transmission Details */}
          <SectionCard title="Transmission Details">
            <div className="space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => set({ eventName: e.target.value })}
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

              {/* Artist + Venue Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                    Artist / Talent
                  </label>
                  <input
                    type="text"
                    value={formData.artistName}
                    onChange={(e) => set({ artistName: e.target.value })}
                    className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none transition-colors"
                    placeholder="Main artist"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={formData.venue.name}
                    onChange={(e) =>
                      set({
                        venue: { ...formData.venue, name: e.target.value },
                      })
                    }
                    className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none transition-colors"
                    placeholder="e.g. Millennium Hall"
                  />
                </div>
              </div>

              {/* City + Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.venue.city}
                    onChange={(e) =>
                      set({
                        venue: { ...formData.venue, city: e.target.value },
                      })
                    }
                    className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none transition-colors"
                    placeholder="e.g. Addis Ababa"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.venue.address}
                    onChange={(e) =>
                      set({
                        venue: { ...formData.venue, address: e.target.value },
                      })
                    }
                    className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none transition-colors"
                    placeholder="e.g. Bole Road"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => set({ description: e.target.value })}
                  className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none transition-colors italic"
                  placeholder="Event details..."
                />
              </div>
            </div>
          </SectionCard>

          {/* Tickets */}
          <SectionCard title="Event Tickets">
            <div className="space-y-4">
              {formData.tickets.map((ticket, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-center bg-[#121417] p-5 rounded-xl border border-white/[0.06]"
                >
                  <div className="flex-1">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                      Ticket Name
                    </label>
                    <CustomSelect
                      options={[
                        { label: "Regular", value: "Regular" },
                        { label: "Early Bird", value: "Early Bird" },
                        { label: "VIP", value: "VIP" },
                        { label: "VVIP", value: "VVIP" },
                      ]}
                      value={ticket.name}
                      onChange={(val) => {
                        const updated = [...formData.tickets];
                        updated[idx].name = val;
                        set({ tickets: updated });
                      }}
                      placeholder="Ticket Type"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">
                      Price (ETB)
                    </label>
                    <input
                      value={ticket.price}
                      onChange={(e) => {
                        const updated = [...formData.tickets];
                        updated[idx].price = e.target.value;
                        set({ tickets: updated });
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
                      value={ticket.capacity}
                      onChange={(e) => {
                        const updated = [...formData.tickets];
                        updated[idx].capacity = e.target.value;
                        set({ tickets: updated });
                      }}
                      className="bg-transparent border-none text-white font-bold outline-none w-full no-spinner"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      set({
                        tickets: formData.tickets.filter((_, i) => i !== idx),
                      })
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* New ticket row */}
              <div className="flex gap-4 items-center bg-[#121417] p-5 rounded-xl border border-dashed border-[#FF7A00]">
                <div className="flex-1">
                  <CustomSelect
                    options={[
                      { label: "Regular", value: "Regular" },
                      { label: "Early Bird", value: "Early Bird" },
                      { label: "VIP", value: "VIP" },
                      { label: "VVIP", value: "VVIP" },
                    ]}
                    value={newTicket.name}
                    onChange={(val) => setNewTicket({ ...newTicket, name: val })}
                    placeholder="Ticket Type"
                  />
                </div>
                <div className="w-24">
                  <input
                    value={newTicket.price}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, price: e.target.value })
                    }
                    className="bg-transparent border-none text-[#FF7A00] font-black outline-none w-full placeholder:text-gray-400"
                    placeholder="Price"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={newTicket.capacity}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, capacity: e.target.value })
                    }
                    className="bg-transparent border-none text-white font-bold outline-none w-full no-spinner"
                    placeholder="Capacity"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      newTicket.name.trim() !== "" &&
                      newTicket.price !== "" &&
                      newTicket.capacity !== ""
                    ) {
                      set({ tickets: [...formData.tickets, { ...newTicket }] });
                      setNewTicket({ name: "", price: "", capacity: "" });
                    } else {
                      toast.error("Please fill in Ticket Name, Price, and Capacity to add a ticket.");
                    }
                  }}
                  className="ml-2 text-[#22c55e] border border-[#22c55e] rounded-full p-2"
                >
                  <Check size={18} />
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Policies */}
          <SectionCard title="Event Policies">
            <div className="space-y-4">
              {formData.policies.map((policy, idx) => (
                <div
                  key={idx}
                  className="bg-[#121417] p-5 rounded-xl border border-white/[0.06] space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <input
                      value={policy.header}
                      onChange={(e) => {
                        const updated = [...formData.policies];
                        updated[idx].header = e.target.value;
                        set({ policies: updated });
                      }}
                      className="bg-transparent border-none text-white font-bold outline-none w-full uppercase text-xs"
                      placeholder="Policy Header"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        set({
                          policies: formData.policies.filter(
                            (_, i) => i !== idx,
                          ),
                        })
                      }
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
                      set({ policies: updated });
                    }}
                    className="w-full bg-transparent border-none text-gray-400 text-[11px] outline-none italic resize-none"
                    placeholder="Policy details..."
                    rows={2}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  set({
                    policies: [
                      ...formData.policies,
                      { header: "", descriptions: "" },
                    ],
                  })
                }
                className="w-full py-4 border border-dashed border-white/[0.1] rounded-xl text-gray-500 hover:text-[#FF7A00] hover:border-[#FF7A00] transition-all text-[10px] font-black uppercase tracking-widest"
              >
                + Add New Policy
              </button>
            </div>
          </SectionCard>

          {/* ── CONCERT SPECIFIC ── */}
          {formData.type === "concert" && (
            <SectionCard icon={Music} title="Concert Details" badge="Concert">
              <PillMultiSelect
                label="Music Genre"
                options={[
                  "Pop",
                  "Rock",
                  "Hip-Hop",
                  "Electronic",
                  "Jazz",
                  "Afrobeats",
                  "Gospel",
                  "R&B",
                  "Other",
                ]}
                value={formData.musicGenre}
                onChange={(val) => set({ musicGenre: val })}
              />
              <ChipInput
                label="Supporting Artists"
                items={formData.supportingArtists}
                onAdd={(v) =>
                  set({ supportingArtists: [...formData.supportingArtists, v] })
                }
                onRemove={(i) =>
                  set({
                    supportingArtists: formData.supportingArtists.filter(
                      (_, idx) => idx !== i,
                    ),
                  })
                }
                placeholder="e.g. Opening act name..."
              />
              <Toggle
                label="Family Friendly"
                value={formData.familyFriendly}
                onChange={(v) => set({ familyFriendly: v })}
              />
            </SectionCard>
          )}

          {/* ── FESTIVAL SPECIFIC ── */}
          {formData.type === "festival" && (
            <SectionCard icon={Flag} title="Festival Details" badge="Festival">
              <div>
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => set({ durationDays: e.target.value })}
                  className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#FF7A00]/50 transition-colors no-spinner"
                  placeholder="e.g. 3"
                />
              </div>
              <ChipInput
                label="Stages"
                items={formData.stages}
                onAdd={(v) => set({ stages: [...formData.stages, v] })}
                onRemove={(i) =>
                  set({ stages: formData.stages.filter((_, idx) => idx !== i) })
                }
                placeholder="e.g. Main Stage, Pyramid..."
              />
              <Toggle
                label="Family Friendly"
                value={formData.familyFriendly}
                onChange={(v) => set({ familyFriendly: v })}
              />
            </SectionCard>
          )}

          {/* ── GENERIC SPECIFIC ── */}
          {formData.type === "generic" && (
            <SectionCard icon={Zap} title="Event Category" badge="Generic">
              <PillSelect
                label="Category"
                options={[
                  "Sports",
                  "Conference",
                  "Expo",
                  "Community",
                  "Corporate",
                  "Religious",
                  "Exhibition",
                  "Other",
                ]}
                value={formData.category}
                onChange={(v) => set({ category: v })}
              />
            </SectionCard>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-8">
          {/* Schedule */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem]">
            <h3 className="text-white font-bold uppercase tracking-tight mb-6 text-sm flex items-center gap-2">
              <CalendarDays size={14} className="text-[#FF7A00]" /> Schedule
            </h3>
            <DatePickerPanel
              value={formData.eventDate}
              onChange={(val) => set({ eventDate: val })}
            />
          </div>

          {/* Amenities */}
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
                    onClick={() =>
                      set({
                        amenities: formData.amenities.filter(
                          (_, idx) => idx !== i,
                        ),
                      })
                    }
                  />
                </div>
              ))}
              <div className="relative pt-2">
                <input
                  className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-[#FF7A00]/50 font-bold uppercase transition-colors"
                  placeholder="NEW AMENITY..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newAmenity.trim()) {
                      set({
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
                      set({
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

          {/* Flyer Archive */}
          <div className="bg-[#1C1F22] border border-white/[0.04] p-8 rounded-[2rem] space-y-6">
            <h3 className="text-white font-bold uppercase tracking-tight text-sm">
              Flyer Archive
            </h3>
            <div className="space-y-4">
              {/* Existing pictures */}
              {formData.existingPictures.map((src, index) => (
                <div
                  key={`existing-${index}`}
                  className="w-full bg-[#121417] border border-white/10 rounded-[1.5rem] p-4 flex gap-4 items-center"
                >
                  <img
                    src={`${API_URL}/${src}`}
                    className="w-16 h-16 rounded-xl object-cover opacity-80"
                    alt="existing"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-gray-300 truncate">
                      Existing Asset
                    </p>
                    <p className="text-[9px] font-bold text-gray-600 uppercase italic truncate">
                      {src}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      set({
                        existingPictures: formData.existingPictures.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                    className="p-2 text-red-500/60 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {/* New pictures */}
              {formData.newPictures.map((file, index) => (
                <div
                  key={`new-${index}`}
                  className="w-full bg-[#121417] border border-white/10 rounded-[1.5rem] p-4 flex gap-4 items-center"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-16 h-16 rounded-xl object-cover opacity-80"
                    alt="new"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-[#FF7A00] truncate">
                      {file.name}
                    </p>
                    <p className="text-[9px] font-bold text-gray-600 uppercase italic">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      set({
                        newPictures: formData.newPictures.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                    className="p-2 text-red-500/60 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => posterInputRef.current?.click()}
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
                    set({ newPictures: [...formData.newPictures, ...files] });
                }}
              />
              <Plus
                size={32}
                strokeWidth={4}
                className="group-hover:scale-110 transition-transform"
              />
              <p className="font-black text-[11px] uppercase tracking-[0.2em] italic">
                Add New Media
              </p>
            </button>
          </div>

          <div className="p-6 bg-[#FF7A00]/5 border border-[#FF7A00]/10 rounded-3xl flex items-center gap-4">
            <ShieldCheck size={24} className="text-[#FF7A00]" />
            <div>
              <p className="text-sm font-bold">Terminal Root Access</p>
              <p className="text-xs text-gray-500">Authorized changes only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
