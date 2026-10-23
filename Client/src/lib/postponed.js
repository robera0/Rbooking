import moment from "moment";

// Postponement lives on the event's dates: `dates.status.code` is "postponed",
// `dates.start` is the NEW date, `dates.postponedFrom` the original, and
// `dates.dateTbd` means the new date is not decided yet (then `start` still
// holds the old date). Tickets bought before the postponement stay valid.

export const isPostponed = (event) =>
  event?.dates?.status?.code === "postponed";

export const isDateTbd = (event) =>
  isPostponed(event) && event?.dates?.dateTbd === true;

const dayLabel = (start) =>
  start?.localDate ? moment(start.localDate).format("dddd, MMMM D, YYYY") : "";

export const newDateLabel = (event) => dayLabel(event?.dates?.start);
export const originalDateLabel = (event) => dayLabel(event?.dates?.postponedFrom);

// One sentence for the banner. `holder` is true on a buyer's own ticket.
export function postponedHeadline(event, { holder = false } = {}) {
  const valid = holder ? " Your ticket is still valid." : "";
  if (isDateTbd(event)) {
    return `Postponed. The new date is to be announced.${valid}`;
  }
  const date = newDateLabel(event);
  return date
    ? `Postponed. Now ${date}.${valid}`
    : `Postponed.${valid}`;
}
