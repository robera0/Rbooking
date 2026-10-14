import mongoose from "mongoose";
import crypto from "crypto";

const InvitationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminProfile",
      required: true,
    },
    ticketId: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(8).toString("hex"),
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    // How often this shared pass was scanned at the gate. Scanning is not
    // limited, since one pass is handed to all invited guests.
    scanCount: {
      type: Number,
      default: 0,
    },
    lastScannedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// One invitation per event; also what makes concurrent requests safe.
InvitationSchema.index({ eventId: 1 }, { unique: true });

export const Invitation = mongoose.model("Invitation", InvitationSchema);
