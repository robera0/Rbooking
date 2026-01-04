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
      required: true, // this will be the hashed password
    },
    refreshTokens: [
      {
        token: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("user", userSchema);
