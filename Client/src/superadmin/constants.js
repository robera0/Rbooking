// src/superadmin/constants.js
// Shared design tokens, labels, thresholds and tab config for the Super Admin module.
// No API mapping: pure constants consumed by every page, component, hook and util.

/* ── Design tokens (mirror the existing app palette) ── */
export const COLORS = {
  page: "#121417",
  card: "#1C1F22",
  elevated: "#1A1D20",
  accent: "#FF7A00",
  success: "#5EC750",
  danger: "#EF4444",
  warning: "#F59E0B",
};

export const TIMEZONE = "Africa/Addis_Ababa";
export const CURRENCY = "Birr";
export const LOCALE = "en-GB";

/* Simulated network latency for the mock service layer (ms). */
export const SERVICE_DELAY = 420;

/* ── Tabs rendered by SuperAdminLayout ── */
export const TABS = [
  {
    key: "events",
    label: "Events",
    hint: "All events from every admin",
  },
  {
    key: "revenue",
    label: "Revenue",
    hint: "Revenue + pending ticket approvals",
  },
  {
    key: "scanner",
    label: "Scanner",
    hint: "Validate tickets for any event",
  },
  {
    key: "users",
    label: "Users",
    hint: "Everyone on the platform",
  },
];

/* ── Event status ── */
export const EVENT_STATUS = {
  published: "published",
  draft: "draft",
  soldOut: "sold_out",
  ended: "ended",
};

export const STATUS_LABELS = {
  [EVENT_STATUS.published]: "Published",
  [EVENT_STATUS.draft]: "Draft",
  [EVENT_STATUS.soldOut]: "Sold Out",
  [EVENT_STATUS.ended]: "Ended",
};

export const STATUS_STYLES = {
  [EVENT_STATUS.published]:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  [EVENT_STATUS.draft]: "border-white/10 bg-white/5 text-gray-300",
  [EVENT_STATUS.soldOut]: "border-[#FF7A00]/25 bg-[#FF7A00]/10 text-[#FF9A3D]",
  [EVENT_STATUS.ended]: "border-red-500/25 bg-red-500/10 text-red-400",
};

export const STATUS_ORDER = [
  EVENT_STATUS.published,
  EVENT_STATUS.draft,
  EVENT_STATUS.soldOut,
  EVENT_STATUS.ended,
];

/* ── Pending ticket lifecycle ── */
export const PENDING_STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

/* ── Expiry thresholds (minutes) ──
   > calmAbove  -> calm  (gray / green)
   > warningAbove -> warning (orange)
   > 0          -> critical (red, pulsing)
   0            -> EXPIRED
*/
export const EXPIRY_THRESHOLDS = {
  calmAbove: 10,
  warningAbove: 5,
};

/* ── Verification issue reasons ── */
export const ISSUES = {
  paymentNotVerified: "payment_not_verified",
  screenshotMismatch: "screenshot_mismatch",
  duplicateReference: "duplicate_reference",
  amountMismatch: "amount_mismatch",
};

export const ISSUE_LABELS = {
  [ISSUES.paymentNotVerified]: "Payment not verified",
  [ISSUES.screenshotMismatch]: "Screenshot mismatch",
  [ISSUES.duplicateReference]: "Duplicate reference",
  [ISSUES.amountMismatch]: "Amount mismatch",
};

export const ISSUE_OPTIONS = [
  { value: ISSUES.paymentNotVerified, label: ISSUE_LABELS[ISSUES.paymentNotVerified] },
  { value: ISSUES.screenshotMismatch, label: ISSUE_LABELS[ISSUES.screenshotMismatch] },
  { value: ISSUES.duplicateReference, label: ISSUE_LABELS[ISSUES.duplicateReference] },
  { value: ISSUES.amountMismatch, label: ISSUE_LABELS[ISSUES.amountMismatch] },
];

/* ── Scan validation results ── */
export const SCAN_STATUS = {
  valid: "valid",
  used: "used",
  invalid: "invalid",
};

export const SCAN_STATUS_LABELS = {
  [SCAN_STATUS.valid]: "VALID",
  [SCAN_STATUS.used]: "ALREADY USED",
  [SCAN_STATUS.invalid]: "INVALID",
};

export const SCAN_STATUS_STYLES = {
  [SCAN_STATUS.valid]:
    "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  [SCAN_STATUS.used]:
    "border-[#FF7A00]/30 bg-[#FF7A00]/10 text-[#FF9A3D]",
  [SCAN_STATUS.invalid]: "border-red-500/30 bg-red-500/10 text-red-400",
};

/* ── User roles ── */
export const ROLES = {
  user: "user",
  admin: "admin",
};

export const ROLE_LABELS = {
  [ROLES.user]: "User",
  [ROLES.admin]: "Admin",
};

export const ROLE_STYLES = {
  [ROLES.user]: "border-white/10 bg-white/5 text-gray-300",
  [ROLES.admin]: "border-[#FF7A00]/25 bg-[#FF7A00]/10 text-[#FF9A3D]",
};

/* ── Header copy ── */
export const SUPERADMIN_TITLE = "Super Admin";
export const SUPERADMIN_SUBTITLE = "Platform-wide control center";

/* Mock identity for the header account menu.
   Replace with the authenticated user once the app's auth layer is wired in. */
export const CURRENT_SUPERADMIN = {
  name: "Super Admin",
  email: "superadmin@rbooking.et",
};
