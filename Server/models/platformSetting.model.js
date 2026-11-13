import mongoose from "mongoose";

const platformSettingSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "platform", trim: true },
    commissionRate: {
      type: Number,
      default: 0.1,
      min: 0,
      max: 1,
    },
    currency: { type: String, default: "ETB", trim: true },
    timezone: { type: String, default: "Africa/Addis_Ababa", trim: true },
    supportEmail: { type: String, default: "", trim: true },
    allowManualPayments: { type: Boolean, default: false },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export const PlatformSetting = mongoose.model(
  "PlatformSetting",
  platformSettingSchema,
);

// One platform document, created on first read. Kept as a helper so callers
// never have to care whether the document exists yet.
export async function getPlatformSetting() {
  const setting = await PlatformSetting.findOneAndUpdate(
    { key: "platform" },
    { $setOnInsert: { key: "platform" } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      lean: true,
    },
  );
  return setting;
}
