import { ProfileModel } from "../models/profile.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { UserModel } from "../models/user.model.js";
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
  console.log("[getProfile] userId:", userId, "role:", req.user.role);
  let profile;
  if (req.user.role === "admin") {
    profile = await AdminProfileService.findOne(userId);
  } else {
    profile = await ProfileService.findOne(userId);
    console.log("[getProfile] profile found:", profile ? "YES" : "NULL", profile?.avatarUrl ? `avatarUrl: ${profile.avatarUrl}` : "no avatarUrl");
    if (profile && !profile.username) {
      const baseUsername = profile.fullName ? profile.fullName.replace(/\s+/g, "").toLowerCase() : (profile.userId?.email ? profile.userId.email.split("@")[0] : "user");
      let username = baseUsername;
      let count = 0;
      while (await ProfileModel.findOne({ username })) {
        count++;
        username = `${baseUsername}${count}`;
      }
      profile.username = username;
      await profile.save();
    }
  }
  res.status(200).json({ user: profile });
});

// EDIT USER PROFILE
export const updateUser = catchAsync(async (req, res, next) => {
  const user_id = req.user.id;

  if (!user_id) {
    return next(new AppError("There is no user", 401));
  }

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

  if (username) {
    const existing = await ProfileModel.findOne({ username, userId: { $ne: user_id } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }
  }

  // Build avatarUrl and coverPage from the uploaded files (handled by multer)
  let avatarUrl;
  let coverPage;
  if (req.file) {
    if (req.file.fieldname === "avatarUrl") {
      avatarUrl = `uploads/${req.file.filename}`;
    } else if (req.file.fieldname === "coverPage") {
      coverPage = `uploads/${req.file.filename}`;
    }
  } else if (req.files) {
    if (req.files.avatarUrl && req.files.avatarUrl[0]) {
      avatarUrl = `uploads/${req.files.avatarUrl[0].filename}`;
    }
    if (req.files.coverPage && req.files.coverPage[0]) {
      coverPage = `uploads/${req.files.coverPage[0].filename}`;
    }
  }
  const normalizedPhone = phone
    ? phone.startsWith("+251")
      ? phone
      : phone.startsWith("0")
        ? `+251${phone.slice(1)}`
        : `+251${phone}`
    : phone;

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
      coverPage,
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

  console.log("[updateUser] user_id:", user_id, "role:", req.user.role);
  console.log("[updateUser] req.file:", req.file ? req.file.fieldname : "NONE");
  console.log("[updateUser] req.files:", req.files ? Object.keys(req.files) : "NONE");
  console.log("[updateUser] avatarUrl resolved:", avatarUrl);
  console.log("[updateUser] updates keys:", Object.keys(updates));

  let updatedProfile;
  if (req.user.role === "admin") {
    updatedProfile = await AdminProfile.findOneAndUpdate(
      { userId: user_id },
      updates,
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  } else {
    updatedProfile = await ProfileModel.findOneAndUpdate(
      { userId: user_id },
      updates,
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
    // Mark user profile as complete
    await UserModel.findByIdAndUpdate(user_id, { isProfileComplete: true });
  }

  console.log("[updateUser] result avatarUrl:", updatedProfile?.avatarUrl);

  return res.status(200).json({
    success: true,
    profile: updatedProfile,
    message: "Profile updated successfully",
  });
});
