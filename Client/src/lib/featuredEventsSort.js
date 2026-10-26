import { isEventSoldOut } from "./soldOut.js";

export const sortFeaturedEvents = (events = []) => {
  return [...events].sort((a, b) => {
    const aSoldOut = isEventSoldOut(a);
    const bSoldOut = isEventSoldOut(b);

    if (aSoldOut !== bSoldOut) {
      return Number(aSoldOut) - Number(bSoldOut);
    }

    const aDate = new Date(a?.dates?.start?.dateTime || 0).getTime();
    const bDate = new Date(b?.dates?.start?.dateTime || 0).getTime();

    return aDate - bDate;
  });
};

// The "Featured this week" row: bookable events only, none of them already
// in the hero, no duplicates, at most `max`.
export const buildFeaturedRow = (featured = [], list = [], heroSlides = [], max = 4) => {
  const used = new Set(heroSlides.map((event) => event?._id));
  const row = [];
  for (const event of [...featured, ...list]) {
    if (!event?._id || used.has(event._id) || isEventSoldOut(event)) continue;
    used.add(event._id);
    row.push(event);
    if (row.length === max) break;
  }
  return row;
};
