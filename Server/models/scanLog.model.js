import mongoose from "mongoose";

// One row per check-in attempt. Kept denormalised so the "recent scans"
// panel is a single indexed query instead of a chain of joins.
const scanLogSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTicket",
      default: null,
    },
    orderNo: { type: String, default: "" },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    eventName: { type: String, default: "" },
    buyerName: { type: String, default: "" },
    tierName: { type: String, default: "" },
    scannerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    scannerEmail: { type: String, default: "" },
    result: {
      type: String,
      enum: ["checked_in", "already_scanned", "invalid"],
      required: true,
    },
    reason: { type: String, default: "" },
  },
  { timestamps: true },
);

scanLogSchema.index({ createdAt: -1 });
scanLogSchema.index({ eventId: 1, createdAt: -1 });
scanLogSchema.index({ result: 1, createdAt: -1 });

export const ScanLog = mongoose.model("ScanLog", scanLogSchema);
