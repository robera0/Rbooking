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

// Moves sold-out (and finished) events to the end while keeping every other
// event in the order it already had, so people open the list on events they
// can still book. Returns a new array.
export const sinkSoldOutEvents = (events = []) => {
  const list = Array.isArray(events) ? events : [];
  const available = [];
  const soldOut = [];
  for (const event of list) {
    (isEventSoldOut(event) ? soldOut : available).push(event);
  }
  return [...available, ...soldOut];
};
