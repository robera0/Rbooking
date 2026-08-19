import mongoose from "mongoose";

const UserTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },

    orderNo: {
      type: String, // better as string (can include prefix)
      required: true,
      unique: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "expired"],
      default: "pending",
    },

    phone: {
      type: String,
      default: "",
    },

    receiptUrl: {
      type: String,
      default: "",
    },

    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

UserTicketSchema.index({ userId: 1, ticketId: 1 });

export const UserTicketModel = mongoose.model("UserTicket", UserTicketSchema);
