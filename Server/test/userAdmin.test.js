import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestMongo } from "./helpers/testMongo.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { comparePassword } from "../service/password.js";
import {
  createUserByAdmin,
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
