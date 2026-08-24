import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from "moment";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const isEventPassed8Hours = (event) => {
  if (!event?.dates?.start) return false;
  
  const start = event.dates.start;
  let eventDateTime;
  
  if (start.dateTime) {
    eventDateTime = moment(start.dateTime);
  } else if (start.localDate) {
    const time = start.localTime || "00:00:00";
    eventDateTime = moment(`${start.localDate}T${time}`);
  } else {
    return false;
  }
  
  if (!eventDateTime.isValid()) return false;
  
  return moment().isAfter(eventDateTime.add(8, "hours"));
};
