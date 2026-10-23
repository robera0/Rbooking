import { Event } from "../models/events.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";

export const getExpectedReceiver = async (userTicket) => {
  const ticketTier = userTicket.ticketId; // must be populated with eventId

  if (!ticketTier || !ticketTier.eventId) {
    return { status: 404, message: "Ticket tier or event not found" };
  }

  const eventInfo = await Event.findById(ticketTier.eventId);
  if (!eventInfo) return { status: 404, message: "Event not found" };
  if (!eventInfo.adminId)
    return { status: 404, message: "Event has no organizer" };

  let adminProfile = await AdminProfile.findById(eventInfo.adminId);
  if (!adminProfile) {
    adminProfile = await AdminProfile.findOne({ userId: eventInfo.adminId });
  }
  if (!adminProfile)
    return { status: 404, message: "Organizer profile not found" };

  // An organizer can list several Telebirr numbers; a payment to any of
  // them is valid, so collect every receiver name, not just the first.
  const receiverNames = (adminProfile.paymentMethods || [])
    .filter((pm) => pm.provider?.toLowerCase() === "telebirr" && pm.receiverName)
    .map((pm) => pm.receiverName);
  if (receiverNames.length === 0) {
    return {
      status: 400,
      message: "Organizer has no Telebirr payment method configured",
    };
  }

  return {
    eventInfo,
    adminProfile,
    receiverName: receiverNames[0],
    receiverNames,
  };
};

export const nameMatches = (receiptName, expectedName) => {
  const clean = (s = "") =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .split(/\s+/)
      .filter(Boolean);

  const receiptWords = clean(receiptName);
  const expectedWords = clean(expectedName);

  if (receiptWords.length === 0 || expectedWords.length === 0) return false;

  // The receipt-verification API only ever returns the payer's first name
  // (e.g. "Nahom" for "Nahom Abebe"), so requiring every word of the full
  // expected name to appear on the receipt would always fail once an admin
  // configures a multi-word receiver name. Compare whichever side has
  // fewer words against the other, so a same-length or full-name receipt
  // still matches exactly while a first-name-only receipt still matches a
  // longer expected name (and vice versa, if the expected name was
  // configured as just a first name).
  const [shorter, longer] =
    receiptWords.length <= expectedWords.length
      ? [receiptWords, expectedWords]
      : [expectedWords, receiptWords];
  return shorter.every((w) => longer.includes(w));
};

// True when the receipt's credited name matches any configured receiver.
export const nameMatchesAny = (receiptName, expectedNames = []) =>
  expectedNames.some((name) => nameMatches(receiptName, name));

// Which of the organizer's Telebirr numbers a receipt was paid to, judged by
// the holder name on the receipt. Returns null when none match.
// If more than one number matches (two numbers held under the same name),
// the number cannot be known: accountNumber is null and the name is kept so
// the order can still be reported as "unassigned".
export const resolveReceiver = (receiptName, paymentMethods = []) => {
  const matches = (paymentMethods || []).filter(
    (pm) =>
      pm?.provider?.toLowerCase() === "telebirr" &&
      pm.receiverName &&
      nameMatches(receiptName, pm.receiverName),
  );
  if (matches.length === 0) return null;

  if (matches.length === 1) {
    return {
      provider: "Telebirr",
      accountNumber: matches[0].accountNumber ?? null,
      receiverName: matches[0].receiverName,
    };
  }

  const names = [...new Set(matches.map((pm) => pm.receiverName))];
  return {
    provider: "Telebirr",
    accountNumber: null,
    receiverName: names.length === 1 ? names[0] : receiptName,
  };
};
