import mongoose from "mongoose";

const dayHoursSchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
    isOpen: { type: Boolean, default: true },
    opensAt: String, // "21:00"
    closesAt: String, // "04:00", may be earlier than opensAt (closes after midnight)
  },
  { _id: false },
);

const clubSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: String,
    coverPage: String,
    address: {
      country: String,
      region: String,
      city: { type: String, index: true },
      streetAddress: String,
    },
    openingHours: [dayHoursSchema],
    timezone: { type: String, default: "Africa/Addis_Ababa" },
    paymentMethods: [
      {
        provider: String,
        accountNumber: String,
        receiverName: String,
        _id: false,
      },
    ],
    acceptsReservations: { type: Boolean, default: true },
    holdMinutes: { type: Number, default: 15 }, // how long a pending hold lasts
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ClubModel = mongoose.model("Club", clubSchema);
