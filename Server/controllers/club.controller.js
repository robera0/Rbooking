import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import { hashPasswords } from "../service/password.js";
import { generateAccessToken, generateRefreshToken } from "../service/token.js";
import { UserModel } from "../models/user.model.js";
import { ClubModel } from "../models/club.model.js";
import { imageUploader } from "../liberary/index.js";

const router = express.Router();

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_MAX_AGE = 3 * 24 * 60 * 60 * 1000;
const cookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: COOKIE_MAX_AGE,
});

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

const parseJsonField = (value, fallback = []) => {
  if (!value) return fallback;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
};

export const signupClub = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      email,
      password,
      clubName,
      description,
      contactPhone,
      country,
      region,
      city,
      streetAddress,
      acceptsReservations,
      holdMinutes,
      openingHours,
      paymentMethods,
    } = req.body;

    const normalizedRole = "club_owner";
    const parsedOpeningHours = parseJsonField(openingHours, []);
    const parsedPaymentMethods = parseJsonField(paymentMethods, []).map((pm) => ({
      ...pm,
      receiverName: pm.receiverName?.trim().split(/\s+/)[0] || "",
    }));

    firstName = typeof firstName === "string" ? firstName.trim() : "";
    lastName = typeof lastName === "string" ? lastName.trim() : "";
    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    password = typeof password === "string" ? password.trim() : "";
    clubName = typeof clubName === "string" ? clubName.trim() : "";
    description = typeof description === "string" ? description.trim() : "";
    contactPhone = typeof contactPhone === "string" ? contactPhone.trim() : "";
    country = typeof country === "string" ? country.trim() : "";
    region = typeof region === "string" ? region.trim() : "";
    city = typeof city === "string" ? city.trim() : "";
    streetAddress = typeof streetAddress === "string" ? streetAddress.trim() : "";

    if (!firstName || !lastName || !email || !password || !clubName || !city || !region || !streetAddress || !contactPhone) {
      return res.status(400).json({ message: "Required club registration fields are missing" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const parsedAcceptsReservations = acceptsReservations === true || acceptsReservations === "true";
    if (parsedAcceptsReservations && parsedPaymentMethods.length === 0) {
      return res.status(400).json({ message: "Add at least one payment method to accept reservations" });
    }

    let coverPage = "";
    if (req.file) {
      try {
        const [uploadedUrl] = await imageUploader.uploadMultipleImage([req.file.path], "clubs");
        coverPage = uploadedUrl;
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Failed to delete temp club cover:", req.file.path, unlinkErr);
          }
        });
      } catch (uploadError) {
        console.error("Club cover upload failed:", uploadError);
        return res.status(500).json({ message: "Failed to upload club cover image" });
      }
    }

    const hashedPassword = await hashPasswords(password);
    const newUser = await UserModel.create({
      email,
      password: hashedPassword,
      role: normalizedRole,
      isProfileComplete: true,
    });

    let clubDoc;
    try {
      clubDoc = await ClubModel.create({
        owner: new mongoose.Types.ObjectId(newUser._id),
        name: clubName,
        description,
        coverPage,
        address: {
          country,
          region,
          city,
          streetAddress,
        },
        openingHours: parsedOpeningHours,
        paymentMethods: parsedPaymentMethods,
        acceptsReservations: parsedAcceptsReservations,
        holdMinutes: Number(holdMinutes) || 15,
        isActive: true,
      });
    } catch (clubError) {
      // Do not leave a user behind whose email would then read as taken.
      await UserModel.deleteOne({ _id: newUser._id }).catch(() => {});
      throw clubError;
    }

    const accessToken = generateAccessToken({ id: newUser._id, role: normalizedRole });
    const refreshToken = generateRefreshToken({ id: newUser._id, role: normalizedRole });
    newUser.refreshTokens = [{ token: refreshToken }];
    await newUser.save();

    res
      .cookie("accessToken", accessToken, cookieOptions())
      .cookie("refreshToken", refreshToken, cookieOptions())
      .status(201)
      .json({
        success: true,
        message: "Club registered successfully",
        user: {
          id: newUser._id,
          email,
          role: normalizedRole,
        },
        club: clubDoc,
      });
  } catch (error) {
    console.error("Club signup failed:", error);
    return res.status(500).json({
      message: error.message || "The club could not be registered",
    });
  }
};

const handleUpload = (req, res, next) =>
  upload.single("coverPage")(req, res, (err) => {
    if (!err) return next();
    const message = err.code === "LIMIT_FILE_SIZE" ? "Cover photo must be under 5 MB" : err.message;
    return res.status(400).json({ message });
  });

router.post("/signup/club", handleUpload, signupClub);
router.post("/signup/club-owner", handleUpload, signupClub);

export default router;
