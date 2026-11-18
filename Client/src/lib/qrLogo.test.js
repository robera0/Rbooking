import { test } from "node:test";
import assert from "node:assert/strict";
import { qrLogoLayout, QR_LOGO_MAX_AREA } from "./qrLogo.js";

test("the logo plate is centred on the QR code", () => {
  const { plate } = qrLogoLayout(600, 95, 85);
  assert.equal(plate.x + plate.size / 2, 300);
  assert.equal(plate.y + plate.size / 2, 300);
});

test("the plate covers little enough of the code to keep it scannable", () => {
  for (const size of [200, 300, 600, 1000]) {
    const { plate } = qrLogoLayout(size, 95, 85);
    const area = (plate.size * plate.size) / (size * size);
    assert.ok(area <= QR_LOGO_MAX_AREA, `${size}: ${area}`);
    assert.ok(area > 0.01, "but it should still be a visible logo");
  }
});

test("the logo sits inside the plate with a margin, keeping its shape", () => {
  const { plate, logo } = qrLogoLayout(600, 95, 85);
  assert.ok(logo.x > plate.x && logo.y > plate.y);
  assert.ok(logo.x + logo.w < plate.x + plate.size);
  assert.ok(logo.y + logo.h < plate.y + plate.size);
  assert.ok(Math.abs(logo.w / logo.h - 95 / 85) < 0.01);
});

test("a logo with no size still gives a sensible box", () => {
  const { logo } = qrLogoLayout(600, 0, 0);
  assert.ok(Number.isFinite(logo.x) && logo.w > 0 && logo.h > 0);
});
