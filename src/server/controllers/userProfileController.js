import mongoose from "mongoose";
import { ProfileModel } from "../models/ProfileModel.js";
import { UserModel } from "../models/UserModel.js";
import { hashPasswords, comparePassword } from "../service/password.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage }).single("avatarUrl");

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
    console.log(user_id);
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
      currentpass,
      newpass,
    } = req.body;

    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (nationality) updates.nationality = nationality;
    if (phone) updates.phone = phone;
    if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
    if (Gender) updates.Gender = Gender;
    if (address) updates.address = address;
    if (bio) updates.bio = bio;

    // Handle avatar update
    if (req.file) {
      const profile = await ProfileModel.findOne({ userId: user_id });
      if (profile?.avatarUrl && fs.existsSync(profile.avatarUrl)) {
        fs.unlinkSync(profile.avatarUrl); // delete old image
      }
      updates.avatarUrl = req.file.path; // save new image path
    }

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
        upsert: true,
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
