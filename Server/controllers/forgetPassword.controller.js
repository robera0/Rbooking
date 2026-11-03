import { UserModel } from "../models/user.model.js";
import catchAsync from "../errors/catchAsync.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { hashPasswords } from "../service/password.js";
import "dotenv/config.js";

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");

export const verifyEmail = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No account found with this email",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = hash(token);
  user.resetTokenExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.VITE_API_URL || "http://localhost:5173"}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset Your Paysso Password",
      html: `
        <h2>Reset your password</h2>
        <p>Click the button below to choose a new password:</p>
        <p>
          <a href="${resetUrl}" style="background:#FF7A00;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Reset password
          </a>
        </p>
        <p>The link expires in 15 minutes. If you didn't request this, ignore this email.</p>
      `,
    });
  } catch (err) {
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      success: false,
      message: "Could not send email. Try again later.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Reset link sent to your email",
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      success: false,
      message: "Token and new password are required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }

  const user = await UserModel.findOne({
    resetToken: hash(token),
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Link is invalid or has expired",
    });
  }

  user.password = await hashPasswords(password);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password updated. You can now sign in.",
  });
});
