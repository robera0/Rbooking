import mongoose from "mongoose";
import { ProfileModel } from "../models/ProfileModel.js";
import { UserModel } from "../models/UserModel.js";
import { hashPasswords, comparePassword } from "../service/password.js";
import multer from "multer";
import path from "path";

//multer for uploading image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
export const upload = multer({ storage });

export const get_user_profile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const user_profile = await ProfileModel.findOne({ userId: user_id })
      .populate("userId")
      .exec();
    res.status(200).json({ user: user_profile });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// EDIT USER PROFILE
export const update_user = async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({ message: "There is no user" });
    }

    const {
      fullName,
      nationality,
      phone,
      dateOfBirth,
      Gender,
      address,
      bio,
      avatarUrl,
    } = req.body;

    avatarUrl = req.file ? req.file.path : "";

    const updates = Object.fromEntries(
      Object.entries({
        fullName,
        nationality,
        phone,
        dateOfBirth,
        Gender,
        address,
        bio,
        avatarUrl,
      }).filter(([_, v]) => v !== undefined),
    );
    const user = await UserModel.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentpass && newpass) {
      const isMatch = await comparePassword(currentpass, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Current password is incorrect",
        });
      }
      user.password = await hashPasswords(newpass);
      await user.save();
    }

    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { userId: user_id },
      updates,
      {
        new: true,
        runValidators: true,

        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json({
      success: true,
      profile: updatedProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "The user profile cannot be updated",
      error: error.message,
    });
  }
};
