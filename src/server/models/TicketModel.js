import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  totalQuantity: {
    type: Number,
    required: true,
    default: 100,
  },
});

export const TicketModel = new mongoose.model("tickets", TicketSchema);
