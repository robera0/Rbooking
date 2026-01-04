import jwt from "jwtwebsoket ";
import dotenv from "dotenv";
dotenv.config();

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const generateAccessToken = (user) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
};

export const generateRefreshToken = (user) => {
  return jwt.sign(user, REFRESH_TOKEN_SECRET);
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
