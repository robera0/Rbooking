import React, { useState } from "react";
import { CalendarDays } from "lucide-react";
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
        actionBar: {
          display: "none",
        },
      },
    },
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1C1F22",
          color: "#FFFFFF",
          width: "100%",
          height: "auto",
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
          "&:hover": { backgroundColor: "rgba(255,122,0,0.1)" },
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
        monthContainer: {
          height: "auto",
          minHeight: "200px",
        },
        weekContainer: {
          margin: "2px 0",
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
            "&:hover": { backgroundColor: "#FF9A40 !important" },
            "&:focus": { backgroundColor: "#FF7A00 !important" },
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
          "&.Mui-disabled": { color: "#374151" },
        },
      },
    },
    MuiTimeClock: {
      styleOverrides: {
        root: { backgroundColor: "#1C1F22" },
      },
    },
    MuiClock: {
      styleOverrides: {
        root: {
          backgroundColor: "#121417",
          border: "1px solid rgba(255,122,0,0.1)",
        },
        clock: { backgroundColor: "#121417" },
        pin: { backgroundColor: "#FF7A00" },
        amButton: {
          color: "#9CA3AF",
          "&.Mui-selected": { backgroundColor: "#FF7A00", color: "#000" },
        },
        pmButton: {
          color: "#9CA3AF",
          "&.Mui-selected": { backgroundColor: "#FF7A00", color: "#000" },
        },
      },
    },
    MuiClockPointer: {
      styleOverrides: {
        root: { backgroundColor: "#FF7A00" },
        thumb: { backgroundColor: "#FF7A00", border: "2px solid #FF7A00" },
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
    MuiPickersToolbarText: {
      styleOverrides: {
        root: {
          color: "#9CA3AF",
          "&.Mui-selected": { color: "#FF7A00" },
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
          "&.Mui-selected": { color: "#FF7A00" },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: "#FF7A00" },
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
            "&:hover": { backgroundColor: "#FF9A40" },
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
          "&:hover": { backgroundColor: "rgba(255,122,0,0.1)" },
        },
      },
    },
  },
});

// ─── DatePickerPanel ───────────────────────────────────────────────────────
// Props:
//   value    — string in "YYYY-MM-DDTHH:mm" format (or "")
//   onChange — (value: string) => void   called on Confirm
//
// Usage:
//   import DatePickerPanel from "@/Components/DatePickerPanel";
//   <DatePickerPanel value={formData.eventDate} onChange={(v) => set({ eventDate: v })} />
// ──────────────────────────────────────────────────────────────────────────
const DatePickerPanel = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  // draft = the in-progress selection while the panel is open
  const [draft, setDraft] = useState(value ? dayjs(value) : dayjs());
  const confirmed = value ? dayjs(value) : null;

  const handleOpen = () => {
    setDraft(value ? dayjs(value) : dayjs());
    setOpen(true);
  };

  const handleConfirm = () => {
    onChange(draft.format("YYYY-MM-DDTHH:mm"));
    setOpen(false);
  };

  const handleCancel = () => setOpen(false);

  return (
    <div>
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={open ? handleConfirm : handleOpen}
        className="flex items-center gap-3 px-4 py-4 w-full bg-[#121417] border border-[#FF7A00]/60 hover:border-[#FF7A00] rounded-xl text-white font-bold outline-none transition-colors"
      >
        <CalendarDays size={18} className="text-[#FF7A00] shrink-0" />
        <span className="text-sm font-bold">
          {open
            ? draft?.format("ddd, MMM D YYYY · HH:mm") ?? "Pick Date & Time"
            : confirmed
            ? confirmed.format("ddd, MMM D YYYY · HH:mm")
            : "Pick Date & Time"}
        </span>
        <span className="ml-auto text-[#FF7A00] text-[10px] font-black uppercase tracking-widest">
          {open ? "Confirm ✓" : "Edit"}
        </span>
      </button>

      {/* ── Inline calendar + clock ── */}
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
                  actionBar: { actions: [] },
                  toolbar: { toolbarFormat: "ddd DD MMM", hidden: false },
                }}
                sx={{
                  width: "100%",
                  "& .MuiDateCalendar-root": {
                    width: "100%",
                    height: "auto",
                    maxHeight: "none",
                  },
                  "& .MuiDayCalendar-monthContainer": {
                    height: "auto",
                    minHeight: "200px",
                  },
                  "& .MuiDayCalendar-weekContainer": { margin: "2px 0" },
                  "& .MuiTimeClock-root": { width: "100%" },
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
                  "& .MuiPickersLayout-actionBar": { display: "none" },
                }}
              />
            </ThemeProvider>
          </LocalizationProvider>

          {/* ── Custom confirm/cancel row ── */}
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
                onClick={handleCancel}
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

      {/* ── Confirmed date summary (shown when panel is closed) ── */}
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

export default DatePickerPanel;
