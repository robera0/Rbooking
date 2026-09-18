import mongoose from "mongoose";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcrypt";
import catchAsync from "../errors/catchAsync.js";
import UserService from "../service/user.service.js";
import ProfileService from "../service/profile.service.js";

export const user = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const validUser = await UserService.findById(userId);
  res.json({ user: validUser });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  if (!userId) return res.status(401).json({ message: "There is no user" });

  const { email, password, currentPass } = req.body;

  const updates = Object.fromEntries(
    Object.entries({ email, password }).filter(
      ([_, v]) => v !== undefined && v !== null && v !== "",
    ),
  );

  if (updates.password) {
    if (!currentPass) {
      return res
        .status(400)
        .json({ message: "Current password is required" });
    }

    const existingUser = await UserModel.findById(userId);
    const isMatch =
      existingUser?.password &&
      (await bcrypt.compare(currentPass, existingUser.password));

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  const updatedUser = await UserService.findByIdAndUpdate(userId, updates);

  return res.status(200).json({
    success: true,
    user: updatedUser,
    message: "User email or password updated successfully",
  });
});
export const completeProfile = catchAsync(async (req, res) => {
  const id = req.user.id;
  const { fullName, phoneNumber, city, dateOfBirth } = req.body;

  const profileData = {
    fullName,
    phone: phoneNumber,
    address: city,
  };

  if (dateOfBirth) {
    profileData.dateOfBirth = dateOfBirth;
  }

  // update or create profile
  const profile = await ProfileService.findOneAndUpdate(id, profileData);

  // mark user as profile complete
  await UserService.findByIdAndUpdate(id, { isProfileComplete: true });

  res.json({ success: true, profile });
});
