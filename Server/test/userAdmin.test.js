import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { comparePassword } from "../service/password.js";
import {
  createUserByAdmin,
  updateUserByAdmin,
  deleteUsersByAdmin,
  suspendUsersByAdmin,
  UserAdminError,
} from "../service/userAdmin.service.js";

let mongo;
before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  await mongo.stop();
});
beforeEach(async () => {
  await Promise.all([UserModel.deleteMany({}), ProfileModel.deleteMany({})]);
});

const mk = (email, role = "user", status = "active") =>
  UserModel.create({ email, password: "x".repeat(20), role, status });

const refuses = (promise, status) =>
  assert.rejects(promise, (e) => e instanceof UserAdminError && e.status === status);

// ---- creating --------------------------------------------------------------

test("creates a user with a hashed password and a profile", async () => {
  const actor = await mk("org@x.com", "admin");
  const u = await createUserByAdmin(String(actor._id), {
    email: "New@X.com",
    password: "a-long-password",
    username: "newbie",
  });
  const stored = await UserModel.findById(u._id);
  assert.equal(stored.email, "new@x.com");
  assert.equal(stored.role, "user");
  assert.notEqual(stored.password, "a-long-password");
  assert.equal(await comparePassword("a-long-password", stored.password), true);
  assert.equal(await ProfileModel.countDocuments({ userId: u._id }), 1);
});

test("no default password, weak password or bad email", async () => {
  const actor = await mk("org@x.com", "admin");
  for (const body of [
    { email: "a@x.com" },
    { email: "a@x.com", password: "short" },
    { email: "not-an-email", password: "a-long-password" },
    { password: "a-long-password" },
  ]) {
    await refuses(createUserByAdmin(String(actor._id), body), 400);
  }
  assert.equal(await UserModel.countDocuments({ email: "a@x.com" }), 0);
});

test("an organizer cannot create a super admin (or any role above admin)", async () => {
  const actor = await mk("org@x.com", "admin");
  for (const role of ["super_admin", "root", 5]) {
    await refuses(createUserByAdmin(String(actor._id), { email: "s@x.com", password: "a-long-password", role }), 403);
  }
  assert.equal(await UserModel.countDocuments({ email: "s@x.com" }), 0);
});

test("duplicate email is refused", async () => {
  const actor = await mk("org@x.com", "admin");
  await mk("dup@x.com");
  await refuses(createUserByAdmin(String(actor._id), { email: "dup@x.com", password: "a-long-password" }), 400);
});

// ---- updating --------------------------------------------------------------

test("changes role and status of an ordinary user", async () => {
  const actor = await mk("org@x.com", "admin");
  const target = await mk("t@x.com");
  const u = await updateUserByAdmin(String(actor._id), String(target._id), { role: "admin", status: "suspended" });
  assert.equal(u.role, "admin");
  assert.equal(u.status, "suspended");
});

test("cannot promote to super admin, edit a super admin, or edit yourself", async () => {
  const actor = await mk("org@x.com", "admin");
  const target = await mk("t@x.com");
  const sup = await mk("sup@x.com", "super_admin");
  await refuses(updateUserByAdmin(String(actor._id), String(target._id), { role: "super_admin" }), 403);
  await refuses(updateUserByAdmin(String(actor._id), String(sup._id), { status: "banned" }), 403);
  await refuses(updateUserByAdmin(String(actor._id), String(actor._id), { role: "user" }), 403);
  assert.equal((await UserModel.findById(target._id)).role, "user");
  assert.equal((await UserModel.findById(sup._id)).status, "active");
});

test("invalid status, missing user and bad id", async () => {
  const actor = await mk("org@x.com", "admin");
  const target = await mk("t@x.com");
  await refuses(updateUserByAdmin(String(actor._id), String(target._id), { status: "deleted" }), 400);
  await refuses(updateUserByAdmin(String(actor._id), String(new mongoose.Types.ObjectId()), { status: "active" }), 404);
  await refuses(updateUserByAdmin(String(actor._id), "nope", { status: "active" }), 400);
  await refuses(updateUserByAdmin(String(actor._id), String(target._id), {}), 400);
});

// ---- bulk delete / suspend -------------------------------------------------

test("bulk delete and suspend skip super admins and yourself", async () => {
  const actor = await mk("org@x.com", "admin");
  const a = await mk("a@x.com");
  const b = await mk("b@x.com");
  const sup = await mk("sup@x.com", "super_admin");
  const ids = [a, b, sup, actor].map((u) => String(u._id));

  const s = await suspendUsersByAdmin(String(actor._id), ids);
  assert.equal(s.affected, 2);
  assert.equal((await UserModel.findById(sup._id)).status, "active");
  assert.equal((await UserModel.findById(actor._id)).status, "active");

  const d = await deleteUsersByAdmin(String(actor._id), ids);
  assert.equal(d.affected, 2);
  assert.equal(await UserModel.countDocuments({ _id: { $in: [sup._id, actor._id] } }), 2);
  assert.equal(await UserModel.countDocuments({ _id: { $in: [a._id, b._id] } }), 0);
});

test("bulk calls ignore junk ids", async () => {
  const actor = await mk("org@x.com", "admin");
  const r = await deleteUsersByAdmin(String(actor._id), ["nope", 5, null, {}]);
  assert.equal(r.affected, 0);
  await refuses(deleteUsersByAdmin(String(actor._id), "not-an-array"), 400);
});
