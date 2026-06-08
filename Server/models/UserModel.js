import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        // Password required only if not Google user
        return !this.googleId;
      },
    },
    googleId: { type: String },
    refreshTokens: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    role: {
      type: String,
      default: "user",
      enum: ["admin", "user"],
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "suspended", "banned"],
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.refreshTokens;
    return ret;
  },
});

export const UserModel = mongoose.model("User", userSchema);

const adminSchema = new mongoose.Schema(
  {
    // Personal Info
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    // Organization Info
    organizationName: {
      type: String,
      required: true,
    },

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
    country: String,
    city: String,
    region: String,
    streetAddress: String,
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

    // Files
    idDocument: String,
    businessLicense: String,
    companyLogo: String,

    // Security
    isVerified: {
      type: Boolean,
      default: false,
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Admin = UserModel.discriminator("admin", adminSchema);
