// An event page can be opened without a ticket in the address (a sold-out
// card, a shared link, a wishlist entry). The ticket route needs a real id,
// so without one the plain event route is used instead.
export const eventRequestPath = (eventId, ticketId) =>
  ticketId && ticketId !== "undefined"
    ? `/api/events/${eventId}/tickets/${ticketId}`
    : `/api/events/${eventId}`;

// The plain event route has no "current ticket"; use the first active one so
// the page has the same shape either way.
export const withDefaultTicket = (data) => {
  if (!data || data.ticket) return data;
  const first = (data.tickets || []).find((t) => t?.isActive !== false);
  return { ...data, ticket: first ?? null };
};
