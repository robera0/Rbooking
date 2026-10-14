import { UserTicketModel } from "../models/userTicket.model.js";
import { TicketModel } from "../models/ticket.model.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Match stage that hides expired orders from the organizer, including
// pending ones whose time has run out but the sweep has not reached yet.
export const hideExpiredMatch = (now = new Date()) => ({
  status: { $ne: "expired" },
  $nor: [{ status: "pending", expiresAt: { $lte: now } }],
});

// Expires pending orders whose time has run out and returns their seats to
// the pool. Each order is flipped atomically, so seats are returned exactly
// once even if two sweeps overlap or the buyer pays at the same moment.
// Returns the number of orders expired.
export async function expirePendingTickets(now = new Date()) {
  try {
    const lapsed = await UserTicketModel.find({
      status: "pending",
      expiresAt: { $lte: now },
    })
      .select("_id")
      .lean();

    let expired = 0;
    for (const { _id } of lapsed) {
      const order = await UserTicketModel.findOneAndUpdate(
        { _id, status: "pending", expiresAt: { $lte: now } },
        { $set: { status: "expired" } },
      ).lean();
      if (!order) continue;

      await TicketModel.updateOne(
        { _id: order.ticketId },
        { $inc: { availableQuantity: order.quantity } },
      );
      expired += 1;
    }

    await UserTicketModel.deleteMany({
      status: "expired",
      expiresAt: { $lte: new Date(now.getTime() - DAY_MS) },
    });

    return expired;
  } catch (error) {
    console.error("[TicketExpiry] Error:", error.message);
    return 0;
  }
}
