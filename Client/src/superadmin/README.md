# Super Admin module

UI-only Super Admin area for the event ticketing app. Everything lives inside
`src/superadmin/`; the only change outside the folder is a single route entry in
`src/router.jsx`.

Zero backend: all data comes from `mock/*` through one fake service layer
(`services/superadmin.service.js`). Swapping that one file for real HTTP calls is
the entire migration.

---

## 1. Mount the route

```jsx
// 1. import
import SuperAdminLayout from "./superadmin/SuperAdminLayout";

// 2. render (path must stay /superadmin/*)
<Route path="/superadmin/*" element={<SuperAdminLayout />} />
```

This repo uses `createBrowserRouter` with route objects (`src/router.jsx`), so the
same mount looks like this there — add it as a sibling of the `admin` route:

```jsx
import SuperAdminLayout from "./superadmin/SuperAdminLayout";

// ...
{
  path: "superadmin/*",
  element: (
    <PageWrapper>
      <SuperAdminLayout />
    </PageWrapper>
  ),
},
```

> The `*` matters: the layout owns its four tabs internally.

**Access control:** this route must be restricted to the `superadmin` role on the
**server** too. Hiding it in the UI is not security — every endpoint under
`/api/superadmin/*` must verify the caller's role and return `403` otherwise.

---

## 2. Folder structure

```
src/superadmin/
  index.jsx                       default export of the layout (router entry)
  SuperAdminLayout.jsx            sticky top bar, 4 pill tabs, AnimatePresence
  constants.js                    colors, labels, thresholds, TIMEZONE, CURRENCY
  pages/
    EventsPage.jsx                all events, search + admin/status chips
    RevenuePage.jsx               summary + per-admin accordions + approvals
    ScannerPage.jsx               camera/manual validation for any event
    UsersPage.jsx                 user grid + details drawer
  components/
    common/    StatCard, SearchBar, FilterChips, EmptyState, StatusChip, Drawer
    events/    EventCard
    revenue/   AdminRevenueCard, PendingTicketCard, ExpiryCountdown
    scanner/   QrScanner, ManualEntry, ScanResultCard, RecentScans
    users/     UserCard, UserDetailsDrawer
  hooks/       useCountdown, useDebounce
  services/    superadmin.service.js      <-- the only file to replace
  mock/        admins, events, pendingTickets, users, scanTickets
  utils/       format (Birr, Addis Ababa dates, timeAgo, initials), expiry
```

**Rule:** pages and components never import from `mock/` — only the service does.

---

## 3. Service layer → endpoints to build

All functions are `async` and resolve after a short artificial delay, with the
exact shapes the real API should return.

| Service function | Method | Endpoint | Request body / query | Response shape |
| --- | --- | --- | --- | --- |
| `getEvents()` | `GET` | `/api/superadmin/events` | `–` | `{ events: Event[], total: number }` |
| `getAdmins()` | `GET` | `/api/superadmin/admins` | `–` | `{ admins: Admin[], total: number }` |
| `getPendingTickets()` | `GET` | `/api/superadmin/pending-tickets` | `?adminId=&onlyIssues=` *(applied client-side today)* | `{ tickets: PendingTicket[], total: number, withIssues: number }` |
| `getUsers()` | `GET` | `/api/superadmin/users` | `?q=&role=` *(applied client-side today)* | `{ users: User[], total: number }` |
| `validateTicket(code, eventId?)` | `POST` | `/api/superadmin/tickets/validate` | `{ code: string, eventId?: string \| null }` | `{ status: "valid"\|"used"\|"invalid", ticket: ScanTicket \| null, reason: string \| null, scannedAt: ISO }` |
| `approveTicket(id)` | `PATCH` | `/api/superadmin/pending-tickets/:id/approve` | `{}` | `{ success: boolean, ticket: PendingTicket \| null, message: string }` |
| `rejectTicket(id, reason?)` | `PATCH` | `/api/superadmin/pending-tickets/:id/reject` | `{ reason: "payment_not_verified" \| "screenshot_mismatch" \| "duplicate_reference" \| "amount_mismatch" }` | `{ success: boolean, ticket: PendingTicket \| null, message: string }` |
| `getRevenueOverview()` *(optional single call)* | `GET` | `/api/superadmin/revenue-overview` | `–` | `{ admins: Admin[], pendingTickets: PendingTicket[], events: Event[] }` |

Endpoints the UI will want next (drawer data is currently embedded in the user object):

| Feature | Method | Endpoint | Response |
| --- | --- | --- | --- |
| User details | `GET` | `/api/superadmin/users/:id` | `User` |
| User tickets | `GET` | `/api/superadmin/users/:id/tickets` | `{ tickets: UserTicket[], total }` |
| Recent scans log | `GET` | `/api/superadmin/tickets/scans?limit=10` | `{ scans: ScanResult[], counters: { valid, used, invalid } }` |

### Expected payload shapes

```js
Admin          { id, name, email, phone, avatar, city, eventsCount, ticketsSold,
                 revenue, joinedAt }

Event          { id, adminId, adminName, name, poster, venue, city, date,
                 entryFrom, sold, total,
                 status: "published" | "draft" | "sold_out" | "ended", category }

PendingTicket  { id, reference, adminId, adminName, eventId, eventName,
                 ticketType, quantity, amount, buyerName, buyerPhone,
                 boughtAt, expiresAt,
                 issue: null | "payment_not_verified" | "screenshot_mismatch"
                             | "duplicate_reference" | "amount_mismatch",
                 status: "pending" }

User           { id, fullName, email, phone, avatar, city,
                 role: "user" | "admin", joinedAt, ticketsBought, totalSpent,
                 linkedAdminId, lastActiveAt,
                 recentTickets: [{ id, eventName, ticketType, date, amount,
                                   status: "valid" | "used" }] }

ScanTicket     { code, eventId, eventName, adminId, adminName, ticketType,
                 buyerName, buyerPhone, amount, status: "valid" | "used" | "invalid",
                 usedAt, reason }
```

---

## 4. Mock data

Generated relative to `Date.now()` at import time, so the countdowns are always
alive on page load.

- **4 admins**, **8 events**, **12 pending tickets**, **12 accounts** (8 users + the 4 admins), **8 scannable tickets**.
- Pending tickets deliberately include: expiring in under 5 minutes (red, pulsing),
  5–10 minutes (orange), over 10 minutes (green), one already expired, three
  without a buyer name, and seven with a verification issue.
- In-session behaviour mirrors a backend: approving/rejecting removes the ticket
  from the queue, and the first successful scan of a code flips it to *already used*.

Manual-entry demo codes (also listed as buttons in the UI):

| Code | Expected result |
| --- | --- |
| `RBOOK-0001` | VALID, then ALREADY USED on the next scan |
| `RBOOK-0002` | VALID (rejected if the event scope is not *Tech Summit Ethiopia*) |
| `RBOOK-0003` / `RBOOK-0004` / `RBOOK-0007` | ALREADY USED (with time used) |
| `RBOOK-0008` | INVALID — refunded/revoked |
| anything else | INVALID — ticket code not found |

---

## 5. Conventions

- **Design system:** page `#121417`, cards `#1C1F22`, borders `white/[0.04]`–`white/[0.12]`,
  accent `#FF7A00`, success `#5EC750`, danger `red-500/600`. Headings are
  `font-black uppercase tracking-tighter`; micro-labels are
  `text-[10px] uppercase tracking-[0.2em] text-gray-600`; cards are
  `rounded-[1.5rem]`–`rounded-[2.2rem]`.
- **Cards only** — there is no `<table>` element anywhere in this module.
- **Responsive:** 1 column on mobile, 2 at `sm`, 3 at `lg`, 4 at `xl`.
- **Timezone/currency:** all dates render in `Africa/Addis_Ababa` (`TIMEZONE`),
  all money renders as `Birr` (`CURRENCY`) via `formatBirr`.
- **Cleanup:** `useCountdown` clears its interval, `useDebounce` clears its timeout,
  `QrScanner` stops + clears the camera on unmount **and** every tab switch
  (the layout unmounts the inactive page), `Drawer` restores `body.overflow`.
- **Accessibility:** labelled inputs, `aria-label` on icon-only buttons,
  `aria-expanded` on the accordion, `role="switch"` on the issues toggle,
  `role="status"`/`aria-live` on counts, `role="dialog"` + `aria-modal` on the
  drawer, `role="menu"`/`menuitem` on the header account menu, and
  `focus-visible:ring-[#FF7A00]/60` everywhere.
- **Header account menu:** avatar button (top right) → mock identity
  (`CURRENT_SUPERADMIN` in `constants.js`) + **Sign out**, which navigates to
  `/login`. Wire it to the real auth context + `POST /api/auth/logout` when the
  module is connected to the backend.
- **Users tab:** shows every account, including the 4 admins. The role chips
  (All / User / Admin) filter between them; admin cards also carry their
  `linkedAdminId` in the details drawer.

---

## 6. Packages

Nothing to install — `html5-qrcode@2.3.8` is already in `package.json`
(used only by `components/scanner/QrScanner.jsx`).

```bash
# only if it is ever missing
npm i html5-qrcode
```
