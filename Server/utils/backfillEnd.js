// Works out the end that gets added to an event that never had one.
// The wall-clock fields are Addis Ababa time (UTC+3, no daylight saving),
// the same as the event form writes them.
const ADDIS_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const endNeedsBackfill = (dates) => {
  if (!dates?.start?.dateTime) return false;
  if (dates.dateTbd === true) return false;
  return !dates?.end?.dateTime;
};

export const backfilledEnd = (startDateTime, days) => {
  const dateTime = new Date(new Date(startDateTime).getTime() + days * DAY_MS);
  const [localDate, time] = new Date(dateTime.getTime() + ADDIS_OFFSET_MS)
    .toISOString()
    .split("T");
  return { dateTime, localDate, localTime: time.slice(0, 8) };
};
