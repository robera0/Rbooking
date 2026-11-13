import mongoose from "mongoose";

// Record-only payout ledger. Money leaves the platform outside this system;
// this document records that it happened so organizer balances stay honest.
const payoutSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminProfile",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["Telebirr", "CBE", "Abyssinia", "Bank transfer", "Cash", "Other"],
      default: "Telebirr",
    },
    reference: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "paid", "void"],
      default: "paid",
    },
    periodStart: { type: Date, default: null },
    periodEnd: { type: Date, default: null },
    note: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
);

payoutSchema.index({ organizerId: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 });

export const Payout = mongoose.model("Payout", payoutSchema);
