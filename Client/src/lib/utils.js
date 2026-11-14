import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from "moment";
import { isDateTbd } from "./postponed.js";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const toMoment = (side) => {
  if (!side) return null;
  if (side.dateTime) return moment(side.dateTime);
  if (side.localDate) return moment(`${side.localDate}T${side.localTime || "00:00:00"}`);
  return null;
};

// An event is over once its end has passed. An event with no end time is
// treated as over 8 hours after it starts.
export const isEventPassed8Hours = (event) => {
  if (!event?.dates?.start) return false;
  // Postponed with the new date still to be announced: the old date has
  // passed but the event has not happened, so it must not look finished.
  if (isDateTbd(event)) return false;

  const end = toMoment(event?.dates?.end);
  if (end?.isValid()) return moment().isAfter(end);

  const start = toMoment(event?.dates?.start);
  if (!start?.isValid()) return false;
  return moment().isAfter(start.add(8, "hours"));
};
