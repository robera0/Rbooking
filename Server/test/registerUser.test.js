import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestMongo } from "./helpers/testMongo.js";

const { register } = await import("../controllers/auth.controller.js");
const { default: UserService } = await import("../service/user.service.js");
const { default: redisClient } = await import("../config/redis.js");
const { UserModel } = await import("../models/user.model.js");
const { ProfileModel } = await import("../models/profile.model.js");

let mongo;
before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  redisClient.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  await Promise.all([UserModel.deleteMany({}), ProfileModel.deleteMany({})]);
});

// register is wrapped by catchAsync (no promise back), so wait for the
// controller to either answer or hand an error to next().
const signUp = (body) =>
  new Promise((resolve) => {
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        resolve({ res: this });
        return this;
      },
    };
    register({ body }, res, (error) => resolve({ error }));
  });

const details = (overrides = {}) => ({
  fullname: "Naod Arars",
  email: "buyer@example.com",
  password: "Passw0rd123",
  ...overrides,
});

test("creating a user from a single document saves exactly that user", async () => {
  const user = await UserService.create({ email: "one@example.com", password: "hashed", role: "user" });
  assert.equal(user.email, "one@example.com");
  assert.equal(await UserModel.countDocuments({}), 1);
});

test("signing up creates the user and a profile", async () => {
  const { res } = await signUp(details());
  assert.equal(res.statusCode, 201);
  assert.equal(await UserModel.countDocuments({ email: "buyer@example.com" }), 1);
  assert.equal(await ProfileModel.countDocuments({ fullName: "Naod Arars" }), 1);
});

test("an email that is already registered gets a clear 400, not a server error", async () => {
  await signUp(details());
  const { error } = await signUp(details());
  assert.equal(error.statusCode, 400);
  assert.equal(error.message, "Email already exists");
});

test("missing details get a clear 400", async () => {
  const { error } = await signUp(details({ password: undefined }));
  assert.equal(error.statusCode, 400);
  assert.equal(error.message, "Required fields are missing");
});

test("details that are not text are refused and nothing is saved", async () => {
  const { error } = await signUp(details({ fullname: { nested: "object" } }));
  assert.equal(error.statusCode, 400);
  assert.equal(await UserModel.countDocuments({}), 0);

  const { error: emailError } = await signUp(details({ email: { $ne: null } }));
  assert.equal(emailError.statusCode, 400);
});

test("if the profile cannot be saved the new user is removed, so the email stays free", async () => {
  const original = ProfileModel.create;
  ProfileModel.create = async () => {
    throw new Error("profile store unavailable");
  };
  try {
    const { error } = await signUp(details({ email: "second@example.com" }));
    assert.match(error.message, /profile store unavailable/);
  } finally {
    ProfileModel.create = original;
  }
  assert.equal(await UserModel.countDocuments({ email: "second@example.com" }), 0);

  const retry = await signUp(details({ email: "second@example.com" }));
  assert.equal(retry.res.statusCode, 201);
});
