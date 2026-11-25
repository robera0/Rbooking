// Remembers a referral code from a link like ?ref=ABEL25 so it is still there
// at checkout even if the buyer browses around first.
const KEY = "paysso_ref";
const KEEP_MS = 30 * 24 * 60 * 60 * 1000;
const CODE = /^[A-Za-z0-9_-]{3,20}$/;

/** The referral code in a URL query string, upper-cased, or "". */
export function refFromSearch(search) {
  const value = new URLSearchParams(search || "").get("ref") || "";
  return CODE.test(value.trim()) ? value.trim().toUpperCase() : "";
}

export function saveRef(code, storage, now = Date.now()) {
  if (!code) return;
  try {
    storage.setItem(KEY, JSON.stringify({ code, savedAt: now }));
  } catch {
    // Storage can be blocked (private mode); the code just is not remembered.
  }
}

/** The remembered code, or "" when none or older than 30 days. */
export function readRef(storage, now = Date.now()) {
  try {
    const saved = JSON.parse(storage.getItem(KEY) || "null");
    if (!saved?.code || now - saved.savedAt > KEEP_MS) return "";
    return CODE.test(saved.code) ? saved.code : "";
  } catch {
    return "";
  }
}

/** Call once on page load: stores the code when the URL carries one. */
export function captureRefFromUrl(search, storage, now = Date.now()) {
  const code = refFromSearch(search);
  if (code) saveRef(code, storage, now);
  return code;
}
