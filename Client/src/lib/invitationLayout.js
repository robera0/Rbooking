// x / y are the CENTER of each element, in % of the poster.
// size / padding / radius are in poster pixels (1080 x 1350 canvas).
export const DEFAULT_LAYOUT = {
  overlay: 0.35,
  label: {
    visible: true,
    text: "EVENT",
    x: 50,
    y: 8.1,
    size: 26,
    color: "#ffffff",
    opacity: 0.75,
    weight: 800,
    font: "sans-serif",
    tracking: 0.15,
    maxWidth: 86,
  },
  eventName: {
    visible: true,
    x: 50,
    y: 13.7,
    size: 56,
    color: "#ffffff",
    opacity: 1,
    weight: 800,
    font: "sans-serif",
    tracking: 0,
    maxWidth: 86,
  },
  qr: {
    visible: true,
    x: 50,
    y: 47.4,
    size: 380,
    padding: 30,
    bg: "#ffffff",
    radius: 40,
  },
  caption: {
    visible: true,
    text: "INVITATION PASS",
    x: 50,
    y: 67.4,
    size: 28,
    color: "#ffffff",
    opacity: 0.85,
    weight: 700,
    font: "sans-serif",
    tracking: 0.15,
    maxWidth: 86,
  },
  guest: {
    visible: true,
    x: 50,
    y: 73.3,
    size: 44,
    color: "#ffffff",
    opacity: 1,
    weight: 800,
    font: "sans-serif",
    tracking: 0,
    maxWidth: 86,
  },
};

export const TEXT_KEYS = ["label", "eventName", "caption", "guest"];

export const LAYER_LABELS = {
  label: "Label",
  eventName: "Event name",
  qr: "QR code",
  caption: "Caption",
  guest: "Guest name",
};

export const QR_MIN_SIZE = 280;
export const QR_MAX_SIZE = 800;
export const QR_MAX_PADDING = 40;

const num = (value, fallback) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const clampNum = (value, min, max) => Math.min(max, Math.max(min, value));

// Turns whatever was saved in the browser into a usable layout. The QR code is
// the pass: it is always shown and kept large enough to scan.
export const mergeLayout = (saved) => {
  const out = { overlay: DEFAULT_LAYOUT.overlay };

  if (typeof saved?.overlay === "number") out.overlay = saved.overlay;

  Object.keys(LAYER_LABELS).forEach((key) => {
    out[key] = { ...DEFAULT_LAYOUT[key], ...(saved?.[key] || {}) };
  });

  const q = { ...DEFAULT_LAYOUT.qr, ...(saved?.qr || {}) };
  out.qr = {
    ...q,
    visible: true,
    x: num(q.x, DEFAULT_LAYOUT.qr.x),
    y: num(q.y, DEFAULT_LAYOUT.qr.y),
    size: clampNum(num(q.size, DEFAULT_LAYOUT.qr.size), QR_MIN_SIZE, QR_MAX_SIZE),
    padding: clampNum(num(q.padding, DEFAULT_LAYOUT.qr.padding), 0, QR_MAX_PADDING),
    radius: num(q.radius, DEFAULT_LAYOUT.qr.radius),
  };

  return out;
};
