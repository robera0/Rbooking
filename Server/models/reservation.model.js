const tableSchema = new mongoose.Schema({
  club: { type: ObjectId, ref: "Club", required: true, index: true },
  name: String, // "VIP 3"
  section: String, // "VIP", "Main floor"
  capacity: { type: Number, required: true },
  minSpend: Number, // optional
  deposit: Number, // optional
  isActive: { type: Boolean, default: true },
});

const reservationSchema = new mongoose.Schema(
  {
    club: { type: ObjectId, ref: "Club", required: true, index: true },
    table: { type: ObjectId, ref: "Table", required: true },
    user: { type: ObjectId, ref: "User", required: true, index: true },
    night: { type: String, required: true }, // "2026-10-10", the club's night, not the calendar day
    partySize: { type: Number, required: true },
    arrivalBy: String, // "23:30"
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "expired",
        "checked_in",
        "no_show",
      ],
      default: "pending",
    },
    holdExpiresAt: Date, // pending holds expire
    qrCode: String, // for check-in at the door
    paymentStatus: {
      type: String,
      enum: ["none", "unpaid", "paid", "refunded"],
      default: "none",
    },
  },
  { timestamps: true },
);

// Prevents double booking: one active reservation per table per night
reservationSchema.index(
  { table: 1, night: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed", "checked_in"] },
    },
  },
);

export const ReservationModel = mongoose.model(
  "reservation",
  reservationSchema,
);
