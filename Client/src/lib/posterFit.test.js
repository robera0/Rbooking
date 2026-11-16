import { test } from "node:test";
import assert from "node:assert/strict";
import { containRect, coverRect } from "./posterFit.js";

test("an image with the poster's own shape fills it with nothing cut", () => {
  assert.deepEqual(containRect(800, 1000, 1080, 1350), { x: 0, y: 0, w: 1080, h: 1350 });
});

test("a wide image is shown whole, centred, with space above and below", () => {
  const r = containRect(2000, 1000, 1080, 1350);
  assert.equal(r.w, 1080);
  assert.equal(r.h, 540);
  assert.equal(r.x, 0);
  assert.equal(r.y, 405);
});

test("a tall image is shown whole, centred, with space left and right", () => {
  const r = containRect(500, 2000, 1080, 1350);
  assert.equal(r.h, 1350);
  assert.equal(r.w, 337.5);
  assert.equal(r.x, 371.25);
  assert.equal(r.y, 0);
});

test("the contained image never goes outside the poster", () => {
  for (const [w, h] of [[10, 10], [4000, 300], [300, 4000], [1080, 1350]]) {
    const r = containRect(w, h, 1080, 1350);
    assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= 1080.0001 && r.y + r.h <= 1350.0001);
  }
});

test("cover fills the whole poster (used for the soft backdrop)", () => {
  const r = coverRect(2000, 1000, 1080, 1350);
  assert.equal(r.h, 1350);
  assert.equal(r.w, 2700);
  assert.equal(r.x, -810);
});

test("a zero-sized image does not produce NaN", () => {
  assert.deepEqual(containRect(0, 0, 1080, 1350), { x: 0, y: 0, w: 1080, h: 1350 });
});
