import mongoose from "mongoose";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";

// One person may hold at most this many free tickets per event, so a single
// account cannot take every seat of a free event.
export const MAX_FREE_PER_EVENT = 4;

// Free tickets the user holds for the event (paid or still pending).
export async function freeTicketsHeld(userId, eventId) {
  const tierIds = await TicketModel.find({ eventId }).distinct("_id");
  const [row] = await UserTicketModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(String(userId)),
        ticketId: { $in: tierIds },
        totalAmount: 0,
        status: { $in: ["paid", "pending"] },
      },
    },
    { $group: { _id: null, held: { $sum: "$quantity" } } },
  ]);
  return row?.held ?? 0;
}

export async function remainingFreeAllowance(userId, eventId) {
  const held = await freeTicketsHeld(userId, eventId);
  return Math.max(0, MAX_FREE_PER_EVENT - held);
}
