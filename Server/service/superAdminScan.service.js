import AppError from "../errors/AppError.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { Event } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";

// An AppError so the shared error handler turns it into the right HTTP status.
export class ScanError extends AppError {
  constructor(status, message) {
    super(message, status);
  }
}

// Builds the same answer for a fresh check-in and a repeat scan: which event
// the ticket is for, when it starts and who holds it.
async function describe(userTicket, outcome) {
  const [tier, user, profile] = await Promise.all([
    TicketModel.findById(userTicket.ticketId).lean(),
    UserModel.findById(userTicket.userId).lean(),
    ProfileModel.findOne({ userId: userTicket.userId }).lean(),
  ]);
  const event = tier ? await Event.findById(tier.eventId).lean() : null;

  return {
    outcome,
    scannedAt: userTicket.checked.checkedInAt,
    ticket: {
      orderNo: userTicket.orderNo,
      name: tier?.name ?? userTicket.ticketType ?? "Ticket",
      quantity: userTicket.quantity,
    },
    event: {
      id: event?._id ?? null,
      name: event?.name ?? "Unknown event",
      startsAt: event?.dates?.start?.dateTime ?? null,
      timezone: event?.dates?.timezone ?? null,
    },
    holder: {
      name: profile?.fullName || user?.email || "Unknown",
      email: user?.email ?? null,
    },
  };
}

// Checks any paid ticket in, whichever event it belongs to. The update is
// atomic, so two scanners racing on one code can't both get "checked in".
export async function scanAnyTicket(token, scannerId) {
  if (typeof token !== "string" || token.trim() === "") {
    throw new ScanError(400, "Invalid QR code.");
  }
  const orderNo = token.trim();

  const checkedIn = await UserTicketModel.findOneAndUpdate(
    {
      orderNo,
      status: "paid",
      isVerified: true,
      "checked.checkedIn": false,
    },
    {
      $set: {
        "checked.checkedIn": true,
        "checked.checkedInAt": new Date(),
        "checked.checkedInBy": scannerId,
      },
    },
    { new: true },
  );
  if (checkedIn) return describe(checkedIn, "checked_in");

  const existing = await UserTicketModel.findOne({ orderNo });
  if (!existing) throw new ScanError(404, "Ticket not found.");
  if (existing.checked?.checkedIn) return describe(existing, "already_scanned");
  throw new ScanError(
    403,
    `Ticket cannot be checked in (status: ${existing.status}).`,
  );
}
