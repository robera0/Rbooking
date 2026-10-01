import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const generateAccessToken = (user) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "3d" });
};

export const generateRefreshToken = (user) => {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: "3d" });
};

// Short-lived, self-contained token used to hand off the Google OAuth
// result to the frontend for exchange. Signed rather than stored server
// side (e.g. in Redis) so this keeps working even when Redis isn't
// available/provisioned on the current host.
export const generateExchangeToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "2m" });
};

export const verifyExchangeToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};
