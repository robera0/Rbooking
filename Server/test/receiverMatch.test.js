import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveReceiver } from "../service/receiver.service.js";

const methods = [
  { provider: "Telebirr", accountNumber: "0911223344", receiverName: "Selam Tadesse" },
  { provider: "Telebirr", accountNumber: "0922556677", receiverName: "Dawit Bekele" },
];

test("returns the Telebirr number whose holder name is on the receipt", () => {
  assert.deepEqual(resolveReceiver("Dawit Bekele", methods), {
    provider: "Telebirr",
    accountNumber: "0922556677",
    receiverName: "Dawit Bekele",
  });
});

test("a first-name-only receipt still finds the right number", () => {
  assert.equal(resolveReceiver("Selam", methods).accountNumber, "0911223344");
});

test("two numbers with the same holder name cannot be told apart", () => {
  const shared = [
    { provider: "Telebirr", accountNumber: "0911000001", receiverName: "Selam Tadesse" },
    { provider: "Telebirr", accountNumber: "0911000002", receiverName: "Selam Tadesse" },
  ];
  assert.deepEqual(resolveReceiver("Selam Tadesse", shared), {
    provider: "Telebirr",
    accountNumber: null,
    receiverName: "Selam Tadesse",
  });
});

test("returns null when no number matches", () => {
  assert.equal(resolveReceiver("Someone Else", methods), null);
});

test("ignores other providers and entries without a holder name", () => {
  const mixed = [
    { provider: "CBE", accountNumber: "1000123", receiverName: "Dawit Bekele" },
    { provider: "Telebirr", accountNumber: "0933", receiverName: "" },
    { provider: "Telebirr", accountNumber: "0922556677", receiverName: "Dawit Bekele" },
  ];
  assert.equal(resolveReceiver("Dawit Bekele", mixed).accountNumber, "0922556677");
});

test("handles a missing list of payment methods", () => {
  assert.equal(resolveReceiver("Dawit", undefined), null);
  assert.equal(resolveReceiver("Dawit", []), null);
});
