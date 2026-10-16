/* Shared club floor-plan (tables & couches) configuration.
   Stored in localStorage so the admin (club owner) page and the
   public RSVP page stay in sync without a backend round-trip. */

const STORAGE_KEY = "clubFloorPlan";

export const FLOOR_SECTIONS = [
  "Shared Tables",
  "Shared Couches",
  "Private Couches",
  "VIP Tables",
];

export const DEFAULT_FLOOR_PLAN = [
  {
    id: "ST1",
    section: "Shared Tables",
    type: "table",
    privacy: "shared",
    seats: 2,
    price: 0,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ST2",
    section: "Shared Tables",
    type: "table",
    privacy: "shared",
    seats: 4,
    price: 0,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ST3",
    section: "Shared Tables",
    type: "table",
    privacy: "shared",
    seats: 6,
    price: 0,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "SC1",
    section: "Shared Couches",
    type: "couch",
    privacy: "shared",
    seats: 3,
    price: 200,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "SC2",
    section: "Shared Couches",
    type: "couch",
    privacy: "shared",
    seats: 5,
    price: 300,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "PC1",
    section: "Private Couches",
    type: "couch",
    privacy: "private",
    seats: 4,
    price: 600,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aef880e1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "PC2",
    section: "Private Couches",
    type: "couch",
    privacy: "private",
    seats: 8,
    price: 900,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "VT1",
    section: "VIP Tables",
    type: "table",
    privacy: "private",
    seats: 4,
    price: 500,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "VT2",
    section: "VIP Tables",
    type: "table",
    privacy: "private",
    seats: 8,
    price: 800,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  },
];

export function loadFloorPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FLOOR_PLAN.map((x) => ({ ...x }));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_FLOOR_PLAN.map((x) => ({ ...x }));
    }
    return parsed;
  } catch {
    return DEFAULT_FLOOR_PLAN.map((x) => ({ ...x }));
  }
}

export function saveFloorPlan(plan) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    /* ignore */
  }
}

export function resetFloorPlan() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return DEFAULT_FLOOR_PLAN.map((x) => ({ ...x }));
}
