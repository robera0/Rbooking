import { UserTicketModel } from "../models/userTicket.model.js";
import { TicketModel } from "../models/ticket.model.js";


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

      ticket.status = "expired";
      await ticket.save();
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
