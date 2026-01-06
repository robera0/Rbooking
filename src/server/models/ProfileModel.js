import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true, // ensures one profile per user
    },
    fullName: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);

export const ProfileModel = mongoose.model("User_Profile", ProfileSchema);
