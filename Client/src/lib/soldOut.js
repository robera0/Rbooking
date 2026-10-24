import { isEventPassed8Hours } from "./utils.js";

// An event counts as sold out when it has no ticket types, has already
// happened, or every ticket type has no seats left. A ticket type whose seat
// count is not known is never treated as sold out.
export const isEventSoldOut = (event) => {
  const tickets = event?.tickets;
  if (tickets?.length === 0) return true;
  if (isEventPassed8Hours(event)) return true;
  return (
    tickets?.length > 0 &&
    tickets.every((ticket) => Number(ticket?.availableQuantity) <= 0)
  );
};
