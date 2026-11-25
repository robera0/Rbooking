import mongoose from "mongoose";

// A promoter's referral code. Belongs to one organizer; optionally limited
// to a single event of theirs. Sales are recorded on the order itself
// (UserTicket.referral), so switching a code off never loses history.
const ReferralSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminProfile",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    // Stored upper case, unique across the platform so a code is never
    // ambiguous at checkout.
    code: { type: String, required: true, unique: true, uppercase: true },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ReferralModel = mongoose.model("Referral", ReferralSchema);
