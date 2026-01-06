import mongoose from "mongoose";
// the ticket of the user
const UserTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tickets",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserTicketModel = mongoose.model("user_tickets", UserTicketSchema);
