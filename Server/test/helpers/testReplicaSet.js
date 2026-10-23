import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";

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

// Like startTestMongo, but the throwaway server runs as a single-node replica
// set, which is what MongoDB needs before it allows transactions. Use it for
// code that calls session.startTransaction().
export async function startTestReplicaSet() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rbooking-rs-test-"));
  const port = await freePort();
  const child = spawn(
    "mongod",
    ["--dbpath", dir, "--port", String(port), "--bind_ip", "127.0.0.1", "--nounixsocket", "--replSet", "rsTest"],
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

  try {
    // Initiate the replica set over a direct connection, then wait for it to
    // elect itself primary.
    const direct = new MongoClient(`mongodb://127.0.0.1:${port}/?directConnection=true`, {
      serverSelectionTimeoutMS: 1000,
    });
    for (let attempt = 0; ; attempt++) {
      try {
        await direct.connect();
        break;
      } catch (error) {
        if (attempt >= 30) throw error;
        await sleep(500);
      }
    }
    await direct.db("admin").command({
      replSetInitiate: { _id: "rsTest", members: [{ _id: 0, host: `127.0.0.1:${port}` }] },
    });
    for (let attempt = 0; ; attempt++) {
      const hello = await direct.db("admin").command({ hello: 1 });
      if (hello.isWritablePrimary) break;
      if (attempt >= 40) throw new Error("replica set never became primary");
      await sleep(250);
    }
    await direct.close();

    await mongoose.connect(`mongodb://127.0.0.1:${port}/rbooking_test?replicaSet=rsTest`, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    await cleanup();
    throw error;
  }

  return { stop: cleanup };
}
