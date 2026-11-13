import { AdminProfile } from "../models/adminProfile.model.js";
import { Event } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";

// True only for a MongoDB address on this machine (credentials allowed).
export const isLocalMongoUrl = (url) =>
  typeof url === "string" &&
  /^mongodb:\/\/(?:[^@/]*@)?(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:[/?]|$)/i.test(url);

const telebirrNumbers = (profile) =>
  (profile.paymentMethods || []).filter(
    (pm) =>
      pm?.provider?.toLowerCase() === "telebirr" && pm.accountNumber && pm.receiverName,
  );

// Orders paid before Telebirr numbers were recorded: paid, money was paid
// (free orders have no receipt), and nothing recorded yet.
const unrecordedPaidOrders = (tierIds) => ({
  ticketId: { $in: tierIds },
  status: "paid",
  totalAmount: { $gt: 0 },
  paidTo: { $exists: false },
});

async function backfillOrganizer(profile, apply) {
  const numbers = telebirrNumbers(profile);
  if (numbers.length !== 1) {
    return { skipped: numbers.length === 0 ? "none" : "multiple", matched: 0, updated: 0 };
  }

  const [number] = numbers;
  const eventIds = await Event.find({ adminId: profile._id }).distinct("_id");
  const tierIds = await TicketModel.find({ eventId: { $in: eventIds } }).distinct("_id");
  const filter = unrecordedPaidOrders(tierIds);

  const matched = await UserTicketModel.countDocuments(filter);
  const credited = { accountNumber: number.accountNumber, receiverName: number.receiverName, ordersMatched: matched };
  if (!apply || matched === 0) return { skipped: null, matched, updated: 0, credited };

  const { modifiedCount } = await UserTicketModel.updateMany(filter, {
    $set: {
      paidTo: {
        provider: "Telebirr",
        accountNumber: number.accountNumber,
        receiverName: number.receiverName ?? null,
      },
    },
  });
  return { skipped: null, matched, updated: modifiedCount, credited };
}

/**
 * For organizers with exactly one Telebirr number, every earlier paid order
 * with money must have gone to that number, so record it. Organizers with
 * several numbers (or none) are left alone: their old orders stay
 * "before tracking". Safe to run again; it never overwrites a recorded
 * number. With `apply` false it only reports what it would change.
 */
export async function backfillPaidTo({ apply = false } = {}) {
  const profiles = await AdminProfile.find({}).select("paymentMethods").lean();
  const results = [];
  for (const profile of profiles) {
    results.push(await backfillOrganizer(profile, apply));
  }

  return {
    organizersChecked: profiles.length,
    organizersSkippedMultiple: results.filter((r) => r.skipped === "multiple").length,
    organizersSkippedNone: results.filter((r) => r.skipped === "none").length,
    ordersMatched: results.reduce((n, r) => n + r.matched, 0),
    ordersUpdated: results.reduce((n, r) => n + r.updated, 0),
    // Which number each organizer's old payments would be credited to, so it
    // can be checked by hand before anything is written.
    organizers: results.filter((r) => r.credited && r.matched > 0).map((r) => r.credited),
  };
}
