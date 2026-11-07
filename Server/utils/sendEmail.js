let transporter;

// Created on first use so a missing mail setting cannot stop the server from
// starting; only sending a reset email fails (and that is logged).
const getTransporter = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS are not configured on the server");
  }
  if (!transporter) {
    // Loaded here, not at the top, so a server without the package still starts.
    const { default: nodemailer } = await import("nodemailer");
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  // Local development without mail settings: print the email instead.
  if (
    process.env.NODE_ENV !== "production" &&
    (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
  ) {
    console.log(`[dev email] to ${to} | ${subject}\n${html}`);
    return;
  }
  const mail = await getTransporter();
  await mail.sendMail({
    from: `"Paysso" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendPasswordResetEmail = ({ to, url }) =>
  sendEmail({
    to,
    subject: "Reset your Paysso password",
    html: `
      <h2>Reset your password</h2>
      <p>Click the button below to choose a new password:</p>
      <p>
        <a href="${url}" style="background:#FF7A00;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          Reset password
        </a>
      </p>
      <p>The link expires in 15 minutes and works once. If you didn't request this, you can ignore this email.</p>
    `,
  });
