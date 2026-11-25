import { test } from "node:test";
import assert from "node:assert/strict";
import { refFromSearch, saveRef, readRef, captureRefFromUrl } from "./referral.js";

const memory = () => {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, v),
  };
};

test("reads and upper-cases ?ref=", () => {
  assert.equal(refFromSearch("?ref=abel25"), "ABEL25");
  assert.equal(refFromSearch("?x=1&ref=ABEL25"), "ABEL25");
});

test("ignores missing or malformed codes", () => {
  assert.equal(refFromSearch(""), "");
  assert.equal(refFromSearch("?ref="), "");
  assert.equal(refFromSearch("?ref=a"), "");
  assert.equal(refFromSearch("?ref=<script>"), "");
});

test("a saved code comes back, and expires after 30 days", () => {
  const s = memory();
  saveRef("ABEL25", s, 1000);
  assert.equal(readRef(s, 2000), "ABEL25");
  assert.equal(readRef(s, 1000 + 31 * 24 * 60 * 60 * 1000), "");
});

test("captureRefFromUrl stores only when the URL has a code", () => {
  const s = memory();
  assert.equal(captureRefFromUrl("?foo=1", s), "");
  assert.equal(readRef(s), "");
  assert.equal(captureRefFromUrl("?ref=selam", s), "SELAM");
  assert.equal(readRef(s), "SELAM");
});

test("a newer link replaces the older code", () => {
  const s = memory();
  captureRefFromUrl("?ref=abel", s);
  captureRefFromUrl("?ref=selam", s);
  assert.equal(readRef(s), "SELAM");
});

test("broken storage never throws", () => {
  const broken = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.doesNotThrow(() => saveRef("ABEL", broken));
  assert.equal(readRef(broken), "");
});
