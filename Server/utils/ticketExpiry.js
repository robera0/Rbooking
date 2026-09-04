import { UserTicketModel } from "../models/userTicket.model.js";
import { TicketModel } from "../models/ticket.model.js";

/**
 * Marks pending tickets as "expired" once their expiresAt deadline has passed,
 * and restores the available quantity back to the ticket pool.
 * Called on a 10-minute interval from app.js.
 */
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
      // Restore the quantity back to the ticket pool
      await TicketModel.findByIdAndUpdate(ticket.ticketId, {
        $inc: { availableQuantity: ticket.quantity },
      });

      // Mark as expired
      ticket.status = "expired";
      await ticket.save();
    }

    // Additionally, delete any tickets that have been expired for more than 1 day
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await UserTicketModel.deleteMany({
      status: "expired",
      expiresAt: { $lte: oneDayAgo },
    });
  } catch (error) {
    console.error("[TicketExpiry] Error:", error.message);
  }
}
