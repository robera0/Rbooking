// Pure helpers for Spotify links (no React, no Spotify API). We only ever keep
// a validated type + id: the raw URL an organizer pasted is never stored and is
// never used to build the iframe src.

export const INVALID_SPOTIFY_MESSAGE =
  "Please paste a valid Spotify track, album, or playlist link";

const SPOTIFY_TYPES = new Set(["track", "album", "playlist"]);
// Spotify ids are 22 base62 characters. Keeping this strict is also what makes
// it safe to build an embed URL from the parsed values.
const ID_PATTERN = /^[A-Za-z0-9]{22}$/;
const LOCALE_SEGMENT = /^intl-[a-z]{2}$/i;

export function parseSpotifyUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "open.spotify.com") return null;

  // pathname already has the query string and hash stripped off.
  const segments = url.pathname.split("/").filter(Boolean);
  // Localized links look like https://open.spotify.com/intl-en/track/{id}.
  if (LOCALE_SEGMENT.test(segments[0] || "")) segments.shift();
  if (segments.length !== 2) return null;

  const [rawType, id] = segments;
  const type = rawType.toLowerCase();
  if (!SPOTIFY_TYPES.has(type) || !ID_PATTERN.test(id)) return null;
  return { type, id };
}

// What gets persisted on the event. Invalid links become nulls so no partial
// or user-controlled value can be stored.
export function spotifyFieldsFromLink(value) {
  const parsed = parseSpotifyUrl(value);
  return parsed
    ? { spotifyType: parsed.type, spotifyId: parsed.id }
    : { spotifyType: null, spotifyId: null };
}

// "" means "optional field left empty", not an error.
export function spotifyProblem(value) {
  if (value == null || (typeof value === "string" && !value.trim())) return "";
  return parseSpotifyUrl(value) ? "" : INVALID_SPOTIFY_MESSAGE;
}

// Spotify's public oEmbed endpoint returns the title with no token/OAuth and
// allows cross-origin browser calls. We build its URL only from validated
// values, so a pasted URL can never be forwarded as-is.
export async function fetchSpotifyTitle(type, id, signal) {
  const parsed = parseSpotifyUrl(`https://open.spotify.com/${type}/${id}`);
  if (!parsed) return null;
  const canonical = `https://open.spotify.com/${parsed.type}/${parsed.id}`;
  const response = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(canonical)}`,
    { signal },
  );
  if (!response.ok) return null;
  const data = await response.json();
  return typeof data.title === "string" && data.title.trim()
    ? data.title.trim().slice(0, 120)
    : null;
}

// The only way an iframe src is built: from a validated type and id. Passing a
// raw URL here (or anything that is not a known type + valid id) yields null.
export function buildSpotifyEmbedUrl(type, id) {
  if (typeof type !== "string" || typeof id !== "string") return null;
  const normalized = type.toLowerCase();
  if (!SPOTIFY_TYPES.has(normalized) || !ID_PATTERN.test(id)) return null;
  return `https://open.spotify.com/embed/${normalized}/${id}`;
}
