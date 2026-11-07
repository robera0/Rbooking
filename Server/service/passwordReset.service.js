import crypto from "crypto";
import { UserModel } from "../models/user.model.js";
import { hashPasswords } from "./password.js";

export const RESET_TTL_MS = 15 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

export class PasswordResetError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "PasswordResetError";
    this.status = status;
    this.code = code;
  }
}

const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const looksLikeEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Sends a reset link when the address belongs to an active account. It never
// tells the caller whether the account exists: unknown, blocked and
// rate-limited requests all just return { sent: false }.
export async function requestPasswordReset(rawEmail, { send, clientUrl, now = Date.now() }) {
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!looksLikeEmail(email)) return { sent: false };

  const user = await UserModel.findOne({ email });
  if (!user || (user.status && user.status !== "active")) return { sent: false };

  // A link was issued a moment ago: do not let anyone flood the inbox.
  if (user.resetTokenExpires) {
    const issuedAt = user.resetTokenExpires.getTime() - RESET_TTL_MS;
    if (now - issuedAt < RESEND_COOLDOWN_MS) return { sent: false };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await UserModel.updateOne(
    { _id: user._id },
    { $set: { resetToken: sha(token), resetTokenExpires: new Date(now + RESET_TTL_MS) } },
  );

  try {
    await send({
      to: user.email,
      url: `${clientUrl}/reset-password?token=${token}`,
    });
  } catch (error) {
    await UserModel.updateOne(
      { _id: user._id },
      { $unset: { resetToken: "", resetTokenExpires: "" } },
    );
    return { sent: false, error: true, cause: error };
  }

  return { sent: true };
}

// Sets a new password from a reset link. The token is consumed in the same
// atomic update that changes the password, so it works once even if used
// twice at the same moment, and every existing session is signed out.
export async function resetPasswordWithToken(token, password, now = Date.now()) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    throw new PasswordResetError(400, "INVALID_LINK", "This link is invalid or has expired");
  }
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD ||
    password.length > MAX_PASSWORD
  ) {
    throw new PasswordResetError(
      400,
      "WEAK_PASSWORD",
      `Password must be between ${MIN_PASSWORD} and ${MAX_PASSWORD} characters`,
    );
  }

  const hashed = await hashPasswords(password);
  const user = await UserModel.findOneAndUpdate(
    {
      resetToken: sha(token),
      resetTokenExpires: { $gt: new Date(now) },
      status: "active",
    },
    {
      $set: { password: hashed, refreshTokens: [] },
      $unset: { resetToken: "", resetTokenExpires: "" },
    },
  );

  if (!user) {
    throw new PasswordResetError(400, "INVALID_LINK", "This link is invalid or has expired");
  }
}
