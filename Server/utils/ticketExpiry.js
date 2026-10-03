import { UserTicketModel } from "../models/userTicket.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { clearTicketCache, clearTicketInfoCache } from "../config/redis.js";


export async function expirePendingTickets() {
  try {
    const now = new Date();

    // Find all pending tickets that have passed their expiry
    const expiredTickets = await UserTicketModel.find({
      status: "pending",
      expiresAt: { $lte: now },
    });

    if (expiredTickets.length === 0) return;

    for (const ticket of expiredTickets) {
      // Flip the status atomically first, and only give the seats back if
      // this run won. Without the {status: "pending"} filter, a payment
      // verified between the find above and here would be overwritten with
      // "expired" while its seats were also released.
      const claimed = await UserTicketModel.findOneAndUpdate(
        { _id: ticket._id, status: "pending" },
        { $set: { status: "expired" } },
      );
      if (!claimed) continue;

      await TicketModel.findByIdAndUpdate(ticket.ticketId, {
        $inc: { availableQuantity: ticket.quantity },
      });
      await clearTicketCache(ticket.userId);
      await clearTicketInfoCache(ticket._id.toString());
    }
  
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await UserTicketModel.deleteMany({
      status: "expired",
      expiresAt: { $lte: oneDayAgo },
    });
  } catch (error) {
    console.error("[TicketExpiry] Error:", error.message);
  }
}
