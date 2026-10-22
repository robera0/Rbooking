import { ADMINS } from "../mock/admins.mock";
import { EVENTS } from "../mock/events.mock";
import { PENDING_TICKETS } from "../mock/pendingTickets.mock";
import { USERS } from "../mock/users.mock";
import { SCAN_TICKETS } from "../mock/scanTickets.mock";
import { PENDING_STATUS, SCAN_STATUS, SERVICE_DELAY } from "../constants";

const wait = (ms = SERVICE_DELAY) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const clone = (value) => JSON.parse(JSON.stringify(value));

const nowIso = () => new Date().toISOString();

const normalizeCode = (code) =>
  String(code ?? "")
    .trim()
    .toUpperCase();

/*
 * In-session mutable stores.
 * A real backend keeps this state server-side; here we keep it at module scope so
 * approving a ticket or scanning a code twice behaves like the real thing during
 * the current page session (and resets on a hard reload).
 */
let pendingStore = PENDING_TICKETS.map((ticket) => ({ ...ticket }));
const scanStore = SCAN_TICKETS.map((ticket) => ({ ...ticket }));

/* ── GET /api/superadmin/events ── */
export async function getEvents() {
  await wait();

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/auth/super_admin/all_events`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await response.json();
  const rawEvents = data.events || [];

  // Normalize data: map pictures[0] to both 'image' and 'imageUrl' so EventCard can find it
  const events = rawEvents.map((event) => {
    const imageUrl =
      event.pictures?.[0] || event.links?.venues?.pictures?.[0] || "";
    return {
      ...event,
      image: imageUrl,
      imageUrl: imageUrl,
    };
  });

  return {
    events,
    total: events.length,
  };
}

/* ── GET /api/superadmin/admins ── */
export async function getAdmins() {
  await wait();
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/auth/super_admin/all_admins`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await response.json();
  const admins = data.admins || [];

  return { admins, total: admins.length };
}

/* ── GET /api/superadmin/pending-tickets ── */
export async function getPendingTickets() {
  await wait();
  const pending = pendingStore.filter(
    (ticket) => ticket.status === PENDING_STATUS.pending,
  );
  const tickets = clone(pending);
  return {
    tickets,
    total: tickets.length,
    withIssues: tickets.filter((ticket) => Boolean(ticket.issue)).length,
  };
}

/* ── GET /api/superadmin/users ── */
export async function getUsers() {
  await wait();
  const users = clone(USERS);
  return { users, total: users.length };
}

/* ── POST /api/superadmin/tickets/validate ──
 * body: { code, eventId? }
 * The super admin may scan for "All events" (eventId omitted) or scope to one
 * event, in which case tickets from another event are rejected.
 */
export async function validateTicket(code, eventId = null) {
  await wait(360);
  const scannedAt = nowIso();
  const normalized = normalizeCode(code);

  if (!normalized) {
    return {
      status: SCAN_STATUS.invalid,
      ticket: null,
      reason: "Empty ticket code",
      scannedAt,
    };
  }

  const ticket = scanStore.find((entry) => entry.code === normalized);

  if (!ticket) {
    return {
      status: SCAN_STATUS.invalid,
      ticket: null,
      reason: "Ticket code not found",
      scannedAt,
    };
  }

  if (ticket.status === SCAN_STATUS.invalid) {
    return {
      status: SCAN_STATUS.invalid,
      ticket: clone(ticket),
      reason: ticket.reason || "Ticket is not valid",
      scannedAt,
    };
  }

  if (eventId && ticket.eventId !== eventId) {
    return {
      status: SCAN_STATUS.invalid,
      ticket: clone(ticket),
      reason: "Ticket belongs to a different event",
      scannedAt,
    };
  }

  if (ticket.status === SCAN_STATUS.used) {
    return {
      status: SCAN_STATUS.used,
      ticket: clone(ticket),
      reason: "Ticket was already scanned",
      scannedAt,
    };
  }

  /* First successful scan marks the ticket as used for the rest of the session. */
  ticket.status = SCAN_STATUS.used;
  ticket.usedAt = scannedAt;

  return {
    status: SCAN_STATUS.valid,
    ticket: clone(ticket),
    reason: null,
    scannedAt,
  };
}

/* ── PATCH /api/superadmin/pending-tickets/:id/approve ── */
export async function approveTicket(id) {
  await wait(300);
  const ticket = pendingStore.find((entry) => entry.id === id);

  if (!ticket) {
    return { success: false, ticket: null, message: "Ticket not found" };
  }

  pendingStore = pendingStore.map((entry) =>
    entry.id === id
      ? { ...entry, status: PENDING_STATUS.approved, reviewedAt: nowIso() }
      : entry,
  );

  const updated = pendingStore.find((entry) => entry.id === id);
  return { success: true, ticket: clone(updated), message: "Ticket approved" };
}

/* ── PATCH /api/superadmin/pending-tickets/:id/reject ──
 * body: { reason }  (reason mirrors the verification ISSUES codes)
 */
export async function rejectTicket(id, reason = "payment_not_verified") {
  await wait(300);
  const ticket = pendingStore.find((entry) => entry.id === id);

  if (!ticket) {
    return { success: false, ticket: null, message: "Ticket not found" };
  }

  pendingStore = pendingStore.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          status: PENDING_STATUS.rejected,
          rejectedReason: reason,
          reviewedAt: nowIso(),
        }
      : entry,
  );

  const updated = pendingStore.find((entry) => entry.id === id);
  return { success: true, ticket: clone(updated), message: "Ticket rejected" };
}

/* ── Convenience: everything the revenue page needs in one shot ──
 * Not required by the UI (it calls the three getters in parallel) but handy
 * as a single future endpoint: GET /api/superadmin/revenue-overview
 */
export async function getRevenueOverview() {
  const [adminsRes, ticketsRes, eventsRes] = await Promise.all([
    getAdmins(),
    getPendingTickets(),
    getEvents(),
  ]);
  return {
    admins: adminsRes.admins,
    pendingTickets: ticketsRes.tickets,
    events: eventsRes.events,
  };
}
