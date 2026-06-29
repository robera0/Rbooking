import React, { useState, useRef } from "react";
import {
  Plus,
  Save,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Music,
  Tag,
  Zap,
  Check,
  Flag,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";
import { CustomSelect } from "./Cards";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StaticDateTimePicker } from "@mui/x-date-pickers/StaticDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// ─── MUI Orange Theme ──────────────────────────────────────────────────────
const orangeTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FF7A00",
      light: "#FF9A40",
      dark: "#CC6200",
      contrastText: "#000000",
    },
    background: {
      default: "#121417",
      paper: "#1C1F22",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#9CA3AF",
    },
  },
  components: {
    MuiPickersToolbar: {
      styleOverrides: {
        root: {
          color: "#FF7A00",
          borderRadius: "16px 16px 0 0",
          borderWidth: "1px",
          borderColor: "rgba(255,122,0,0.2)",
          border: "1px solid rgba(255,122,0,0.2)",
          backgroundColor: "#1C1F22",
        },
      },
    },
    MuiPickersLayout: {
      styleOverrides: {
        root: {
          backgroundColor: "#1C1F22",
          borderRadius: "16px",
          border: "1px solid rgba(255,122,0,0.15)",
        },
        contentWrapper: {
          backgroundColor: "#1C1F22",
        },
      },
    },
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1C1F22",
          color: "#FFFFFF",
          width: "100%",
          maxHeight: "none",
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          color: "#FF7A00",
          paddingLeft: "16px",
          paddingRight: "16px",
        },
        label: {
          color: "#FF7A00",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: "0.75rem",
        },
        switchViewButton: {
          color: "#FF7A00",
        },
      },
    },
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        button: {
          color: "#FF7A00",
          "&:hover": {
            backgroundColor: "rgba(255,122,0,0.1)",
          },
        },
      },
    },
    MuiDayCalendar: {
      styleOverrides: {
        weekDayLabel: {
          color: "#6B7280",
          fontWeight: 900,
          textTransform: "uppercase",
          fontSize: "0.6rem",
          letterSpacing: "0.08em",
        },
        header: {
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          paddingBottom: "8px",
          marginBottom: "4px",
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: "#FFFFFF",
          backgroundColor: "transparent",
          fontWeight: 700,
          fontSize: "0.75rem",
          borderRadius: "50%",
          "&:hover": {
            backgroundColor: "rgba(255,122,0,0.15)",
            color: "#FF7A00",
          },
          "&.Mui-selected": {
            backgroundColor: "#FF7A00 !important",
            color: "#000000 !important",
            fontWeight: 900,
            "&:hover": {
              backgroundColor: "#FF9A40 !important",
            },
            "&:focus": {
              backgroundColor: "#FF7A00 !important",
            },
          },
          "&.MuiPickersDay-today": {
            border: "1.5px solid #FF7A00",
            color: "#FF7A00",
            backgroundColor: "transparent",
            "&.Mui-selected": {
              backgroundColor: "#FF7A00 !important",
              color: "#000 !important",
            },
          },
          "&.Mui-disabled": {
            color: "#374151",
          },
        },
      },
    },
    MuiClock: {
      styleOverrides: {
        root: {
          backgroundColor: "#121417",
          border: "1px solid rgba(255,122,0,0.1)",
        },
        clock: {
          backgroundColor: "#121417",
        },
        pin: {
          backgroundColor: "#FF7A00",
        },
        amButton: {
          color: "#9CA3AF",
          "&.Mui-selected": {
            backgroundColor: "#FF7A00",
            color: "#000",
          },
        },
        pmButton: {
          color: "#9CA3AF",
          "&.Mui-selected": {
            backgroundColor: "#FF7A00",
            color: "#000",
          },
        },
      },
    },
    MuiClockPointer: {
      styleOverrides: {
        root: {
          backgroundColor: "#FF7A00",
        },
        thumb: {
          backgroundColor: "#FF7A00",
          border: "2px solid #FF7A00",
        },
      },
    },
    MuiClockNumber: {
      styleOverrides: {
        root: {
          color: "#9CA3AF",
          fontWeight: 700,
          fontSize: "0.7rem",
          "&.Mui-selected": {
            backgroundColor: "#FF7A00",
            color: "#000000",
            fontWeight: 900,
          },
        },
      },
    },
    MuiTimeClock: {
      styleOverrides: {
        root: {
          backgroundColor: "#1C1F22",
        },
      },
    },
    MuiPickersToolbarText: {
      styleOverrides: {
        root: {
          color: "#9CA3AF",
          "&.Mui-selected": {
            color: "#FF7A00",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#6B7280",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontSize: "0.6rem",
          minHeight: "40px",
          "&.Mui-selected": {
            color: "#FF7A00",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "#FF7A00",
        },
        root: {
          backgroundColor: "#121417",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        },
      },
    },
    MuiPickersYear: {
      styleOverrides: {
        yearButton: {
          color: "#9CA3AF",
          fontWeight: 700,
          fontSize: "0.75rem",
          borderRadius: "8px",
          "&.Mui-selected": {
            backgroundColor: "#FF7A00",
            color: "#000000",
            fontWeight: 900,
            "&:hover": {
              backgroundColor: "#FF9A40",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(255,122,0,0.15)",
            color: "#FF7A00",
          },
        },
      },
    },
    MuiPickersMonth: {
      styleOverrides: {
        monthButton: {
          color: "#9CA3AF",
          fontWeight: 700,
          fontSize: "0.75rem",
          borderRadius: "8px",
          "&.Mui-selected": {
            backgroundColor: "#FF7A00",
            color: "#000000",
            fontWeight: 900,
          },
          "&:hover": {
            backgroundColor: "rgba(255,122,0,0.15)",
            color: "#FF7A00",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#FF7A00",
          "&:hover": {
            backgroundColor: "rgba(255,122,0,0.1)",
          },
        },
      },
    },
    MuiPickersLayout: {
      styleOverrides: {
        actionBar: {
          display: "none", // hide default OK/Cancel buttons
        },
      },
    },
  },
});

// ─── Date Picker Panel ─────────────────────────────────────────────────────
const DatePickerPanel = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  // Internal draft value so clock/calendar can freely update their own view
  const [draft, setDraft] = useState(value ? dayjs(value) : dayjs());
  const confirmed = value ? dayjs(value) : null;

  const handleConfirm = () => {
    onChange(draft.format("YYYY-MM-DDTHH:mm"));
    setOpen(false);
  };

  const handleOpen = () => {
    // Reset draft to current confirmed value (or now) each time panel opens
    setDraft(value ? dayjs(value) : dayjs());
    setOpen(true);
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={open ? handleConfirm : handleOpen}
        className="flex items-center gap-3 px-4 py-4 w-full bg-[#121417] border border-[#FF7A00]/60 hover:border-[#FF7A00] rounded-xl text-white font-bold outline-none transition-colors"
      >
        <CalendarDays size={18} className="text-[#FF7A00] shrink-0" />
        <span className="text-sm font-bold">
          {confirmed && !open
            ? confirmed.format("ddd, MMM D YYYY · HH:mm")
            : open
            ? draft?.format("ddd, MMM D YYYY · HH:mm") ?? "Pick Date & Time"
            : "Pick Date & Time"}
        </span>
        <span className="ml-auto text-[#FF7A00] text-[10px] font-black uppercase tracking-widest">
          {open ? "Confirm ✓" : "Edit"}
        </span>
      </button>

      {/* Inline calendar + clock panel */}
      {open && (
        <div className="mt-3 rounded-2xl overflow-hidden border border-[#FF7A00]/15 shadow-2xl">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={orangeTheme}>
              <StaticDateTimePicker
                value={draft}
                onChange={(newVal) => {
                  if (newVal) setDraft(newVal);
                }}
                disablePast
                ampm={false}
                slotProps={{
                  // Replace action bar with our own confirm button above
                  actionBar: { actions: [] },
                  toolbar: {
                    toolbarFormat: "ddd DD MMM",
                    hidden: false,
                  },
                }}
                sx={{
                  width: "100%",
                  // Calendar grid must have auto height so all rows show
                  "& .MuiDateCalendar-root": {
                    width: "100%",
                    height: "auto",
                    maxHeight: "none",
                  },
                  "& .MuiDayCalendar-monthContainer": {
                    height: "auto",
                    minHeight: "200px",
                  },
                  "& .MuiDayCalendar-weekContainer": {
                    margin: "2px 0",
                  },
                  // Clock face sizing
                  "& .MuiTimeClock-root": {
                    width: "100%",
                  },
                  "& .MuiClock-root": {
                    width: "220px",
                    height: "220px",
                    margin: "0 auto",
                  },
                  "& .MuiPickersLayout-root": {
                    width: "100%",
                    backgroundColor: "#1C1F22",
                  },
                  "& .MuiPickersLayout-contentWrapper": {
                    width: "100%",
                    backgroundColor: "#1C1F22",
                  },
                  // Hide empty action bar space
                  "& .MuiPickersLayout-actionBar": {
                    display: "none",
                  },
                }}
              />
            </ThemeProvider>
          </LocalizationProvider>

          {/* Custom confirm row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 16px 14px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              backgroundColor: "#1C1F22",
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#6B7280",
              }}
            >
              {draft?.format("dddd, MMMM D, YYYY · HH:mm")}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "#9CA3AF",
                  fontSize: "0.6rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  padding: "6px 20px",
                  borderRadius: "9999px",
                  background: "#FF7A00",
                  color: "#000",
                  fontSize: "0.6rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display confirmed date below trigger when closed */}
      {!open && confirmed && (
        <div className="mt-2 flex items-center gap-2 px-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
            {confirmed.format("dddd, MMMM D, YYYY")}
          </span>
          <span className="text-[10px] text-[#FF7A00] font-black uppercase tracking-widest ml-auto">
            {confirmed.format("HH:mm")}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Reusable chip-tag input ───────────────────────────────────────────────
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

// ─── Pill selector (single) ────────────────────────────────────────────────
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

// ─── Pill selector (multi) ─────────────────────────────────────────────────
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

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
const AddEvent = () => {
  const navigate = useNavigate();
  const { API_URL } = useService();
  const queryClient = useQueryClient();

  const EMPTY_FORM = {
    type: "",
    eventName: "",
    artistName: "",
    venue: "",
    locale: "",
    description: "",
    eventDate: "",
    tickets: [],
    policies: [],
    links: {},
    amenities: [],
    pictures: [],
    musicGenre: [],
    supportingArtists: [],
    familyFriendly: false,
    durationDays: "",
    stages: [],
    category: "",
  };

  const [formData, setFormData] = useState(EMPTY_FORM);
  const set = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const [newTicket, setNewTicket] = useState({
    name: "",
    price: "",
    capacity: "",
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [error, setError] = useState("");

  const posterInputRef = useRef(null);

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const form = new FormData();
      form.append("type", payload.type);
      form.append("name", payload.name);
      form.append("links", JSON.stringify(payload.links));
      form.append("desc", payload.desc);
      form.append("local", payload.locale);
      form.append("artist", JSON.stringify(payload.artist));
      form.append("priceRanges", JSON.stringify(payload.priceRanges));
      form.append("policies", JSON.stringify(payload.policies));
      form.append("dates", JSON.stringify(payload.dates));

      form.append("amenities", JSON.stringify(payload.amenities));
      form.append("musicGenre", JSON.stringify(payload.musicGenre));
      if (payload.familyFriendly !== undefined)
        form.append("familyFriendly", payload.familyFriendly);
      if (payload.durationDays !== undefined)
        form.append("durationDays", payload.durationDays);
      if (payload.stages) form.append("stages", JSON.stringify(payload.stages));
      if (payload.category) form.append("category", payload.category);
      formData.pictures.forEach((img) => form.append("pictures", img));

      const res = await fetch(`${API_URL}/api/auth/admin/addEvents`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: (data) => {
      const eventId = data?.events?._id;
      createTicketsMutation.mutate({ eventId, tickets: formData.tickets });
      toast.success("Event Published Successfully!", {
        duration: 2000,
        style: {
          background: "#1C1F22",
          color: "#fff",
          border: "1px solid #FF7A00",
        },
      });
      setFormData(EMPTY_FORM);
      setTimeout(() => navigate("/admin/events"), 2000);
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  // 2. Tickets mutation

  const createTicketsMutation = useMutation({
    mutationFn: async ({ eventId, tickets }) => {
      const res = await fetch(
        `${API_URL}/api/auth/admin/events/${eventId}/tickets`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tickets }),
        },
      );
      if (!res.ok) throw new Error("Failed to create tickets");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Event Published Successfully!", {
        duration: 2000,
        style: {
          background: "#1C1F22",
          color: "#fff",
          border: "1px solid #FF7A00",
        },
      });
      setFormData(EMPTY_FORM);
      setTimeout(() => navigate("/admin/events"), 2000);
    },
    onError: (err) => toast.error(`Tickets error: ${err.message}`),
  });

  const handleSubmit = () => {
    if (!formData.eventName) return setError("Event Name is required");
    if (!formData.venue.name) return setError("Venue name is required");
    if (!formData.eventName)
      return setError("Event Name is required to publish");
    setError("");

    const type = formData.type.toLowerCase();

    const basePayload = {
      type,
      name: formData.eventName,
      artist: { name: formData.artistName },
      locale: "ETH",
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
      policies: formData.policies,
      priceRanges: formData.tickets.map((t) => ({
        type: t.name,
        currency: "ETB",
        min: Number(t.price),
        max: Number(t.price),
      })),
      desc: formData.description,
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
    };

    if (type === "concert") {
      basePayload.artist.supporting = formData.supportingArtists;
      basePayload.familyFriendly = formData.familyFriendly;
    }
    if (type === "festival") {
      basePayload.durationDays = Number(formData.durationDays) || 0;
      basePayload.stages = formData.stages;
      basePayload.familyFriendly = formData.familyFriendly;
    }
    if (type === "generic") {
      basePayload.category = formData.category;
    }

    createMutation.mutate(basePayload);
  };

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
              Create{" "}
              <span className="text-[#FF7A00]">{formData.type || "Event"}</span>
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
        {/* ── LEFT COLUMN ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Type selector */}
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
                value={formData.type}
                onChange={(val) => set({ type: val })}
                placeholder="Select Type"
              />
            </div>
          </SectionCard>

          {/* Core details */}
          <SectionCard title="Transmission Details">
            <div className="space-y-4">
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
              <div className="space-y-4">
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
                      placeholder="e.g. The Venue Warehouse"
                    />
                  </div>
                </div>

                {/* City + Address as their own row */}
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
                      placeholder="e.g. Welo Sefer"
                    />
                  </div>
                </div>
              </div>
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
                    <input
                      value={ticket.name}
                      onChange={(e) => {
                        const updated = [...formData.tickets];
                        updated[idx].name = e.target.value;
                        set({ tickets: updated });
                      }}
                      className="bg-transparent border-none text-white font-bold outline-none w-full uppercase"
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
                  <input
                    value={newTicket.name}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, name: e.target.value })
                    }
                    className="bg-transparent border-none text-white font-bold outline-none w-full uppercase"
                    placeholder="Ticket Name"
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
                <div className="w-24">
                  <input
                    type="number"
                    value={newTicket.capacity}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, capacity: e.target.value })
                    }
                    className="bg-transparent border-none text-white font-bold outline-none w-full no-spinner"
                    placeholder="Cap"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      newTicket.name &&
                      newTicket.price &&
                      newTicket.capacity
                    ) {
                      set({ tickets: [...formData.tickets, { ...newTicket }] });
                      setNewTicket({ name: "", price: "", capacity: "" });
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

          {/* ── CONCERT-SPECIFIC ─────────────────────────────────────────── */}
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

          {/* ── FESTIVAL-SPECIFIC ─────────────────────────────────────────── */}
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

          {/* ── GENERIC-SPECIFIC ─────────────────────────────────────────── */}
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

        {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
        <div className="space-y-8">
          {/* Schedule — MUI DateTimePicker */}
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
              {formData.pictures.map((file, index) => (
                <div
                  key={index}
                  className="w-full bg-[#121417] border border-white/10 rounded-[1.5rem] p-4 flex gap-4 items-center"
                >
                  <div className="w-16 h-16 rounded-xl border border-white/5 overflow-hidden shrink-0 bg-black">
                    {file.type?.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs flex items-center justify-center h-full">
                        No Preview
                      </span>
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
                    onClick={() =>
                      set({
                        pictures: formData.pictures.filter(
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
                    set({ pictures: [...formData.pictures, ...files] });
                }}
              />
              <Plus
                size={32}
                strokeWidth={4}
                className="group-hover:scale-110 transition-transform"
              />
              <p className="font-black text-[11px] uppercase tracking-[0.2em] italic">
                Add Cover photo
              </p>
            </button>
          </div>

          <div className="p-6 bg-[#FF7A00]/5 border border-[#FF7A00]/10 rounded-3xl flex items-center gap-4">
            <ShieldCheck size={24} className="text-[#FF7A00]" />
            <div>
              <p className="text-sm font-bold">Secure Booking</p>
              <p className="text-xs text-gray-500">
                Fast checkout and verified tickets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;
