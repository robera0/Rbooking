import catchAsync from "../errors/catchAsync.js";
import { sendPasswordResetEmail } from "../utils/sendEmail.js";
import {
  requestPasswordReset,
  resetPasswordWithToken,
  PasswordResetError,
} from "../service/passwordReset.service.js";
import "dotenv/config.js";

const getClientUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");

// Always answers the same way, so the form cannot be used to find out which
// email addresses have an account.
export const verifyEmail = catchAsync(async (req, res) => {
  const result = await requestPasswordReset(req.body?.email, {
    send: sendPasswordResetEmail,
    clientUrl: getClientUrl(),
  });

  if (result.error) {
    console.error("Password reset email failed:", result.cause?.message);
  }

  return res.status(200).json({
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  try {
    await resetPasswordWithToken(req.body?.token, req.body?.password);
  } catch (error) {
    if (error instanceof PasswordResetError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    throw error;
  }

  return res.status(200).json({
    success: true,
    message: "Password updated. You can now sign in.",
  });
});
