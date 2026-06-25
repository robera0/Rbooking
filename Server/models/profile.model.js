import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    nationality: {
      type: String,
    },
    bio: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    Gender: {
      type: String,
    },
  },
  { timestamps: true },
);
ProfileSchema.index({ User: 1 });

export const ProfileModel = mongoose.model("userprofiles", ProfileSchema);
