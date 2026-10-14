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
  },
  { timestamps: true },
);

InvitationSchema.index({ eventId: 1 });

export const Invitation = mongoose.model("Invitation", InvitationSchema);
