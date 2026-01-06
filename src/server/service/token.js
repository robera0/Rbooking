import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const generateAccessToken = (user) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
};

export const generateRefreshToken = (user) => {
  return jwt.sign(user, REFRESH_TOKEN_SECRET);
};
