import test from "node:test";
import assert from "node:assert/strict";
import {
  parseSpotifyUrl,
  spotifyFieldsFromLink,
  spotifyProblem,
  buildSpotifyEmbedUrl,
  fetchSpotifyTitle,
  INVALID_SPOTIFY_MESSAGE,
} from "./spotify.js";

const TRACK_ID = "0123456789abcdefghijkl"; // 22 base62 chars
const ALBUM_ID = "ABCDEFGHIJKLMNOPQRSTUV";
const PLAYLIST_ID = "aBcDeFgHiJkLmNoPqRsTuV";

// ---- parseSpotifyUrl --------------------------------------------------------

test("parses track, album and playlist links", () => {
  assert.deepEqual(parseSpotifyUrl(`https://open.spotify.com/track/${TRACK_ID}`), { type: "track", id: TRACK_ID });
  assert.deepEqual(parseSpotifyUrl(`https://open.spotify.com/album/${ALBUM_ID}`), { type: "album", id: ALBUM_ID });
  assert.deepEqual(parseSpotifyUrl(`https://open.spotify.com/playlist/${PLAYLIST_ID}`), { type: "playlist", id: PLAYLIST_ID });
});

test("strips query strings such as ?si=... and hashes", () => {
  assert.deepEqual(
    parseSpotifyUrl(`https://open.spotify.com/track/${TRACK_ID}?si=abc123&utm_source=copy`),
    { type: "track", id: TRACK_ID },
  );
  assert.deepEqual(
    parseSpotifyUrl(`https://open.spotify.com/playlist/${PLAYLIST_ID}#something`),
    { type: "playlist", id: PLAYLIST_ID },
  );
});

test("strips intl-xx locale segments", () => {
  for (const locale of ["intl-en", "intl-de", "intl-fr", "INTL-XX"]) {
    assert.deepEqual(
      parseSpotifyUrl(`https://open.spotify.com/${locale}/album/${ALBUM_ID}?si=xyz`),
      { type: "album", id: ALBUM_ID },
    );
  }
});

test("tolerates www, a trailing slash, http and surrounding whitespace", () => {
  assert.deepEqual(parseSpotifyUrl(` https://www.open.spotify.com/track/${TRACK_ID}/ `), { type: "track", id: TRACK_ID });
  assert.deepEqual(parseSpotifyUrl(`http://OPEN.SPOTIFY.COM/ALBUM/${ALBUM_ID}`), { type: "album", id: ALBUM_ID });
});

test("rejects anything that is not a plain track/album/playlist link", () => {
  const invalid = [
    "",
    "   ",
    null,
    undefined,
    42,
    "not a url",
    "javascript:alert(1)",
    `https://evil.com/track/${TRACK_ID}`,
    `https://open.spotify.com.evil.com/track/${TRACK_ID}`,
    `https://evil.com/?u=https://open.spotify.com/track/${TRACK_ID}`,
    `https://user:pass@open.spotify.com/track/${TRACK_ID}`,
    `https://open.spotify.com/artist/${TRACK_ID}`,
    `https://open.spotify.com/show/${TRACK_ID}`,
    `https://open.spotify.com/embed/track/${TRACK_ID}`,
    `https://open.spotify.com/track/short-id`,
    `https://open.spotify.com/track/${TRACK_ID}extra`,
    `https://open.spotify.com/track/${TRACK_ID}/extra`,
    `https://open.spotify.com/track/${"!".repeat(22)}`,
    `https://open.spotify.com/track/${"a".repeat(21)}`,
    `https://open.spotify.com/track/%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F`,
  ];
  for (const value of invalid) {
    assert.equal(parseSpotifyUrl(value), null, `should reject: ${String(value)}`);
  }
});

// ---- storage fields ----------------------------------------------------------

test("only validated type and id are stored", () => {
  assert.deepEqual(spotifyFieldsFromLink(`https://open.spotify.com/track/${TRACK_ID}?si=abc`), {
    spotifyType: "track",
    spotifyId: TRACK_ID,
  });
  assert.deepEqual(spotifyFieldsFromLink(""), { spotifyType: null, spotifyId: null });
  assert.deepEqual(spotifyFieldsFromLink("https://open.spotify.com/track/nope"), { spotifyType: null, spotifyId: null });
});

test("an empty link is optional; an invalid one shows the friendly error", () => {
  assert.equal(spotifyProblem(""), "");
  assert.equal(spotifyProblem("   "), "");
  assert.equal(spotifyProblem(`https://open.spotify.com/track/${TRACK_ID}`), "");
  assert.equal(spotifyProblem("https://open.spotify.com/artist/whatever"), INVALID_SPOTIFY_MESSAGE);
});

// ---- oEmbed title lookup -----------------------------------------------------

test("the label is fetched from Spotify's public oEmbed endpoint", async () => {
  const original = globalThis.fetch;
  let requested;
  globalThis.fetch = async (url) => {
    requested = url;
    return { ok: true, json: async () => ({ title: "  Blinding Lights  " }) };
  };
  try {
    assert.equal(await fetchSpotifyTitle("track", TRACK_ID), "Blinding Lights");
    assert.equal(
      requested,
      `https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/track/${TRACK_ID}`)}`,
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("no request is made for an invalid type/id, and failures are null", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return { ok: true, json: async () => ({ title: "nope" }) };
  };
  try {
    assert.equal(await fetchSpotifyTitle("artist", TRACK_ID), null);
    assert.equal(await fetchSpotifyTitle("track", "short"), null);
    assert.equal(calls, 0);
    globalThis.fetch = async () => ({ ok: false });
    assert.equal(await fetchSpotifyTitle("track", TRACK_ID), null);
  } finally {
    globalThis.fetch = original;
  }
});

// ---- embed url ---------------------------------------------------------------

test("embed url is built from the type and id only", () => {
  assert.equal(buildSpotifyEmbedUrl("track", TRACK_ID), `https://open.spotify.com/embed/track/${TRACK_ID}`);
  assert.equal(buildSpotifyEmbedUrl("album", ALBUM_ID), `https://open.spotify.com/embed/album/${ALBUM_ID}`);
  assert.equal(buildSpotifyEmbedUrl("playlist", PLAYLIST_ID), `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}`);
});

test("a raw or malformed value can never become an iframe src", () => {
  assert.equal(buildSpotifyEmbedUrl(`https://evil.com/track/${TRACK_ID}`, TRACK_ID), null);
  assert.equal(buildSpotifyEmbedUrl("artist", TRACK_ID), null);
  assert.equal(buildSpotifyEmbedUrl("track", '"></iframe><script>alert(1)</script>'), null);
  assert.equal(buildSpotifyEmbedUrl("track", null), null);
  assert.equal(buildSpotifyEmbedUrl(null, TRACK_ID), null);
});
