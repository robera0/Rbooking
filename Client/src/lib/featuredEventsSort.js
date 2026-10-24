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
