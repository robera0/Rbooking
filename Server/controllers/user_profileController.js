import mongoose from "mongoose";
import { ProfileModel } from "../models/ProfileModel.js";
import { UserModel } from "../models/UserModel.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, Date.now() + "." + ext);
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
    } = req.body;

    // Build avatarUrl from the uploaded file (handled by multer)
    let avatarUrl;
    if (req.file) {
      avatarUrl = `uploads/${req.file.filename}`;
    }

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
      }).filter(([_, v]) => v !== undefined && v !== ""),
    );

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
