import mongoose from "mongoose";

const adminProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Personal
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    avatarUrl: String,

    // Organization
    organizationName: { type: String, required: true },
    businessType: {
      type: String,
      enum: [
        "Event Organizer",
        "Venue Owner",
        "Ticket Reseller",
        "Festival Organizer",
        "Corporate Events",
        "Sports Organizer",
      ],
    },
    businessRegistrationNumber: String,
    taxId: String,

    // Location
    country: String,
    city: String,
    region: String,
    streetAddress: String,

    // Role within admin system
    adminRole: {
      type: String,
      enum: [
        "super_admin",
        "event_manager",
        "ticket_manager",
        "finance_manager",
        "corporate_events",
      ],
      default: "event_manager",
    },

    // Documents
    idDocument: String,
    businessLicense: String,
    companyLogo: String,

    // Security
    isVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const AdminProfile = mongoose.model("AdminProfile", adminProfileSchema);
