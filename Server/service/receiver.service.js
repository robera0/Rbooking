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

  const telebirr = adminProfile.paymentMethods?.find(
    (pm) => pm.provider?.toLowerCase() === "telebirr",
  );
  if (!telebirr?.receiverName) {
    return {
      status: 400,
      message: "Organizer has no Telebirr payment method configured",
    };
  }

  return { eventInfo, adminProfile, receiverName: telebirr.receiverName };
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
  return expectedWords.every((w) => receiptWords.includes(w));
};
