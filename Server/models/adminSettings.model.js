import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    notifications: {
      adminAlerts: {
        newTicketPurchase: { type: Boolean, default: true },
      },
      userAlerts: {
        ticketVerified: { type: Boolean, default: true },
        eventCancelled: { type: Boolean, default: true },
      },
    },
    eventClassifications: {
      categories: {
        type: [String],
        default: ["Concert", "Festival", "Theater", "Exhibition", "Sports"],
      },
      genres: {
        type: [String],
        default: ["General", "Rock", "Cultural", "Jazz", "Pop", "Electronic"],
      },
    },
    activePaymentMethods: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const AdminSettingsModel = mongoose.model("AdminSettings", adminSettingsSchema);
