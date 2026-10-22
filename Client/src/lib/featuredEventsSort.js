import { isEventPassed8Hours } from "./utils.js";

export const sortFeaturedEvents = (events = []) => {
  return [...events].sort((a, b) => {
    const aSoldOut = !a?.tickets?.length || isEventPassed8Hours(a);
    const bSoldOut = !b?.tickets?.length || isEventPassed8Hours(b);

    if (aSoldOut !== bSoldOut) {
      return Number(aSoldOut) - Number(bSoldOut);
    }

    const aDate = new Date(a?.dates?.start?.dateTime || 0).getTime();
    const bDate = new Date(b?.dates?.start?.dateTime || 0).getTime();

    return aDate - bDate;
  });
};
