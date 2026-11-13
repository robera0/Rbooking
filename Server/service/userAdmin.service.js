import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { hashPasswords } from "./password.js";

// Creating an account from the admin area: validated, password hashed, never
// a super admin. (Who may edit or remove accounts is decided in
// admin.controller.js.)
const ASSIGNABLE_ROLES = ["user", "admin", "club_owner"];
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

export class UserAdminError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "UserAdminError";
    this.status = status;
  }
}

const emailOk = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export async function createUserByAdmin(actorId, body = {}) {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailOk(email)) throw new UserAdminError(400, "Enter a valid email");

  const password = body.password;
  if (typeof password !== "string" || password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    throw new UserAdminError(400, `Password must be between ${MIN_PASSWORD} and ${MAX_PASSWORD} characters`);
  }

  const role = body.role === undefined ? "user" : body.role;
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new UserAdminError(403, "You cannot assign that role");
  }

  if (await UserModel.exists({ email })) throw new UserAdminError(400, "Email already exists");

  const user = await UserModel.create({
    email,
    password: await hashPasswords(password),
    role,
    status: "active",
  });

  try {
    const username =
      typeof body.username === "string" && body.username.trim()
        ? body.username.trim().slice(0, 60)
        : `user_${Date.now()}`;
    await ProfileModel.create({ userId: user._id, username, fullName: username });
  } catch (error) {
    await UserModel.deleteOne({ _id: user._id });
    throw error;
  }
  return user;
}
