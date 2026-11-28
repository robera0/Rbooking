// Server-side guard for the optional music fields. The client sends an already
// parsed type + id, but a hand-crafted request must not be able to store
// arbitrary content that could later end up in an iframe src.

const SPOTIFY_TYPES = new Set(["track", "album", "playlist"]);
const ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export function normalizeSpotify({ spotifyType, spotifyId } = {}) {
  const type = typeof spotifyType === "string" ? spotifyType.toLowerCase() : "";
  const id = typeof spotifyId === "string" ? spotifyId.trim() : "";

  if (SPOTIFY_TYPES.has(type) && ID_PATTERN.test(id)) {
    return { spotifyType: type, spotifyId: id };
  }
  return { spotifyType: null, spotifyId: null };
}
