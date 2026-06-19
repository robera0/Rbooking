import mongoose from "mongoose";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { ProfileModel } from "../models/profile.model.js";
import catchAsync from "../errors/catchAsync.js";
import UserService from "../service/user.service.js";

export const getProfile = catchAsync(async (req, res, next) => {

  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const validUser = await UserService.findById(user._id).select(
    "-password",
  );
  res.json({ user: validUser });
});

export const updateUser = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);

    if (!userId) return res.status(401).json({ message: "There is no user" });

    const { email, password, status } = req.body;

    const updates = Object.fromEntries(
      Object.entries({ email, password }).filter(([_, v]) => v !== undefined),
    );

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "User email or password updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      message: "The user cannot be updated",
      error: error.message,
    });
  }
};
export const completeProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, city, dateOfBirth } = req.body;

    const user = await UserModel.findById(req.user.id);
    // update or create profile
    const profile = await ProfileModel.findOneAndUpdate(
      { userId: user },
      { fullName, phone: phoneNumber, address: city, dateOfBirth },
      { new: true, upsert: true }, // upsert = create if doesn't exist
    );

    // mark user as profile complete
    await UserModel.findByIdAndUpdate(req.user.id, { isProfileComplete: true });

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
