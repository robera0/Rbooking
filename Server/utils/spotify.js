// Server-side guard for the optional music fields. The client sends an already
// parsed type + id, but a hand-crafted request must not be able to store
// arbitrary content that could later end up in an iframe src.

const SPOTIFY_TYPES = new Set(["track", "album", "playlist"]);
const ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export function normalizeSpotify({ spotifyType, spotifyId, spotifyTitle } = {}) {
  const type = typeof spotifyType === "string" ? spotifyType.toLowerCase() : "";
  const id = typeof spotifyId === "string" ? spotifyId.trim() : "";
  const title =
    typeof spotifyTitle === "string"
      ? spotifyTitle.trim().slice(0, 120)
      : "";

  const valid = SPOTIFY_TYPES.has(type) && ID_PATTERN.test(id);
  return {
    spotifyType: valid ? type : null,
    spotifyId: valid ? id : null,
    spotifyTitle: valid && title ? title : null,
  };
}
