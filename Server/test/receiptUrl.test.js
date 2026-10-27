import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanReceiptUrl } from "../utils/receiptUrl.js";

const URL_OK = "https://transactioninfo.ethiotelecom.et/receipt/DAB1C2D3E4";

test("a clean link is unchanged", () => {
  assert.equal(cleanReceiptUrl(URL_OK), URL_OK);
});

test("strips surrounding spaces, newlines and tabs", () => {
  assert.equal(cleanReceiptUrl(`  \n${URL_OK}\t \n`), URL_OK);
});

test("strips trailing punctuation people add by accident", () => {
  for (const tail of [".", "..", ",", ";", ":", "!", "?", ")", "]", "}", '"', "'", ". ", " ."]) {
    assert.equal(cleanReceiptUrl(URL_OK + tail), URL_OK, `tail ${JSON.stringify(tail)}`);
  }
});

test("strips wrapping quotes and brackets", () => {
  assert.equal(cleanReceiptUrl(`"${URL_OK}"`), URL_OK);
  assert.equal(cleanReceiptUrl(`<${URL_OK}>`), URL_OK);
  assert.equal(cleanReceiptUrl(`(${URL_OK}).`), URL_OK);
});

test("removes invisible characters from copy/paste", () => {
  assert.equal(cleanReceiptUrl(`​${URL_OK}​﻿`), URL_OK);
  assert.equal(cleanReceiptUrl(`${URL_OK} `), URL_OK);
});

test("pulls the link out of a pasted message", () => {
  assert.equal(
    cleanReceiptUrl(`You have paid ETB 1,400. Receipt: ${URL_OK}. Thank you`),
    URL_OK,
  );
});

test("adds https when the scheme is missing", () => {
  assert.equal(
    cleanReceiptUrl("transactioninfo.ethiotelecom.et/receipt/DAB1C2D3E4."),
    URL_OK,
  );
});

test("keeps the query string and a trailing slash path", () => {
  assert.equal(cleanReceiptUrl("https://x.et/r/ABC?id=5."), "https://x.et/r/ABC?id=5");
  assert.equal(cleanReceiptUrl("https://x.et/r/ABC/"), "https://x.et/r/ABC/");
});

test("returns null for empty or non-link input", () => {
  for (const v of [undefined, null, "", "   ", "hello world", 42, {}, "https://"]) {
    assert.equal(cleanReceiptUrl(v), null, String(v));
  }
});

test("rejects absurdly long input", () => {
  assert.equal(cleanReceiptUrl("https://x.et/" + "a".repeat(2000)), null);
});
