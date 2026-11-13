import AppError from "../errors/AppError.js";

// How an event's dates change when the organizer saves the edit page.
//
// The edit page can send `dates.postponement = { postponed, dateTbd }`:
//   postponed: true   -> postpone (or change the new date of a postponed event)
//   postponed: false  -> put the event back on sale
// A save that sends nothing about postponement never changes it, so older
// copies of the page (which always send "onsale") cannot undo a postponement.
//
// Everything about a postponement is decided here, on the server. The client
// cannot store its own `postponedFrom`, `dateTbd` or a "postponed" status
// code: those fields are dropped from what it sends.

const NORMAL_CODES = ["onsale", "upcoming", "cancelled"];

// Mongoose hands back an empty object for a date that was never set, so
// "present" means it really holds a date.
const hasDate = (d) => Boolean(d && (d.dateTime || d.localDate));

const pickStart = (start) =>
  hasDate(start)
    ? { dateTime: start.dateTime, localDate: start.localDate, localTime: start.localTime }
    : undefined;

const sameDay = (a, b) =>
  hasDate(a) && hasDate(b) && (a.localDate ?? a.dateTime) === (b.localDate ?? b.dateTime);

// What the client sent, minus everything only the server may decide.
const clientDates = ({ postponement, postponedFrom, dateTbd, ...dates }) => ({
  ...dates,
  status: {
    ...dates.status,
    code: NORMAL_CODES.includes(dates.status?.code) ? dates.status.code : "onsale",
  },
});

export function normalizeDatesUpdate(existing, incoming) {
  if (incoming === undefined) return undefined;

  const instruction = incoming.postponement;
  const base = clientDates(incoming);
  const wasPostponed = existing?.status?.code === "postponed";
  const originalDate = hasDate(existing?.postponedFrom)
    ? existing.postponedFrom
    : pickStart(existing?.start);

  if (instruction?.postponed === true) {
    const dateTbd = instruction.dateTbd === true;
    const kept = hasDate(existing?.start) ? existing.start : base.start;
    const sent = hasDate(base.start) ? base.start : existing?.start;
    return {
      ...base,
      start: dateTbd ? kept : sent,
      status: { ...base.status, code: "postponed" },
      // The very first date stays the original, however often it moves.
      postponedFrom: originalDate,
      dateTbd,
    };
  }

  if (instruction?.postponed === false) {
    // A date still to be announced holds the old, already passed date. Putting
    // the event back on sale without a new one would make it look finished.
    if (wasPostponed && existing.dateTbd === true && sameDay(existing.start, base.start)) {
      throw new AppError("Set a new date before putting the event back on sale", 400);
    }
    return base;
  }

  if (wasPostponed) {
    const dateTbd = existing.dateTbd === true;
    return {
      ...base,
      start: dateTbd && hasDate(existing.start) ? existing.start : base.start,
      status: { ...base.status, code: "postponed" },
      postponedFrom: originalDate,
      dateTbd,
    };
  }

  return base;
}
