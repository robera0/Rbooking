import fs from "fs";
import path from "path";
import { Event } from "../models/events.model.js";
import { UserModel } from "../models/user.model.js";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "ticket-verification-failures.log");

// One JSON object per line. Never throws: a logging problem must not change
// what the user sees from the verify endpoint.
export const logVerificationFailure = async ({
  userId,
  userTicketId,
  receiptUrl,
  userTicket,
  status,
  reason,
  message,
  details,
}) => {
  try {
    const ticketTier = userTicket?.ticketId;
    const eventId = ticketTier?.eventId;

    const [user, event] = await Promise.all([
      userId ? UserModel.findById(userId).select("email").lean() : null,
      eventId ? Event.findById(eventId).select("name").lean() : null,
    ]);

    const entry = {
      time: new Date().toISOString(),
      reason,
      message,
      httpStatus: status,
      verifier: { userId, email: user?.email },
      ticket: {
        userTicketId,
        orderNo: userTicket?.orderNo,
        tier: ticketTier?.name,
        expectedAmount: userTicket?.totalAmount,
      },
      event: { eventId: eventId?.toString(), name: event?.name },
      receiptUrl,
      details,
    };

    await fs.promises.mkdir(LOG_DIR, { recursive: true });
    await fs.promises.appendFile(LOG_FILE, JSON.stringify(entry) + "\n");
  } catch (err) {
    console.error("Failed to write verification failure log:", err.message);
  }
};
