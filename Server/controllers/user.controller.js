import mongoose from "mongoose";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcrypt";
<<<<<<< HEAD
=======
import { ProfileModel } from "../models/profile.model.js";
>>>>>>> origin/main
import catchAsync from "../errors/catchAsync.js";
import UserService from "../service/user.service.js";
import ProfileService from "../service/profile.service.js";

export const getProfile = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const validUser = await UserService.findById(user);
  res.json({ user: validUser });
});

export const updateUser = catchAsync(async (req, res, next) => {
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

  const updatedUser = await UserService.findByIdAndUpdate(userId, updates);

  return res.status(200).json({
    success: true,
    user: updatedUser,
    message: "User email or password updated successfully",
  });
});
export const completeProfile = catchAsync(async (req, res) => {
  const { id } = req.user.id;
  const { fullName, phoneNumber, city, dateOfBirth } = req.body;

  const user = await UserModel.findById({ id });
  // update or create profile
  const profile = await ProfileService.findOneAndUpdate(user, {
    fullName,
    phone: phoneNumber,
    address: city,
    dateOfBirth,
  });

  // mark user as profile complete
  await UserService.findByIdAndUpdate(id, { isProfileComplete: true });

  res.json({ success: true, profile });
});
