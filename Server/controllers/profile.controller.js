import { ProfileModel } from "../models/profile.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import multer from "multer";
import mongoose from "mongoose";
import catchAsync from "../errors/catchAsync.js";
import { safeParse } from "../utils/safeParse.js";
import AdminProfileService from "../service/adminProfile.service.js";
import ProfileService from "../service/profile.service.js";

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

export const getProfile = catchAsync(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  console.log(userId);
  let profile;
  if (req.user.role === "admin") {
    profile = await AdminProfileService.findOne(userId);
  } else {
    profile = await ProfileService.findOne(userId);
  }
  res.status(200).json({ user: profile });
});

// EDIT USER PROFILE
export const updateUser = catchAsync(async (req, res, next) => {
  const user_id = new mongoose.Types.ObjectId(req.user.id);

  if (!user_id) {
    return res.status(401).json({ message: "There is no user" });
  }

  try {
    const {
      username,
      fullName,
      nationality,
      phone,
      dateOfBirth,
      Gender,
      address,
      bio,
      firstName,
      lastName,
      organizationName,
      role,
      website,
      country,
      city,
      region,
      streetAddress,
      paymentMethods,
    } = req.body;

    console.log(req.body);
    // Build avatarUrl from the uploaded file (handled by multer)
    let avatarUrl;
    let coverPage;

    if (req.files?.avatarUrl?.[0]) {
      avatarUrl = `uploads/${req.files.avatarUrl[0].filename}`;
    }
    if (req.files?.coverPage?.[0]) {
      coverPage = `uploads/${req.files.coverPage[0].filename}`;
    }

    const normalizedPhone = phone
      ? phone.startsWith("+251")
        ? phone
        : phone.startsWith("0")
          ? `+251${phone.slice(1)}`
          : `+251${phone}`
      : undefined;

    if (normalizedPhone) {
      const existingUser = await ProfileService.findByPhone(normalizedPhone);
      if (
        existingUser &&
        existingUser.userId.toString() !== user_id.toString()
      ) {
        return res.status(400).json({ message: "phone already exists" });
      }
    }

    const updates = Object.fromEntries(
      Object.entries({
        username,
        fullName,
        nationality,
        phone: normalizedPhone,
        dateOfBirth,
        Gender,
        address,
        bio,
        avatarUrl,
        firstName,
        lastName,
        organizationName,
        role,
        website,
        country,
        city,
        region,
        streetAddress,
        paymentMethods: paymentMethods ? safeParse(paymentMethods) : undefined,
      }).filter(([_, v]) => v !== undefined && v !== ""),
    );

    console.log("update profile", updates);
    let updatedProfile;
    if (req.user.role === "admin") {
      updatedProfile = await AdminProfile.findOneAndUpdate(
        { userId: user_id },
        updates,
        {
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          upsert: true,
        },
      );
    } else {
      updatedProfile = await ProfileModel.findOneAndUpdate(
        { userId: user_id },
        updates,
        {
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          upsert: true,
        },
      );
    }

    return res.status(200).json({
      success: true,
      profile: updatedProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});
