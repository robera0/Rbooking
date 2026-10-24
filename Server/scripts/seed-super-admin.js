// Creates (or resets) the default super admin login used by the scanner app.
//   node scripts/seed-super-admin.js          -> local database
//   SEED_MONGO_URL=<uri> node scripts/seed-super-admin.js --yes   -> any other database
// Email/password default to paysso@gmail.com / 1234567890 and can be
// overridden with SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD.
import "dotenv/config";
import mongoose from "mongoose";
import { UserModel } from "../models/user.model.js";
import { hashPasswords } from "../service/password.js";

const email = (process.env.SUPER_ADMIN_EMAIL || "paysso@gmail.com").toLowerCase();
const password = process.env.SUPER_ADMIN_PASSWORD || "1234567890";
const url = process.env.SEED_MONGO_URL || process.env.LOCAL_MONGO;

if (!url) {
  console.error("Set SEED_MONGO_URL (or LOCAL_MONGO) to the database to seed.");
  process.exit(1);
}
const isLocal = /^mongodb:\/\/(localhost|127\.0\.0\.1)[:/]/.test(url);
if (!isLocal && !process.argv.includes("--yes")) {
  console.error("That is not a local database. Re-run with --yes to seed it anyway.");
  process.exit(1);
}

try {
  await mongoose.connect(url, { serverSelectionTimeoutMS: 8000 });
  const existing = await UserModel.findOne({ email });
  const hashed = await hashPasswords(password);
  if (existing) {
    existing.role = "super_admin";
    existing.status = "active";
    existing.password = hashed;
    await existing.save();
    console.log(`Updated ${email} -> super_admin`);
  } else {
    await UserModel.create({ email, password: hashed, role: "super_admin" });
    console.log(`Created super admin ${email}`);
  }
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
