import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import mongoose from "mongoose";

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Starts a throwaway local mongod in a temp folder and connects mongoose to
// it, so tests never touch a real database. Call stop() when done.
export async function startTestMongo() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rbooking-test-"));
  const port = await freePort();
  const child = spawn(
    "mongod",
    ["--dbpath", dir, "--port", String(port), "--bind_ip", "127.0.0.1", "--nounixsocket"],
    { stdio: "ignore" },
  );

  const cleanup = async () => {
    await mongoose.disconnect().catch(() => {});
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill("SIGTERM");
      await exited;
    }
    rmSync(dir, { recursive: true, force: true });
  };

  // A missing mongod binary shows up as an "error" event, not an exception.
  const spawnFailure = new Promise((_, reject) =>
    child.once("error", (error) =>
      reject(new Error(`Could not start mongod (is it installed?): ${error.message}`)),
    ),
  );

  const uri = `mongodb://127.0.0.1:${port}/rbooking_test`;
  const connect = async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 1000 });
        return;
      } catch (error) {
        if (attempt >= 30) throw error;
        await sleep(500);
      }
    }
  };

  try {
    await Promise.race([connect(), spawnFailure]);
  } catch (error) {
    await cleanup();
    throw error;
  }

  return { stop: cleanup };
}
