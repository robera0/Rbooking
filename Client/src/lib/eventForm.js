// Pure helpers for the event form (no React), so the rules can be tested.

// Events are scheduled in Addis Ababa time, which is always UTC+3 (no DST).
const VENUE_OFFSET = "+03:00";
const VENUE_OFFSET_MS = 3 * 60 * 60 * 1000;

const trimTime = (t) => (typeof t === "string" ? t.slice(0, 5) : "");

// One side (start or end) of an event's dates as { d: "YYYY-MM-DD", t: "HH:mm" }.
// Prefers the stored wall-clock strings; falls back to the UTC time shown in
// Addis Ababa time.
function readSide(side) {
  if (side?.localDate && side?.localTime) {
    return { d: side.localDate, t: trimTime(side.localTime) };
  }
  if (side?.dateTime) {
    const local = new Date(new Date(side.dateTime).getTime() + VENUE_OFFSET_MS);
    if (!Number.isNaN(local.getTime())) {
      const iso = local.toISOString();
      return { d: iso.slice(0, 10), t: iso.slice(11, 16) };
    }
  }
  return { d: side?.localDate || "", t: "" };
}

export function datePartsFromEvent(dates) {
  const start = readSide(dates?.start);
  const end = readSide(dates?.end);
  return { startD: start.d, startT: start.t, endD: end.d, endT: end.t };
}

// What the server gets. The end is only included when it is complete.
export function buildDatesPayload({ startD, startT, endD, endT }) {
  const side = (d, t) => ({
    localDate: d,
    localTime: t,
    // A naive "YYYY-MM-DD" + "HH:mm" for the venue; the offset is explicit so
    // it does not depend on the organizer's own time zone.
    dateTime: d && t ? new Date(`${d}T${t}:00${VENUE_OFFSET}`) : null,
  });
  const payload = { start: side(startD, startT) };
  if (endD && endT) payload.end = side(endD, endT);
  return payload;
}

export function endBeforeStart({ startD, startT, endD, endT }) {
  if (!startD || !startT || !endD || !endT) return false;
  return `${endD}T${endT}` <= `${startD}T${startT}`;
}

// Moving the start to a later day carries the end date along with it.
export function pushEndWithStart(parts) {
  const { startD, endD } = parts;
  if (startD && endD && endD < startD) return { ...parts, endD: startD };
  return parts;
}

const parseLocalDate = (v) => new Date(`${v}T00:00`);

// The year is only shown when it is not this year, which keeps it short.
export function formatDate(v, now = new Date()) {
  if (!v) return "";
  const d = parseLocalDate(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

export function formatTime(t) {
  if (!t || !/^\d{2}:\d{2}$/.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function timeOptions(stepMinutes = 15) {
  const out = [];
  for (let mins = 0; mins < 24 * 60; mins += stepMinutes) {
    out.push(`${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`);
  }
  return out;
}

// What an event needs before it can go live. Order is the order shown.
// legacyNoEnd: an older event that never had an end may stay without one.
// dateTbd: a postponed event whose new date is still to be announced.
export function requiredItems(form, { legacyNoEnd = false, dateTbd = false } = {}) {
  const hasStart = Boolean(form.startD && form.startT);
  const hasEnd = Boolean(form.endD && form.endT);
  const endOk = dateTbd || (legacyNoEnd && !form.endD && !form.endT) || (hasEnd && !endBeforeStart(form));
  return [
    { key: "name", label: "Event name", ok: Boolean(String(form.eventName || "").trim()) },
    { key: "start", label: "Start date & time", ok: dateTbd || hasStart },
    { key: "end", label: "End date & time", ok: endOk },
    { key: "venue", label: "Venue", ok: Boolean(String(form.venueName || "").trim()) },
    { key: "photo", label: "Cover photo", ok: form.pictureCount > 0 },
    { key: "ticket", label: "At least one ticket", ok: form.ticketCount > 0 },
  ];
}

const nameKey = (n) => String(n || "").trim().replace(/\s+/g, " ").toLowerCase();

// Problems with one ticket, by field. Empty object = fine. These match what the
// server checks: a name that is unique in the event, a price of 0 or more and
// a whole number of seats that is not below the seats already sold.
export function ticketProblems(ticket, others = []) {
  const problems = {};

  const name = String(ticket.name || "").trim();
  if (!name) problems.name = "Give the ticket a name";
  else if (others.some((o) => nameKey(o.name) === nameKey(name))) {
    problems.name = "Two tickets can't have the same name";
  }

  const price = String(ticket.price ?? "").trim();
  if (price === "") problems.price = "Enter a price, or turn on Free";
  else if (!/^\d+(\.\d+)?$/.test(price)) problems.price = "Price must be 0 or more";

  const cap = String(ticket.capacity ?? "").trim();
  if (cap === "") problems.capacity = "Enter how many seats";
  else if (!/^\d+$/.test(cap)) problems.capacity = "Seats must be a whole number";
  else if (Number(cap) < (ticket.sold ?? 0)) {
    problems.capacity = `Seats can't be lower than the ${ticket.sold} already sold`;
  }

  return problems;
}
