import AppError from "../errors/AppError.js";

// Checks the start and end of an event.
//
// requireEnd is true when an event is being published (a draft going live, or
// an event created as published): new events must say when they end. Older
// published events were created before end times existed, so saving them
// never requires one - but an end that is present must be real and after the
// start. While the new date of a postponed event is still to be announced
// there is nothing to end yet.
const toDate = (d) => {
  const raw = d?.dateTime;
  if (raw === undefined || raw === null || raw === "") return null;
  const date = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const mentioned = (d) => Boolean(d && (d.dateTime || d.localDate || d.localTime));

export function validateEventDates(dates, { requireEnd = false } = {}) {
  const start = toDate(dates?.start);
  const end = toDate(dates?.end);

  if (start === undefined) throw new AppError("The start date is not valid", 400);
  if (end === undefined) throw new AppError("The end date is not valid", 400);

  const needsEnd = requireEnd && dates?.dateTbd !== true;
  if (!end) {
    if (needsEnd) throw new AppError("The end date and time are required to publish", 400);
    return;
  }

  if (!start) throw new AppError("Set the start date and time before the end", 400);
  if (end.getTime() <= start.getTime()) {
    throw new AppError("The end must be after the start", 400);
  }
}

export { mentioned };
