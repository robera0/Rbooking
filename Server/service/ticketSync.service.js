import mongoose from "mongoose";
import { TicketModel } from "../models/ticket.model.js";

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

const toWholeNumber = (value) =>
  typeof value === "string" && value.trim() === "" ? NaN : Number(value);

// Returns validated copies of the tiers. Nothing here touches the database.
function cleanTiers(rawTiers) {
  if (!Array.isArray(rawTiers)) throw invalid("Tickets must be a list");

  const tiers = rawTiers.map((raw) => {
    const name = typeof raw?.name === "string" ? raw.name.trim() : "";
    const price = toWholeNumber(raw?.price);
    const capacity = toWholeNumber(raw?.capacity);

    if (!name) throw invalid("Every ticket needs a name");
    if (!Number.isFinite(price) || price < 0) {
      throw invalid(`"${name}" needs a price of 0 or more`);
    }
    if (!Number.isInteger(capacity) || capacity < 0) {
      throw invalid(`"${name}" needs a whole-number capacity of 0 or more`);
    }
    if (raw.ticketId && !mongoose.Types.ObjectId.isValid(raw.ticketId)) {
      throw invalid(`"${name}" has an invalid ticket id`);
    }

    return {
      ticketId: raw.ticketId ? String(raw.ticketId) : undefined,
      name,
      price,
      capacity,
      isActive: raw.isActive !== false,
    };
  });

  const seen = new Set();
  for (const tier of tiers) {
    const key = nameKey(tier.name);
    if (seen.has(key)) {
      throw new TicketSyncError(
        "DUPLICATE_TIER_NAME",
        `There is more than one "${tier.name}" ticket`,
      );
    }
    seen.add(key);
  }
  return tiers;
}

// Decides, from the tiers submitted and what is stored, which tickets to
// update and which to create. Throws before anything is written.
function planChanges(tiers, existing) {
  const byId = new Map(existing.map((t) => [t._id.toString(), t]));
  // Several documents can share a name (older drafts); prefer a live one.
  const byName = new Map();
  for (const doc of [...existing].sort((a, b) => Number(a.isActive === false) - Number(b.isActive === false))) {
    const key = nameKey(doc.name);
    if (!byName.has(key)) byName.set(key, doc);
  }

  const used = new Set();
  const updates = [];
  const inserts = [];

  for (const tier of tiers) {
    let target;
    if (tier.ticketId) {
      target = byId.get(tier.ticketId);
      if (!target) {
        throw new TicketSyncError(
          "TICKET_NOT_IN_EVENT",
          `"${tier.name}" does not belong to this event`,
        );
      }
    } else {
      target = byName.get(nameKey(tier.name));
    }

    if (!target) {
      inserts.push(tier);
      continue;
    }

    const id = target._id.toString();
    if (used.has(id)) {
      throw new TicketSyncError(
        "DUPLICATE_TIER_NAME",
        `There is more than one "${tier.name}" ticket`,
      );
    }
    used.add(id);

    const sold = target.totalQuantity - target.availableQuantity;
    if (tier.capacity < sold) {
      throw new TicketSyncError(
        "CAPACITY_BELOW_SOLD",
        `"${tier.name}" capacity cannot be below the ${sold} already sold`,
      );
    }
    updates.push({ id: target._id, tier });
  }

  return { updates, inserts };
}

// One atomic update per ticket. Availability is recomputed from the values
// stored at that instant (new capacity minus seats already taken), so a
// purchase landing at the same moment cannot be lost.
const updateOperation = (eventObjectId, { id, tier }) => ({
  updateOne: {
    filter: { _id: id, eventId: eventObjectId },
    update: [
      {
        $set: {
          name: tier.name,
          price: tier.price,
          isActive: tier.isActive,
          totalQuantity: tier.capacity,
          availableQuantity: {
            $max: [
              0,
              {
                $subtract: [
                  tier.capacity,
                  { $subtract: ["$totalQuantity", "$availableQuantity"] },
                ],
              },
            ],
          },
        },
      },
    ],
  },
});

// Makes an event's tickets match the submitted tiers.
//
//  - A tier with a ticketId updates that ticket (so renames keep their sales).
//  - A tier without one is matched to an existing ticket by name, otherwise
//    created. Matching by name is what keeps repeated saves (autosave) from
//    piling up duplicates.
//  - Capacity changes move availability by the same amount.
//  - With `deactivateMissing`, tickets not submitted are switched off.
//
// Everything is validated before the first write, so a rejected submission
// changes nothing.
export async function syncEventTickets(eventId, rawTiers, { deactivateMissing = true } = {}) {
  const tiers = cleanTiers(rawTiers);
  const eventObjectId = new mongoose.Types.ObjectId(eventId);

  const existing = await TicketModel.find({ eventId: eventObjectId }).lean();
  const { updates, inserts } = planChanges(tiers, existing);

  if (updates.length > 0) {
    await TicketModel.collection.bulkWrite(
      updates.map((change) => updateOperation(eventObjectId, change)),
    );
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

  let deactivated = 0;
  if (deactivateMissing) {
    const keep = [...updates.map((u) => u.id), ...created.map((t) => t._id)];
    const result = await TicketModel.updateMany(
      { eventId: eventObjectId, _id: { $nin: keep }, isActive: { $ne: false } },
      { $set: { isActive: false } },
    );
    deactivated = result.modifiedCount;
  }

  return { created: created.length, updated: updates.length, deactivated };
}
