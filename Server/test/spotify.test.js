import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeSpotify } from "../utils/spotify.js";

const ID = "0123456789abcdefghijkl"; // 22 base62 chars

test("valid type and id are normalised and kept", () => {
  assert.deepEqual(normalizeSpotify({ spotifyType: "TRACK", spotifyId: ID }), {
    spotifyType: "track",
    spotifyId: ID,
  });
  assert.deepEqual(normalizeSpotify({ spotifyType: "playlist", spotifyId: ID }), {
    spotifyType: "playlist",
    spotifyId: ID,
  });
});

test("missing, empty or malicious values become nulls", () => {
  for (const input of [
    {},
    { spotifyType: "", spotifyId: "" },
    { spotifyType: "artist", spotifyId: ID },
    { spotifyType: "track", spotifyId: "short" },
    { spotifyType: "track", spotifyId: `https://evil.com/${ID}` },
    { spotifyType: "track", spotifyId: "x".repeat(21) },
  ]) {
    assert.deepEqual(normalizeSpotify(input), { spotifyType: null, spotifyId: null });
  }
});
