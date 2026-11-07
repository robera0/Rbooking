import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { startTestMongo } from "./helpers/testMongo.js";
import { UserModel } from "../models/user.model.js";
import { hashPasswords, comparePassword } from "../service/password.js";
import {
  requestPasswordReset,
  resetPasswordWithToken,
  PasswordResetError,
  RESET_TTL_MS,
  RESEND_COOLDOWN_MS,
} from "../service/passwordReset.service.js";

let mongo;
before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  await mongo.stop();
});
beforeEach(async () => {
  await UserModel.deleteMany({});
});

const CLIENT = "https://paysso.et";
const sha = (v) => crypto.createHash("sha256").update(v).digest("hex");

async function makeUser(extra = {}) {
  return UserModel.create({
    email: "uma@example.com",
    password: await hashPasswords("old-password-1"),
    refreshTokens: [{ token: "r1" }, { token: "r2" }],
    ...extra,
  });
}

// A fake mailer that records what it was asked to send.
const mailer = (fail = false) => {
  const sent = [];
  return {
    sent,
    send: async (msg) => {
      if (fail) throw new Error("smtp down");
      sent.push(msg);
    },
  };
};

const tokenFrom = (msg) => new URL(msg.url).searchParams.get("token");

// ---- requesting a reset ----------------------------------------------------

test("known user: one email with a reset link, token stored only as a hash", async () => {
  await makeUser();
  const m = mailer();
  const now = Date.now();
  const r = await requestPasswordReset("uma@example.com", { send: m.send, clientUrl: CLIENT, now });
  assert.equal(r.sent, true);
  assert.equal(m.sent.length, 1);
  assert.equal(m.sent[0].to, "uma@example.com");
  assert.ok(m.sent[0].url.startsWith(`${CLIENT}/reset-password?token=`));
  const token = tokenFrom(m.sent[0]);
  const user = await UserModel.findOne({ email: "uma@example.com" });
  assert.equal(user.resetToken, sha(token));
  assert.notEqual(user.resetToken, token);
  assert.equal(user.resetTokenExpires.getTime(), now + RESET_TTL_MS);
});

test("unknown email sends nothing and stores nothing", async () => {
  const m = mailer();
  const r = await requestPasswordReset("nobody@example.com", { send: m.send, clientUrl: CLIENT });
  assert.equal(r.sent, false);
  assert.equal(m.sent.length, 0);
});

test("email is trimmed and case-insensitive; junk input is ignored", async () => {
  await makeUser();
  const m = mailer();
  assert.equal((await requestPasswordReset("  UMA@Example.com ", { send: m.send, clientUrl: CLIENT })).sent, true);
  for (const bad of [undefined, null, "", "   ", 42, {}, "not-an-email"]) {
    assert.equal((await requestPasswordReset(bad, { send: m.send, clientUrl: CLIENT })).sent, false, String(bad));
  }
  assert.equal(m.sent.length, 1);
});

test("suspended and banned accounts get no reset email", async () => {
  for (const status of ["suspended", "banned"]) {
    await UserModel.deleteMany({});
    await makeUser({ status });
    const m = mailer();
    const r = await requestPasswordReset("uma@example.com", { send: m.send, clientUrl: CLIENT });
    assert.equal(r.sent, false, status);
    assert.equal(m.sent.length, 0, status);
  }
});

test("repeat requests inside the cooldown do not send again", async () => {
  await makeUser();
  const m = mailer();
  const t0 = Date.now();
  await requestPasswordReset("uma@example.com", { send: m.send, clientUrl: CLIENT, now: t0 });
  const again = await requestPasswordReset("uma@example.com", { send: m.send, clientUrl: CLIENT, now: t0 + 1000 });
  assert.equal(again.sent, false);
  assert.equal(m.sent.length, 1);
  const later = await requestPasswordReset("uma@example.com", {
    send: m.send, clientUrl: CLIENT, now: t0 + RESEND_COOLDOWN_MS + 1000,
  });
  assert.equal(later.sent, true);
  assert.equal(m.sent.length, 2);
});

test("a failed send clears the token and reports the error", async () => {
  await makeUser();
  const m = mailer(true);
  const r = await requestPasswordReset("uma@example.com", { send: m.send, clientUrl: CLIENT });
  assert.equal(r.sent, false);
  assert.equal(r.error, true);
  const user = await UserModel.findOne({ email: "uma@example.com" });
  assert.equal(user.resetToken, undefined);
  assert.equal(user.resetTokenExpires, undefined);
});

// ---- using the link --------------------------------------------------------

async function issueToken(now = Date.now()) {
  const m = mailer();
  await requestPasswordReset("uma@example.com", { send: m.send, clientUrl: CLIENT, now });
  return tokenFrom(m.sent[0]);
}

test("valid token sets the new password, clears the token and all sessions", async () => {
  await makeUser();
  const token = await issueToken();
  await resetPasswordWithToken(token, "brand-new-pass");
  const user = await UserModel.findOne({ email: "uma@example.com" });
  assert.equal(await comparePassword("brand-new-pass", user.password), true);
  assert.equal(await comparePassword("old-password-1", user.password), false);
  assert.equal(user.resetToken, undefined);
  assert.equal(user.refreshTokens.length, 0);
});

test("a token works only once", async () => {
  await makeUser();
  const token = await issueToken();
  await resetPasswordWithToken(token, "brand-new-pass");
  await assert.rejects(resetPasswordWithToken(token, "another-pass-1"), (e) => e instanceof PasswordResetError && e.status === 400);
  const user = await UserModel.findOne({ email: "uma@example.com" });
  assert.equal(await comparePassword("brand-new-pass", user.password), true);
});

test("ten simultaneous uses of one token succeed exactly once", async () => {
  await makeUser();
  const token = await issueToken();
  const results = await Promise.allSettled(
    Array.from({ length: 10 }, (_, i) => resetPasswordWithToken(token, `password-number-${i}`)),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
});

test("expired, wrong and malformed tokens are refused and change nothing", async () => {
  await makeUser();
  const token = await issueToken(Date.now() - RESET_TTL_MS - 1000);
  for (const t of [token, "deadbeef", "", undefined, null, 12, {}]) {
    await assert.rejects(resetPasswordWithToken(t, "brand-new-pass"), PasswordResetError, String(t));
  }
  const user = await UserModel.findOne({ email: "uma@example.com" });
  assert.equal(await comparePassword("old-password-1", user.password), true);
});

test("weak or absurd passwords are refused and the token stays usable", async () => {
  await makeUser();
  const token = await issueToken();
  for (const p of ["short", "", undefined, null, 12345678, "x".repeat(200)]) {
    await assert.rejects(resetPasswordWithToken(token, p), PasswordResetError, String(p));
  }
  await resetPasswordWithToken(token, "long-enough-1");
});

test("a banned user cannot use an older token", async () => {
  await makeUser();
  const token = await issueToken();
  await UserModel.updateOne({ email: "uma@example.com" }, { status: "banned" });
  await assert.rejects(resetPasswordWithToken(token, "brand-new-pass"), PasswordResetError);
});
