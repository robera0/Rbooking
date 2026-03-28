import { generateRefreshToken, generateAccessToken } from "../service/token.js";
import { hashPasswords, comparePassword } from "../service/password.js";
import { UserModel } from "../models/UserModel.js";
import dotenv from "dotenv";

import jwt from "jsonwebtoken";
dotenv.config();

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const NODE_ENV = process.env.NODE_ENV;
export const register_users = async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await UserModel.findOne({ email });

  if (existingUser)
    return res.status(400).json({ message: "Email already exists" });

  const hashedPassword = await hashPasswords(password);
  const user = await UserModel.create({
    username,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
    },
  });
};

export const login_user = async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) return res.status(400).json({ message: "your are not a user" });

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const payload = {
    id: user._id,
    email: user.email,
  };

  const access_token = generateAccessToken(payload);
  const refresh_token = generateRefreshToken(payload);
  user.refreshTokens.push({ token: refresh_token });
  await user.save();
  res
    .cookie("access_token", access_token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "None",
    })
    .cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "None",
    })
    .status(200)
    .json({ message: "Logged in successfully" });
};

export const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token)
      return res.status(401).json({ message: "their is no refresh_token" });

    jwt.verify(refresh_token, REFRESH_TOKEN_SECRET, async (error, decoded) => {
      if (error) return res.status(401).json({ message: error.message });
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const tokenExists = user.refreshTokens.some(
        (t) => t.token === refresh_token,
      );
      if (!tokenExists) {
        return res.status(403).json({ message: "Token mismatch" });
      }
      const payload = {
        id: user._id,
        email: user.email,
      };

      const newAccessToken = generateAccessToken(payload);
      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    console.log(refresh_token);

    if (!refresh_token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const user = await UserModel.findOne({
      "refreshTokens.token": refresh_token,
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or token invalid" });
    }

    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== refresh_token,
    );

    await user.save();

    res
      .clearCookie("access_token", {
        httpOnly: true,
        secure: NODE_ENV === "production",
        path: "/",
      })
      .clearCookie("refresh_token", {
        httpOnly: true,
        secure: NODE_ENV === "production",
        path: "/",
      })
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
