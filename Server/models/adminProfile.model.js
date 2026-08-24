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
    email: { type: String, required: true },
    dateOfBirth: {
      type: Date,
    },
    nationality: {
      type: String,
    },
    bio: {
      type: String,
    },
    address: {
      type: String,
    },
    Gender: {
      type: String,
    },
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
    // businessRegistrationNumber: String,
    //taxId: String,

    // Location
    country: String,
    city: String,
    region: String,
    streetAddress: String,

    // Documents
    coverPage: String,
    paymentMethods: [
      {
        provider: {
          type: String,
          enum: ["Telebirr", "Abyssinia Bank", "CBE", "MPSA"],
        },
        accountNumber: String,
      },
    ],
    
    // Role within admin system
    adminRole: {
      type: String,
      enum: [
        "super admin",
        "event organizer",
        "ticket manager",
        "finance manager",
        "corporate events",
      ],
      default: "event organizer",
    },

    // Documents
    idDocument: String,
    businessLicense: String,
    companyLogo: String,

    // Security
    isVerified: { type: Boolean, default: false },
    // twoFactorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const AdminProfile = mongoose.model("AdminProfile", adminProfileSchema);
