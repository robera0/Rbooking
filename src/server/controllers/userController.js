import mongoose from "mongoose";
import { UserModel } from "../models/UserModel.js";
import bcrypt from "bcrypt";

// GET USER PROFILE
export const user = async (req, res) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).json({ message: "their is no user " });
    const validUser = await UserModel.findOne({ email: user.email }).select(
      "-password",
    );
    res.json({ user: validUser });
  } catch {
    res.status(401).json({ message: "the user id is not true " });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);

    if (!userId) return res.status(401).json({ message: "There is no user" });

    const { email, currentPass, password } = req.body;

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
