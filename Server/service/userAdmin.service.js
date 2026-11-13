import mongoose from "mongoose";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { hashPasswords } from "./password.js";

// What an organizer-level admin may do to other accounts. Super admin accounts
// can never be created, promoted to, edited or removed from here, and nobody
// can edit or remove their own account through these routes.
const ASSIGNABLE_ROLES = ["user", "admin", "club_owner"];
const STATUSES = ["active", "suspended", "banned"];
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

export class UserAdminError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "UserAdminError";
    this.status = status;
  }
}

const isId = (v) => typeof v === "string" && mongoose.Types.ObjectId.isValid(v);
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

export async function updateUserByAdmin(actorId, userId, { role, status } = {}) {
  if (!isId(userId)) throw new UserAdminError(400, "Invalid user id");
  if (role === undefined && status === undefined) throw new UserAdminError(400, "Nothing to update");
  if (String(userId) === String(actorId)) throw new UserAdminError(403, "You cannot change your own account here");
  if (role !== undefined && !ASSIGNABLE_ROLES.includes(role)) throw new UserAdminError(403, "You cannot assign that role");
  if (status !== undefined && !STATUSES.includes(status)) throw new UserAdminError(400, "Invalid status");

  const target = await UserModel.findById(userId).select("role");
  if (!target) throw new UserAdminError(404, "User not found");
  if (target.role === "super_admin") throw new UserAdminError(403, "You cannot change a super admin");

  const set = {};
  if (role !== undefined) set.role = role;
  if (status !== undefined) set.status = status;
  return UserModel.findByIdAndUpdate(userId, { $set: set }, { new: true });
}

// Ids the actor may act on in bulk: valid, not themselves, not super admins.
async function actionableIds(actorId, ids) {
  if (!Array.isArray(ids)) throw new UserAdminError(400, "Invalid userIds payload");
  const valid = [...new Set(ids.filter(isId))].filter((id) => id !== String(actorId));
  if (valid.length === 0) return [];
  const users = await UserModel.find({ _id: { $in: valid }, role: { $ne: "super_admin" } }).select("_id").lean();
  return users.map((u) => u._id);
}

export async function suspendUsersByAdmin(actorId, ids) {
  const targets = await actionableIds(actorId, ids);
  if (targets.length === 0) return { affected: 0 };
  const r = await UserModel.updateMany({ _id: { $in: targets } }, { $set: { status: "suspended" } });
  return { affected: r.modifiedCount };
}

export async function deleteUsersByAdmin(actorId, ids) {
  const targets = await actionableIds(actorId, ids);
  if (targets.length === 0) return { affected: 0 };
  const r = await UserModel.deleteMany({ _id: { $in: targets } });
  return { affected: r.deletedCount };
}
