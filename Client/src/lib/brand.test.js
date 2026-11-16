import { test } from "node:test";
import assert from "node:assert/strict";
import { brandRowLayout } from "./brand.js";

test("the logo and name are centred as one group", () => {
  const r = brandRowLayout({ logoW: 95, logoH: 85, textW: 200, height: 85, gap: 10, centerX: 540 });
  assert.equal(r.logo.w, 95);
  assert.equal(r.total, 95 + 10 + 200);
  assert.equal(r.logo.x, 540 - 305 / 2);
  assert.equal(r.textX, r.logo.x + 95 + 10);
});

test("the logo is scaled to the wanted height, keeping its shape", () => {
  const r = brandRowLayout({ logoW: 100, logoH: 50, textW: 100, height: 100, gap: 0, centerX: 500 });
  assert.equal(r.logo.w, 200);
  assert.equal(r.logo.h, 100);
});

test("a logo with no size does not give NaN", () => {
  const r = brandRowLayout({ logoW: 0, logoH: 0, textW: 100, height: 60, gap: 10, centerX: 500 });
  assert.ok(Number.isFinite(r.logo.x) && Number.isFinite(r.total));
});
