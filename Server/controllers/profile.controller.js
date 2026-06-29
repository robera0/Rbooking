import { ProfileModel } from "../models/profile.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import multer from "multer";
import catchAsync from "../errors/catchAsync.js";
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
  const userId = req.user.id;
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
  const user_id = req.user.id;

  if (!user_id) {
    return next(new AppError("There is no user", 401));
  }

  const { fullName, nationality, phone, dateOfBirth, Gender, address, bio } =
    req.body;

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
  let updatedProfile;
  if (req.user.role === "admin") {
    updatedProfile = await AdminProfile.findOneAndUpdate(
      { userId: user_id },
      updates,
      {
        new: true,
        runValidators: true,

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

        setDefaultsOnInsert: true,
      },
    );
  }

  return res.status(200).json({
    success: true,
    profile: updatedProfile,
    message: "Profile updated successfully",
  });
});
