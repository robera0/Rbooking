import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestReplicaSet } from "./helpers/testReplicaSet.js";

process.env.ACCESS_TOKEN_SECRET ||= "test-access-secret";
process.env.REFRESH_TOKEN_SECRET ||= "test-refresh-secret";

const { registerAdmin } = await import("../controllers/auth.controller.js");
const { default: redisClient } = await import("../config/redis.js");
const { UserModel } = await import("../models/user.model.js");
const { AdminProfile } = await import("../models/adminProfile.model.js");

let mongo;
before(async () => {
  mongo = await startTestReplicaSet();
  // Create the collections and their indexes up front. Otherwise the first
  // transaction races Mongoose's background index build for a lock.
  await Promise.all([UserModel.init(), AdminProfile.init()]);
});
after(async () => {
  redisClient.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  await Promise.all([UserModel.deleteMany({}), AdminProfile.deleteMany({})]);
});

const body = (overrides = {}) => ({
  firstName: "Reg",
  lastName: "Test",
  email: "Reg-Test@Example.com",
  password: "Passw0rd123",
  phone: "0911000000",
  organizationName: "Reg Events",
  businessType: "Event Organizer",
  paymentMethods: JSON.stringify([
    { provider: "Telebirr", accountNumber: "0911000000", receiverName: "Reg" },
  ]),
  ...overrides,
});

const register = async (fields) => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    cookie() {
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  await registerAdmin({ body: fields, file: undefined }, res);
  return res;
};

test("a good registration creates the user and the organizer profile together", async () => {
  const res = await register(body());
  assert.equal(res.statusCode, 201);
  assert.equal(await UserModel.countDocuments({ email: "reg-test@example.com" }), 1);
  assert.equal(await AdminProfile.countDocuments({ email: "reg-test@example.com" }), 1);
});

test("when the profile step fails, no user is left behind and the email stays free", async () => {
  const failed = await register(body({ businessType: "Not A Real Type" }));
  assert.equal(failed.statusCode, 500);
  assert.equal(await UserModel.countDocuments({ email: "reg-test@example.com" }), 0);

  const retry = await register(body());
  assert.equal(retry.statusCode, 201);
});
