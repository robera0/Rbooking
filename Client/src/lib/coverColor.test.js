import test from "node:test";
import assert from "node:assert/strict";
import { sampleCoverColor } from "./coverColor.js";

test("sampling is a no-op outside a browser", async () => {
  assert.equal(await sampleCoverColor("/poster.jpg"), null);
  assert.equal(await sampleCoverColor(""), null);
});
