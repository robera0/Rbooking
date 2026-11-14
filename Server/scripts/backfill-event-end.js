// Gives every event that has no end date an end a few days after its start.
//   node scripts/backfill-event-end.js                -> dry run: lists what would change
//   node scripts/backfill-event-end.js --apply        -> writes the changes
//   node scripts/backfill-event-end.js --days=7       -> end = start + 7 days (default 14)
// Uses the same database as the app (NEW_MONGO, else LOCAL_MONGO from .env), or
// SEED_MONGO_URL to point somewhere else. Events that already have an end are never touched.
import "dotenv/config";
import mongoose from "mongoose";
import { backfilledEnd, endNeedsBackfill } from "../utils/backfillEnd.js";

const url = process.env.SEED_MONGO_URL || process.env.NEW_MONGO || process.env.LOCAL_MONGO;
const apply = process.argv.includes("--apply");
const daysArg = process.argv.find((a) => a.startsWith("--days="));
const days = daysArg ? Number(daysArg.split("=")[1]) : 14;

if (!url) {
  console.error("No database set: define NEW_MONGO / LOCAL_MONGO in .env or SEED_MONGO_URL.");
  process.exit(1);
}
if (!Number.isFinite(days) || days < 1 || days > 60) {
  console.error("--days must be a number from 1 to 60.");
  process.exit(1);
}

try {
  await mongoose.connect(url, { serverSelectionTimeoutMS: 8000 });
  const events = mongoose.connection.db.collection("events");
  const rows = await events
    .find({ deletedAt: null, "dates.start.dateTime": { $exists: true } })
    .project({ name: 1, status: 1, dates: 1 })
    .toArray();

  const todo = rows.filter((e) => endNeedsBackfill(e.dates));
  console.log(`${rows.length} events checked, ${todo.length} have no end date.`);
  for (const e of todo) {
    const end = backfilledEnd(e.dates.start.dateTime, days);
    console.log(
      `${apply ? "SET " : "would set "} ${String(e.name).padEnd(40)} [${e.status}] start ${e.dates.start.dateTime.toISOString()} -> end ${end.dateTime.toISOString()}`,
    );
    if (apply) {
      // The filter repeats the "no end" check so an end saved a moment ago is never overwritten.
      await events.updateOne(
        { _id: e._id, "dates.end.dateTime": { $in: [null] } },
        { $set: { "dates.end": end } },
      );
    }
  }
  if (!apply && todo.length) console.log("\nDry run only. Re-run with --apply to save these.");
} catch (error) {
  console.error("Backfill failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
