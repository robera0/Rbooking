# Architecture: Admin sales visibility

## Fit
Server
- `controllers/analytics.controller.js`: `getEvents` (admin event list) and `getTransactionLedger` (orders list) are extended. They already scope everything to the signed-in organizer through `resolveAdminScopeId`; the new code reuses it.
- `service/ticket.service.js` (`findTickets`): the order ledger aggregation gets an optional event filter and a summary.
- `service/salesStats.service.js` (new): all sales counting lives here as small functions, so it can be tested without HTTP. Controllers only call it.
- `controllers/ticket.controller.js` (`verifyTicket`) and `service/receiver.service.js`: when a payment is verified we also work out which Telebirr number received it and store it on the order.
- `models/userTicket.model.js`, `models/events.model.js`: two small additions (see Data).
- `controllers/events.controller.js` (`updateEvent`): normalises the postponed fields on the server instead of trusting the browser.

Client (admin)
- `admin/Cards.jsx` (`EventTable`, `TicketTable`), `admin/EventMang.jsx`, `admin/TicketOrders.jsx`, `admin/Payment.jsx`, `admin/EditEvent.jsx`, a new `admin/EventSales.jsx` page and route.
Client (buyer)
- `user/ViewTicket.jsx`, `user/Ticket.jsx`, `user/EventInfo.jsx` show the postponed banner and new date; `lib/utils.js` `isEventPassed8Hours` learns about postponed events.

## Endpoints
All under `/api/auth/admin`, each with `authenticateTokenMiddleware` and the `admin` role check written explicitly on the route (today `/analytics/transactions` has no middleware of its own and only works because another router mounted earlier happens to authenticate; we make that explicit).
- `GET /events` (changed): each event gains `sales = { sold, capacity, soldOut, soldOutTypes[], grossCollected, refunded, netRevenue }`.
- `GET /analytics/transactions?eventId=` (changed): optional event filter; response adds `summary = { tickets, grossCollected, refunded, netRevenue }` for the filtered set, and each order carries `paidTo`.
- `GET /analytics/sales?eventId=` (new): `{ totals, byTicketType[], byTelebirr[] }`. With `eventId` it feeds the event sales page; without it, the Payments page (all of the organizer's events).
- `PUT` update event (existing): accepts `dates.status.code = "postponed"` with the new date or `dates.dateTbd`.
Unchanged but covered by a regression test: `PATCH /tickets/qr` (gate scan) does not look at the event date, so tickets already work after a postponement.

## Data
Order (`UserTicket`) gets `paidTo: { provider, accountNumber, receiverName }`, empty until the order is paid. No other order fields change.

Event `dates` gets two optional fields: `postponedFrom { dateTime, localDate, localTime }` (the original start, filled once when the event is first postponed) and `dateTbd` (Boolean). `dates.status.code` already exists and already lists "postponed" in its comment; we start using it. The event's own `status` stays "published", so a postponed event stays in every public list and stays purchasable without touching the places that check for "published".

Rules and queries
- Sold = sum of `quantity` over orders with status `paid`, grouped by event and by ticket type (one aggregation: orders, join their ticket type, group).
- Net revenue = sum of `totalAmount` over `paid` orders. Refunded orders have status `refunded`, so they are already outside net. Gross collected = paid + refunded.
- A ticket type is sold out when its `availableQuantity` is 0 or less (what buyers can still buy). An event is Sold Out when every active ticket type is sold out. Seats held by pending orders count as taken until that order expires.
- Per Telebirr number = group paid orders by `paidTo.accountNumber`. Paid orders with no `paidTo` and amount 0 are "Free tickets"; with amount above 0 they are "Before tracking".
- Which number: after a receipt passes the name check, find the organizer's Telebirr entries whose receiver name matches the receipt. Exactly one match: store it. More than one (same name on two numbers): store the receiver name and no number; it is shown as "Unassigned (shared name)".

One-off backfill: for organizers with exactly one Telebirr number, every earlier paid order with money must have gone to it, so a script fills `paidTo` for them. Organizers with several numbers keep "Before tracking" for old orders.

## Flow
1. Buyer pays and submits a receipt → `verifyTicket` → receipt lookup → name check → NEW: pick the matching Telebirr entry → order saved as `paid` with `paidTo`.
2. Admin opens Event Management → `GET /events` → `analytics.getEvents` → `salesStats.salesByEvent` → events returned with `sales` → table shows Sold, Sold Out and net revenue.
3. Admin opens an event → `GET /analytics/sales?eventId=` → `salesStats` → per type and per number tables.
4. Admin filters Ticket Orders by event → `GET /analytics/transactions?eventId=` → ledger plus summary.
5. Organizer postpones → edit page sends the new date and `postponed` → `updateEvent` stores `postponedFrom` once, clears the event caches → buyer pages read the event and show the banner and new date. The gate scanner keeps accepting paid tickets.

## External
None. No new environment variables, no new services.
