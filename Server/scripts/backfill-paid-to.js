// Records which Telebirr number received older paid orders, for organizers who
// have exactly one number. Run from the Server folder.
//
//   node scripts/backfill-paid-to.js                 dry run on the local database
//   node scripts/backfill-paid-to.js --apply         write the changes
//   BACKFILL_MONGO_URL="mongodb+srv://..." node scripts/backfill-paid-to.js --yes
//                                                    a non-local database
//
// Prefer BACKFILL_MONGO_URL over --uri for a remote database: a password typed
// on the command line shows up in shell history and the process list.
//
// Without --apply nothing is written. A database that is not on this machine
// is refused unless --yes is also given.
import mongoose from "mongoose";
import { backfillPaidTo, isLocalMongoUrl } from "../service/backfillPaidTo.service.js";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const valueOf = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const uri =
  valueOf("--uri") ||
  process.env.BACKFILL_MONGO_URL ||
  "mongodb://localhost:27017/TimeBooking";
const apply = flag("--apply");

if (!isLocalMongoUrl(uri) && !flag("--yes")) {
  console.error("That database is not on this machine. Add --yes to run it anyway.");
  process.exit(1);
}

await mongoose.connect(uri);
console.log(`${apply ? "APPLYING to" : "Dry run on"} ${mongoose.connection.host}/${mongoose.connection.name}`);

const { organizers, ...totals } = await backfillPaidTo({ apply });
console.log(totals);
console.log("Old paid orders are credited to these numbers (check each is right):");
organizers.forEach((o) =>
  console.log(`  ${o.accountNumber} (${o.receiverName}): ${o.ordersMatched} orders`),
);
if (!apply) console.log("Nothing was written. Run again with --apply to record the numbers.");

await mongoose.disconnect();
