import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_LAYOUT,
  mergeLayout,
  QR_MIN_SIZE,
  QR_MAX_PADDING,
} from "../src/lib/invitationLayout.js";

test("defaults when nothing is saved", () => {
  const l = mergeLayout(null);
  assert.equal(l.qr.visible, true);
  assert.equal(l.eventName.size, DEFAULT_LAYOUT.eventName.size);
});

test("the QR can never be hidden, even by a saved layout", () => {
  assert.equal(mergeLayout({ qr: { visible: false } }).qr.visible, true);
});

test("QR size and padding are kept in a scannable range", () => {
  const small = mergeLayout({ qr: { size: 100, padding: 80 } }).qr;
  assert.equal(small.size, QR_MIN_SIZE);
  assert.equal(small.padding, QR_MAX_PADDING);
  const big = mergeLayout({ qr: { size: 5000, padding: -4 } }).qr;
  assert.equal(big.size <= 800, true);
  assert.equal(big.padding, 0);
});

test("garbage values fall back to the defaults", () => {
  const q = mergeLayout({ qr: { size: "abc", padding: null, x: "left" } }).qr;
  assert.equal(q.size, DEFAULT_LAYOUT.qr.size);
  assert.equal(q.padding, DEFAULT_LAYOUT.qr.padding);
  assert.equal(q.x, DEFAULT_LAYOUT.qr.x);
});

test("real customisations are kept", () => {
  const l = mergeLayout({
    overlay: 0.5,
    guest: { size: 60, color: "#ff0000", visible: false },
    qr: { size: 500, padding: 20, bg: "#eeeeee" },
  });
  assert.equal(l.overlay, 0.5);
  assert.equal(l.guest.size, 60);
  assert.equal(l.guest.color, "#ff0000");
  assert.equal(l.guest.visible, false);
  assert.equal(l.qr.size, 500);
  assert.equal(l.qr.bg, "#eeeeee");
});
