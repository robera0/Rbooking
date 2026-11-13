# Program Design: Admin sales visibility

## Files
Server, new
- `Server/service/salesStats.service.js`: every sales number (sold, sold out, gross, refunded, net, per ticket type, per Telebirr number). Pure helpers plus two aggregation functions, so the maths is testable without HTTP.
- `Server/utils/postponement.js`: `normalizeDatesUpdate`, the rule for how an event's dates change when it is postponed, un-postponed or edited.
- `Server/scripts/backfill-paid-to.js`: one-off script that fills `paidTo` on old paid orders for organizers with exactly one Telebirr number. Idempotent. Refuses non-local databases unless `--yes` is passed.
Server, changed
- `Server/models/userTicket.model.js`: add `paidTo`; add index `{ ticketId: 1, status: 1 }` for the sales aggregations.
- `Server/models/events.model.js`: `DatesSchema` gets `postponedFrom` and `dateTbd`.
- `Server/service/receiver.service.js`: add `resolveReceiver` next to `nameMatches`.
- `Server/controllers/ticket.controller.js`: `verifyTicket` stores `paidTo` when marking the order paid.
- `Server/controllers/events.controller.js`: `updateEvent` runs the incoming dates through `normalizeDatesUpdate`.
- `Server/controllers/analytics.controller.js`: `getEvents` adds `sales`; `getTransactionLedger` reads `eventId` and returns a `summary`; new `getSales`.
- `Server/service/ticket.service.js`: `findTickets(adminId, { eventId })` filters by event.
- `Server/routes/admin.routes.js`: explicit auth and admin check on the changed and new routes; `GET /analytics/sales`.
Server, tests (new)
- `salesStats.test.js`, `receiverMatch.test.js`, `postponement.test.js`, `scanPostponed.test.js`, `adminSalesRoutes.test.js`, `backfillPaidTo.test.js`.
Client, new
- `Client/admin/EventSales.jsx`: one event's sales page (route `/admin/events/:eventId/sales`).
- `Client/admin/api/sales.api.js`: one react-query hook, `useSales(eventId?)`. The existing events query is reused for the table, so no second hook is needed.
Client, changed
- `Client/admin/Cards.jsx`: `EventTable` (real Sold, Sold Out and Postponed badges, net revenue, link to sales page); `TicketTable` (Paid to column, takes an `eventId` prop).
- `Client/admin/TicketOrders.jsx`: event filter and summary strip.
- `Client/admin/Payment.jsx`: "Received by Telebirr number" card (all events).
- `Client/admin/EditEvent.jsx`: Postponed status, new date, "date not decided yet".
- `Client/src/router.jsx`: the sales route.
- `Client/src/lib/utils.js` (`isEventPassed8Hours`) and `Client/user/ViewTicket.jsx`, `Ticket.jsx`, `EventInfo.jsx`: postponed banner, new date, "still valid".

## Types & signatures
```js
/** Money is whole birr as stored (Number). Quantities count tickets. */

/** @typedef {{ sold:number, capacity:number, soldOut:boolean, soldOutTypes:string[],
 *             grossCollected:number, refunded:number, netRevenue:number }} EventSales */

/** @typedef {{ ticketId:string, name:string, price:number, sold:number, left:number,
 *             revenue:number, soldOut:boolean }} TypeRow */

/** @typedef {{ key:string, kind:"number"|"unassigned"|"free"|"before_tracking",
 *             accountNumber:string|null, receiverName:string|null,
 *             tickets:number, orders:number, amount:number }} TelebirrRow */

/** @typedef {{ tickets:number, grossCollected:number, refunded:number, netRevenue:number }} Summary */

/** @typedef {{ provider:string, accountNumber:string|null, receiverName:string|null }} PaidTo */

// salesStats.service.js
export function summarizeOrders(orders: {status:string, quantity:number, totalAmount:number}[]): Summary;
export function isTierSoldOut(tier: {availableQuantity:number, isActive?:boolean}): boolean;
export function eventSoldOut(tiers: {name:string, availableQuantity:number, isActive?:boolean}[]):
  { soldOut:boolean, soldOutTypes:string[] };
export function groupByTelebirr(
  paidOrders: {quantity:number, totalAmount:number, paidTo?:PaidTo|null}[]
): TelebirrRow[];
export async function salesByEvent(eventIds: ObjectId[]): Promise<Map<string, EventSales>>;
export async function salesBreakdown(adminScopeId: ObjectId, eventId?: ObjectId):
  Promise<{ totals:Summary, byTicketType:TypeRow[], byTelebirr:TelebirrRow[] }>;

// receiver.service.js
export function resolveReceiver(
  receiptName: string,
  paymentMethods: {provider:string, accountNumber?:string, receiverName?:string}[]
): PaidTo | null;   // null = no Telebirr entry matches; accountNumber null = several entries share that name

// utils/postponement.js
export function normalizeDatesUpdate(existing: Dates|undefined, incoming: Dates|undefined): Dates|undefined;

// analytics.controller.js
export const getSales: RequestHandler;            // GET /analytics/sales?eventId=
// ticket.service.js
static findTickets(adminId: ObjectId|string, opts?: { eventId?: string }): Promise<Order[]>;
```
Response shapes
- `GET /events` item: existing event fields plus `sales: EventSales`.
- `GET /analytics/transactions`: `{ success, transactions: Order[], summary: Summary }`; each order includes `paidTo`.
- `GET /analytics/sales`: `{ success, totals: Summary, byTicketType: TypeRow[], byTelebirr: TelebirrRow[] }`.
- Invalid `eventId`: 400. An `eventId` that belongs to another organizer: empty result (same as a missing event), never another organizer's data.

## Call stack
Payment verified
`verifyTicket` → `verifyReceipt` → `nameMatchesAny` → `resolveReceiver(receipt.creditedPartyName, adminProfile.paymentMethods)` → `UserTicketModel.findByIdAndUpdate({ status:"paid", ..., paidTo })`.
Event table
`EventTable` → `GET /events` → `analytics.getEvents` → `EventService.find({adminId})` → `salesStats.salesByEvent(ids)` → merge `sales` into each event.
Event sales page
`EventSales` → `useSales(eventId)` → `GET /analytics/sales` → `analytics.getSales` → `salesStats.salesBreakdown` → `groupByTelebirr`.
Orders page
`TicketOrders` (event picker, from the events query) → `TicketTable eventId` → `GET /analytics/transactions?eventId` → `TicketService.findTickets` → `summarizeOrders`.
Postpone
`EditEvent` → `PUT update` → `updateEvent` → `normalizeDatesUpdate(existingEvent.dates, dates)` → `findByIdAndUpdate` → caches cleared (already done there).
Gate scan
`scanTicket` (not changed): matches on order number, status paid, not yet checked in; no date check.

## Test plan
`salesStats.test.js` (pure helpers first, then aggregations against a throwaway mongod)
- counts tickets, not orders: an order of 3 adds 3.
- pending, expired and cancelled orders add nothing to sold or net.
- a refunded order leaves sold and net, and shows in refunded and gross.
- a tier is sold out at `availableQuantity` 0 and below; inactive tiers are ignored.
- an event is Sold Out only when every active tier is; otherwise `soldOutTypes` lists the sold-out tiers.
- an event with no tiers is not Sold Out.
- `byTicketType` tickets and revenue add up to `totals`.
- `groupByTelebirr`: one row per number; free orders go to the Free row; paid orders with money and no `paidTo` go to Before tracking; a shared-name order goes to Unassigned; row tickets and amounts add up to the totals (invariant).
- orders on another organizer's events never appear.
`receiverMatch.test.js`
- one entry matches: returns that number; two entries with different names: returns the right one; two entries with the same name: `accountNumber` null; no match: null; a first-name-only receipt still resolves (reuses `nameMatches`).
`postponement.test.js`
- first postpone stores the old start in `postponedFrom`; postponing again keeps the original `postponedFrom`; setting back to on sale clears `postponedFrom` and `dateTbd`; `dateTbd` keeps the old start untouched; a payload that does not mention postponement leaves an existing postponement alone; dates undefined returns undefined.
`scanPostponed.test.js` (the regression the feature depends on)
- a paid, verified ticket for a postponed event whose original date has passed checks in; scanning it again is refused; a pending ticket is still refused.
`adminSalesRoutes.test.js`
- `/events`, `/analytics/sales`, `/analytics/transactions`: 401 without login, 403 for role user, 200 for admin and scoped to that admin; invalid `eventId` is 400; foreign `eventId` is empty.
`backfillPaidTo.test.js`
- fills only organizers with exactly one Telebirr number; skips free orders; second run changes nothing; refuses a non-local URL without `--yes`.
Client: there is no test runner in `Client/`, so the screens are checked in the browser against the seeded local database (checklist in the slice plan). Client helpers stay thin so the real logic lives where it is tested.

## Least confident decisions
1. **Sold Out uses seats left (`availableQuantity`), so seats held by pending orders count as taken for up to 24 hours.** The alternative is "paid equals capacity", which would show Active while buyers already see nothing left to buy.
2. **Which number received a payment is inferred from the receiver name.** Two numbers with the same holder name cannot be separated and show as Unassigned. If the receipt service also returns an account number we could use it, but nothing in the repo shows that field, so I am not relying on it.
3. **Postponed lives in `dates.status.code`, not in the event's own status.** This keeps the event public and purchasable with no change to the "published" checks, but anything that reads only `status` will not know about the postponement.
4. **Money figures:** gross collected = paid + refunded orders, net = paid orders. This assumes every refund flips the order to `refunded` and nothing is refunded in part.
5. **Old orders:** no `paidTo`, shown as Before tracking, backfilled only for single-number organizers. Multi-number organizers will see Before tracking for history.
6. **Admin events list cost:** one aggregation over the organizer's orders on every load of the table. Fine for now; the new index helps; revisit if organizers have tens of thousands of orders.
7. **`isEventPassed8Hours` changes for postponed events** (a "date not decided" event must not look finished). It is used by several buyer pages, so this touches shared behavior.
8. **The backfill script is run by hand** against whichever database you point it at; I will only run it on the local one.
