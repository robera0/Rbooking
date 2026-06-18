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
