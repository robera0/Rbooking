import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveStatusUpdate } from "../utils/eventStatus.js";

test("publishing a draft works", () => {
  assert.equal(resolveStatusUpdate("draft", "published"), "published");
});

test("a draft autosave can never unpublish a published event", () => {
  assert.equal(resolveStatusUpdate("published", "draft"), undefined);
});

test("saving a draft over a draft keeps it a draft", () => {
  assert.equal(resolveStatusUpdate("draft", "draft"), "draft");
});

test("no status sent means no status change", () => {
  assert.equal(resolveStatusUpdate("published", undefined), undefined);
  assert.equal(resolveStatusUpdate("draft", undefined), undefined);
});

test("re-publishing a published event is allowed", () => {
  assert.equal(resolveStatusUpdate("published", "published"), "published");
});

test("other statuses pass through unchanged", () => {
  assert.equal(resolveStatusUpdate("published", "cancelled"), "cancelled");
});

test("an event with no stored status can take any incoming status", () => {
  assert.equal(resolveStatusUpdate(undefined, "draft"), "draft");
});
