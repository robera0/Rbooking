import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ensures one profile per user
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

export const ProfileModel = mongoose.model("UserProfile", ProfileSchema);
