import mongoose from "mongoose";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";

export const MAX_CAPACITY = 1_000_000;
export const MAX_PRICE = 10_000_000;

export class TicketSyncError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "TicketSyncError";
    this.code = code;
    this.status = 400;
  }
}

const invalid = (message) => new TicketSyncError("INVALID_TICKET", message);

const nameKey = (name) => name.trim().replace(/\s+/g, " ").toLowerCase();

// Plain numbers or plain digit strings only. Number("") is 0, Number("0x10")
// is 16 and Number(null) is 0, so a bare Number() would accept all of those.
function parseNumber(value, pattern) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && pattern.test(value.trim())) return Number(value);
  return NaN;
}
const parsePrice = (value) => parseNumber(value, /^\d+(\.\d+)?$/);
const parseCapacity = (value) => parseNumber(value, /^\d+$/);

function parseActive(value, name) {
  if (value === undefined) return true;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw invalid(`"${name}" has an invalid active flag`);
}

// Seats already taken. Tickets stored without availableQuantity are treated
// as having sold nothing.
const soldOf = (ticket) =>
  ticket.totalQuantity - (ticket.availableQuantity ?? ticket.totalQuantity);

// Returns validated copies of the tiers. Nothing here touches the database.
function cleanTiers(rawTiers) {
  if (!Array.isArray(rawTiers)) throw invalid("Tickets must be a list");

  const tiers = rawTiers.map((raw) => {
    const name = typeof raw?.name === "string" ? raw.name.trim() : "";
    if (!name) throw invalid("Every ticket needs a name");

    const price = parsePrice(raw.price);
    if (!Number.isFinite(price) || price < 0 || price > MAX_PRICE) {
      throw invalid(`"${name}" needs a price between 0 and ${MAX_PRICE}`);
    }

    const capacity = parseCapacity(raw.capacity);
    if (!Number.isSafeInteger(capacity) || capacity < 0 || capacity > MAX_CAPACITY) {
      throw invalid(`"${name}" needs a whole-number capacity between 0 and ${MAX_CAPACITY}`);
    }

    if (raw.ticketId && !mongoose.Types.ObjectId.isValid(raw.ticketId)) {
      throw invalid(`"${name}" has an invalid ticket id`);
    }

    return {
      ticketId: raw.ticketId ? String(raw.ticketId) : undefined,
      name,
      price,
      capacity,
      isActive: parseActive(raw.isActive, name),
    };
  });

  const names = tiers.map((tier) => nameKey(tier.name));
  const repeated = names.findIndex((key, i) => names.indexOf(key) !== i);
  if (repeated !== -1) {
    throw new TicketSyncError(
      "DUPLICATE_TIER_NAME",
      `There is more than one "${tiers[repeated].name}" ticket`,
    );
  }
  return tiers;
}

const belowSold = (name, sold) =>
  new TicketSyncError(
    "CAPACITY_BELOW_SOLD",
    `"${name}" capacity cannot be below the ${sold} already sold`,
  );

// Decides, from the tiers submitted and what is stored, which tickets to
// update and which to create. Throws before anything is written.
function planChanges(tiers, existing) {
  const byId = new Map(existing.map((t) => [t._id.toString(), t]));
  // Several documents can share a name (older drafts); prefer a live one.
  const liveFirst = [...existing].sort(
    (a, b) => Number(a.isActive === false) - Number(b.isActive === false),
  );
  const byName = new Map();
  liveFirst.forEach((doc) => {
    const key = nameKey(doc.name);
    if (!byName.has(key)) byName.set(key, doc);
  });

  const claimed = new Set();
  const updates = [];
  const inserts = [];

  for (const tier of tiers) {
    const target = tier.ticketId ? byId.get(tier.ticketId) : byName.get(nameKey(tier.name));

    if (tier.ticketId && !target) {
      throw new TicketSyncError(
        "TICKET_NOT_IN_EVENT",
        `"${tier.name}" does not belong to this event`,
      );
    }
    if (!target) {
      inserts.push(tier);
      continue;
    }

    const id = target._id.toString();
    if (claimed.has(id)) {
      throw new TicketSyncError(
        "DUPLICATE_TIER_NAME",
        `There is more than one "${tier.name}" ticket`,
      );
    }
    claimed.add(id);

    if (tier.capacity < soldOf(target)) throw belowSold(tier.name, soldOf(target));

    // A match by name only differs in case/spacing, so keep the stored
    // spelling. An explicit ticketId is a deliberate rename.
    const name = tier.ticketId ? tier.name : target.name;
    updates.push({ id: target._id, tier: { ...tier, name } });
  }

  return { updates, inserts };
}

const seatsTaken = {
  $subtract: ["$totalQuantity", { $ifNull: ["$availableQuantity", "$totalQuantity"] }],
};

// One atomic update per ticket. The filter only matches while the seats taken
// still fit the new capacity, so a purchase that landed after we read the
// ticket cannot be silently overwritten. Availability is recomputed from the
// values stored at that instant (new capacity minus seats taken).
// The native collection is used because Mongoose does not cast pipeline
// updates; every value here is validated above.
async function applyUpdate(eventObjectId, { id, tier }) {
  const result = await TicketModel.collection.updateOne(
    {
      _id: id,
      eventId: eventObjectId,
      $expr: { $lte: [seatsTaken, tier.capacity] },
    },
    [
      {
        $set: {
          name: tier.name,
          price: tier.price,
          isActive: tier.isActive,
          totalQuantity: tier.capacity,
          availableQuantity: { $max: [0, { $subtract: [tier.capacity, seatsTaken] }] },
        },
      },
    ],
  );
  if (result.matchedCount === 0) {
    throw new TicketSyncError(
      "CAPACITY_BELOW_SOLD",
      `"${tier.name}" capacity is now below the seats sold (purchases just came in). Reload and try again`,
    );
  }
}

// Tickets no longer in the form. Ones that never sold and have no order on
// record are deleted (they are autosave leftovers, e.g. "V", "VI" while typing
// "VIP"). Anything with sales or an order is only switched off, so history
// and live orders stay intact.
async function retireMissing(eventObjectId, keepIds) {
  const missing = await TicketModel.find({
    eventId: eventObjectId,
    _id: { $nin: keepIds },
  }).lean();

  const unsold = missing.filter((t) => soldOf(t) === 0).map((t) => t._id);
  const referenced = new Set(
    (await UserTicketModel.distinct("ticketId", { ticketId: { $in: unsold } })).map(String),
  );
  const deletable = unsold.filter((id) => !referenced.has(id.toString()));

  const deleted =
    deletable.length > 0
      ? (await TicketModel.deleteMany({ _id: { $in: deletable } })).deletedCount
      : 0;

  const deactivate = missing
    .filter((t) => t.isActive !== false && !deletable.some((id) => id.equals(t._id)))
    .map((t) => t._id);
  const deactivated =
    deactivate.length > 0
      ? (await TicketModel.updateMany({ _id: { $in: deactivate } }, { $set: { isActive: false } }))
          .modifiedCount
      : 0;

  return { deleted, deactivated };
}

// Makes an event's tickets match the submitted tiers.
//
//  - A tier with a ticketId updates that ticket (so renames keep their sales).
//  - A tier without one is matched to an existing ticket by name, otherwise
//    created. Matching by name is what keeps repeated saves (autosave) from
//    piling up duplicates.
//  - Capacity changes move availability by the same amount, and never go
//    below the seats already taken.
//  - With `deactivateMissing`, tickets not submitted are retired (see
//    retireMissing).
//
// Everything is validated before the first write, so a rejected submission
// changes nothing. If a purchase races the write and the capacity guard fails,
// that tier is left untouched and the call throws; tiers already written
// earlier in the same call stay written.
export async function syncEventTickets(eventId, rawTiers, { deactivateMissing = true } = {}) {
  const tiers = cleanTiers(rawTiers);
  const eventObjectId = new mongoose.Types.ObjectId(eventId);

  const existing = await TicketModel.find({ eventId: eventObjectId }).lean();
  const { updates, inserts } = planChanges(tiers, existing);

  for (const change of updates) {
    await applyUpdate(eventObjectId, change);
  }

  const created =
    inserts.length > 0
      ? await TicketModel.insertMany(
          inserts.map((tier) => ({
            eventId: eventObjectId,
            name: tier.name,
            price: tier.price,
            totalQuantity: tier.capacity,
            availableQuantity: tier.capacity,
            isActive: tier.isActive,
          })),
        )
      : [];

  const keepIds = [...updates.map((u) => u.id), ...created.map((t) => t._id)];
  const retired = deactivateMissing
    ? await retireMissing(eventObjectId, keepIds)
    : { deleted: 0, deactivated: 0 };

  return { created: created.length, updated: updates.length, ...retired };
}
