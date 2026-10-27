// Receipts print money as text: "1,400 Birr", "1,400.50 Birr". parseFloat stops
// at the comma and reads that as 1, which made every ticket of 1,000 ETB or more
// fail verification with "Invalid amount. Expected 1400, but receipt shows 1,400 Birr".
export function parseAmount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value !== "string") return NaN;

  const cleaned = value.replace(/birr|etb/gi, "").replace(/[,\s]/g, "");
  return /^\d+(\.\d+)?$/.test(cleaned) ? Number(cleaned) : NaN;
}

// Equal to the cent, so 0.1 * 3 still matches "0.30 Birr".
export function amountsMatch(receiptAmount, expectedAmount) {
  const received = parseAmount(receiptAmount);
  const expected = parseAmount(expectedAmount);
  if (Number.isNaN(received) || Number.isNaN(expected)) return false;
  return Math.round(received * 100) === Math.round(expected * 100);
}
