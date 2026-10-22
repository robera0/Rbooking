/* Shared club floor-plan (tables & couches) configuration.
   Stored in localStorage so the admin (club owner) page and the
   public RSVP page stay in sync without a backend round-trip. */

const STORAGE_KEY = "clubFloorPlan";
const VERSION_KEY = "clubFloorPlanVersion";
/* Bump this whenever the stock/default images change so existing browsers
   pick up the new photos instead of keeping stale cached ones. */
const PLAN_VERSION = 8;

export const FLOOR_SECTIONS = [
  "Tables",
  "Shared Couches",
  "VIP Couches",
];

export const DEFAULT_FLOOR_PLAN = [
  {
    id: "ST1",
    section: "Tables",
    type: "table",
    privacy: "shared",
    seats: 2,
    price: 0,
    status: "available",
    image: "/club/club-table-3.jpg",
  },
  {
    id: "ST2",
    section: "Tables",
    type: "table",
    privacy: "shared",
    seats: 4,
    price: 0,
    status: "available",
    image: "/club/club-table-3.jpg",
  },
  {
    id: "ST3",
    section: "Tables",
    type: "table",
    privacy: "shared",
    seats: 6,
    price: 0,
    status: "available",
    image: "/club/club-table-3.jpg",
  },
  {
    id: "SC1",
    section: "Shared Couches",
    type: "couch",
    privacy: "shared",
    seats: 3,
    price: 200,
    status: "available",
    image: "/club/vip-lounge-couch.jpg",
  },
  {
    id: "SC2",
    section: "Shared Couches",
    type: "couch",
    privacy: "shared",
    seats: 5,
    price: 300,
    status: "available",
    image: "/club/vip-lounge-couch.jpg",
  },
  {
    id: "PC1",
    section: "VIP Couches",
    type: "couch",
    privacy: "private",
    seats: 4,
    price: 600,
    status: "available",
    image: "/club/vip-lounge-couch.jpg",
  },
  {
    id: "PC2",
    section: "VIP Couches",
    type: "couch",
    privacy: "private",
    seats: 8,
    price: 900,
    status: "available",
    image: "/club/vip-lounge-couch.jpg",
  },
];

/* Defaults that were removed in a later revision. Older cached floor plans
   may still contain these, so the migration drops them. */
const REMOVED_DEFAULT_IDS = ["VT1", "VT2"];

/* Section names that were renamed; old cached plans get remapped. */
const LEGACY_SECTION_MAP = {
  "Shared Tables": "Tables",
};

function seedDefaults() {
  return DEFAULT_FLOOR_PLAN.map((x) => ({ ...x }));
}

function readVersion() {
  return Number(localStorage.getItem(VERSION_KEY)) || 0;
}

export function loadFloorPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VERSION_KEY, String(PLAN_VERSION));
      return seedDefaults();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return seedDefaults();
    }

    // One-time upgrade: refresh stock images to the newest defaults, sync
    // section/type/privacy, and drop removed sections (e.g. VIP Tables) so
    // older cached floor plans match the current layout. Uploaded images
    // (data URLs) and local assets are always preserved.
    if (readVersion() < PLAN_VERSION) {
      const byId = new Map(DEFAULT_FLOOR_PLAN.map((d) => [d.id, d]));
      const validSections = new Set(FLOOR_SECTIONS);
      const migrated = parsed
        .filter((item) => !REMOVED_DEFAULT_IDS.includes(item.id))
        .map((item) => {
          const def = byId.get(item.id);
          if (!def) {
            const section = LEGACY_SECTION_MAP[item.section] || item.section;
            return section === item.section ? item : { ...item, section };
          }
          const isStockImage =
            typeof item.image === "string" && /^https?:\/\//i.test(item.image);
          const next = {
            ...item,
            section: def.section,
            type: def.type,
            privacy: def.privacy,
          };
          if (isStockImage) next.image = def.image;
          return next;
        })
        .filter((item) => validSections.has(item.section));
      const result = migrated.length ? migrated : seedDefaults();
      saveFloorPlan(result);
      return result;
    }

    return parsed;
  } catch {
    return seedDefaults();
  }
}

export function saveFloorPlan(plan) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    localStorage.setItem(VERSION_KEY, String(PLAN_VERSION));
  } catch {
    /* ignore */
  }
}

export function resetFloorPlan() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
  } catch {
    /* ignore */
  }
  return seedDefaults();
}
