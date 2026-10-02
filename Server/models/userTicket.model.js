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
    ticketType: {
      type: String,
    },
    orderNo: {
      type: String,
      required: true,
      unique: true,
    },

    receiptNo: {
      source: String,
    },
    referenceId: { type: String },

    isVerified: {
      type: Boolean,
      required: true,
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
      enum: ["pending", "paid", "expired", "cancelled", "refunded"],
      default: "pending",
    },

    qrCode: {
      type: String,
      default: "",
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
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

    checked: {
      checkedIn: { type: Boolean, default: false },
      checkedInAt: { type: Date, default: null },
      checkedInBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminProfile",
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

UserTicketSchema.index({ userId: 1, ticketId: 1 });
// One Telebirr receipt can pay for one order. Partial so tickets without a
// referenceId (unverified, or verified before this field existed) don't
// collide with each other.
UserTicketSchema.index(
  { referenceId: 1 },
  { unique: true, partialFilterExpression: { referenceId: { $type: "string" } } },
);

export const UserTicketModel = mongoose.model("UserTicket", UserTicketSchema);
