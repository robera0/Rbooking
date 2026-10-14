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
    guestName: { type: String, trim: true, default: "Guest" },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    // Added: check-in status at the gate
    isChecked: { type: Boolean, default: false },
    checkedInAt: { type: Date },

    // How often this shared pass was scanned at the gate. Scanning is not
    // limited, since one pass is handed to all invited guests.
    scanCount: {
      type: Number,
      default: 0,
    },
    lastScannedAt: {
      type: Date,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const Invitation = mongoose.model("Invitation", InvitationSchema);
