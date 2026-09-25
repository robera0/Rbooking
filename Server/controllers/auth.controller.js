import { generateRefreshToken, generateAccessToken } from "../service/token.js";
import { hashPasswords, comparePassword } from "../service/password.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import AdminProfileService from "../service/adminProfile.service.js";
import UserService from "../service/user.service.js";
import catchAsync from "../errors/catchAsync.js";
import AppError from "../errors/AppError.js";
import mongoose from "mongoose";
import redisClient, { REDIS_PREFIX } from "../config/redis.js";
dotenv.config();

const refreshToken_SECRET = process.env.REFRESH_TOKEN_SECRET;
const isProduction = process.env.NODE_ENV === "production";

export const registerAdmin = async (req, res) => {
  try {
    let {
      email,
      password,
      firstName,
      lastName,
      phone,
      organizationName,
      businessType,
      country,
      city,
      region,
      streetAddress,
      adminRole,
      paymentMethods,
    } = req.body;

    let parsedPaymentMethods = [];
    if (paymentMethods) {
      try {
        parsedPaymentMethods = JSON.parse(paymentMethods);
      } catch (e) {
        parsedPaymentMethods = [];
      }
    }

    let coverPage = "";
    if (req.file) {
      coverPage = `uploads/${req.file.filename}`;
    }

    // Trim all string fields
    email = typeof email === "string" ? email.trim().toLowerCase() : email;
    password = typeof password === "string" ? password.trim() : password;
    firstName = typeof firstName === "string" ? firstName.trim() : firstName;
    lastName = typeof lastName === "string" ? lastName.trim() : lastName;
    phone = typeof phone === "string" ? phone.trim() : phone;
    organizationName =
      typeof organizationName === "string"
        ? organizationName.trim()
        : organizationName;
    businessType =
      typeof businessType === "string" ? businessType.trim() : businessType;
    country = typeof country === "string" ? country.trim() : country;
    city = typeof city === "string" ? city.trim() : city;
    region = typeof region === "string" ? region.trim() : region;
    streetAddress =
      typeof streetAddress === "string" ? streetAddress.trim() : streetAddress;
    adminRole = typeof adminRole === "string" ? adminRole.trim() : adminRole;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await hashPasswords(password);

    const session = await mongoose.startSession();
    session.startTransaction();

    let userId;
    let baseUserDocument;

    try {
      // Create the base User
      const newUsers = await UserService.create(
        [
          {
            email,
            password: hashedPassword,
            role: "admin",
          },
        ],
        { session },
      );

      baseUserDocument = newUsers[0];
      userId = baseUserDocument._id;

      // Create the Admin Profile
      await AdminProfileService.create(
        [
          {
            userId: userId,
            email: email,
            firstName,
            lastName,
            phone,
            organizationName,
            businessType,
            country,
            city,
            region,
            streetAddress,
            adminRole,
            coverPage,
            paymentMethods: parsedPaymentMethods,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

    const tokenPayload = { id: userId, role: "admin" };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    baseUserDocument.refreshTokens = [{ token: refreshToken }];
    await baseUserDocument.save();

    const isProduction = process.env.NODE_ENV === "production";

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      })
      .status(201)
      .json({
        success: true,
        message: "Admin created and logged in successfully",
        user: {
          id: userId,
          email: email,
          role: "admin",
        },
      });
  } catch (error) {
    console.error("register user error:", error);
    return res.status(500).json({
      message: "The admin cannot be registered",
      error: error.message,
    });
  }
};

// REGISTER USER

export const register = catchAsync(async (req, res, next) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return next(new AppError(400, "Required fields are missing"));
  }

  const existingUser = await UserService.findByEmail(email);
  if (existingUser) return next(new AppError(400, "Email already exists"));

  const hashedPassword = await hashPasswords(password);

  const newUser = await UserService.create({
    email,
    password: hashedPassword,
    role: "user",
  });

  // Generate a unique default username from fullname or email prefix
  const baseUsername = fullname
    ? fullname.replace(/\s+/g, "").toLowerCase()
    : email.split("@")[0];
  let username = baseUsername;
  let count = 0;
  while (await ProfileModel.findOne({ username })) {
    count++;
    username = `${baseUsername}${count}`;
  }

  await ProfileModel.create({
    userId: newUser._id,
    username,
    fullName: fullname,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: newUser,
  });
});

//
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserService.findByEmail(email);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.status === "banned") {
    return next(
      new AppError("Your account has been banned from using Paysso", 403),
    );
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const MAX_TOKENS = 5;
  user.refreshTokens.push({ token: refreshToken });
  if (user.refreshTokens.length > MAX_TOKENS) {
    user.refreshTokens = user.refreshTokens.slice(-MAX_TOKENS);
  }

  await user.save();

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })
    .status(200)
    .json({ role: user.role, message: "Logged in successfully" });
});

// Exchanges a short-lived one-time code (issued by the Google OAuth
// callback redirect) for a real session. Called by the frontend right
// after landing back on its own domain, so the cookies set here are
// first-party - unlike setting them directly from the callback response,
// which would bind them to the backend's own cross-site domain.
//
// TEMPORARY: using a signed JWT instead of Redis for the exchange code,
// since Redis isn't reachable in production right now. Once Redis is
// working again, swap back to the commented-out block below and remove
// the jwt.verify block.
export const googleExchange = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Missing exchange code" });
  }

  // --- JWT-based exchange (active) ---
  let payload;
  try {
    payload = jwt.verify(code, process.env.OAUTH_EXCHANGE_SECRET);
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Invalid or expired exchange code" });
  }
  const { id, email, role } = payload;

  // --- Previous Redis-based exchange (disabled until Redis is fixed) ---
  // const key = `${REDIS_PREFIX}oauth_exchange:${code}`;
  // const raw = await redisClient.get(key);
  //
  // if (!raw) {
  //   return res
  //     .status(400)
  //     .json({ message: "Invalid or expired exchange code" });
  // }
  // await redisClient.del(key);
  //
  // const { id, email, role } = JSON.parse(raw);

  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const tokenPayload = { id: user._id, email, role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const MAX_TOKENS = 5;
  user.refreshTokens.push({ token: refreshToken });
  if (user.refreshTokens.length > MAX_TOKENS) {
    user.refreshTokens = user.refreshTokens.slice(-MAX_TOKENS);
  }
  await user.save();

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })
    .status(200)
    .json({ role: user.role, message: "Logged in successfully" });
});

export const refresh = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "There is no refreshToken" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, refreshToken_SECRET);
  } catch (error) {
    return next(new AppError(error.message, 401));
  }

  const user = await UserModel.findById(decoded.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);

  if (!tokenExists) {
    return res.status(403).json({ message: "Token mismatch" });
  }

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const newAccessToken = generateAccessToken(payload);

  res
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })
    .status(200)
    .json({ message: "Token refreshed" });
});

export const logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError(400, "Refresh token is required"));
  }

  const user = await UserService.findByRefreshToken(refreshToken);

  if (!user) {
    return next(new AppError(404, "User not found or token invalid"));
  }

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.token !== refreshToken,
  );

  await user.save();

  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
});
