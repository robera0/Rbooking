import mongoose from "mongoose";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { Event } from "../models/events.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";

const sum = (items, pick) => items.reduce((total, item) => total + pick(item), 0);
const isActiveTier = (tier) => tier.isActive !== false;

/**
 * Money and ticket totals for a list of orders.
 * - tickets: tickets (not orders) on paid orders
 * - netRevenue: money on paid orders (refunded orders have their own status)
 * - refunded: money on refunded orders
 * - grossCollected: net plus refunded
 */
export function summarizeOrders(orders) {
  const paid = orders.filter((o) => o.status === "paid");
  const refundedOrders = orders.filter((o) => o.status === "refunded");
  const netRevenue = sum(paid, (o) => o.totalAmount);
  const refunded = sum(refundedOrders, (o) => o.totalAmount);
  return {
    tickets: sum(paid, (o) => o.quantity),
    grossCollected: netRevenue + refunded,
    refunded,
    netRevenue,
  };
}

/** Nothing left to buy in this ticket type. */
export const isTierSoldOut = (tier) => tier.availableQuantity <= 0;

/**
 * An event is sold out when every active ticket type is. While only some are
 * gone, those types are listed so the organizer can see them.
 */
export function eventSoldOut(tiers) {
  const active = tiers.filter(isActiveTier);
  if (active.length === 0) return { soldOut: false, soldOutTypes: [] };

  const soldOutTiers = active.filter(isTierSoldOut);
  if (soldOutTiers.length === active.length) {
    return { soldOut: true, soldOutTypes: [] };
  }
  return { soldOut: false, soldOutTypes: soldOutTiers.map((t) => t.name) };
}

const toObjectId = (id) =>
  id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);

// Paid and refunded orders grouped by ticket type and status.
// Each row: { _id: { ticketId, status }, quantity, amount }
const groupOrdersByTier = async (tierIds) =>
  tierIds.length === 0
    ? []
    : UserTicketModel.aggregate([
        {
          $match: {
            ticketId: { $in: tierIds },
            status: { $in: ["paid", "refunded"] },
          },
        },
        {
          $group: {
            _id: { ticketId: "$ticketId", status: "$status" },
            quantity: { $sum: "$quantity" },
            amount: { $sum: "$totalAmount" },
          },
        },
      ]);

const asOrders = (rows) =>
  rows.map((g) => ({ status: g._id.status, quantity: g.quantity, totalAmount: g.amount }));

// Paid orders grouped by who received the money and whether they were free.
// Each row: { quantity, totalAmount, orders, paidTo? } (see groupByTelebirr).
const groupPaidByReceiver = async (tierIds) => {
  if (tierIds.length === 0) return [];
  const grouped = await UserTicketModel.aggregate([
    { $match: { ticketId: { $in: tierIds }, status: "paid" } },
    {
      $group: {
        _id: {
          accountNumber: "$paidTo.accountNumber",
          receiverName: "$paidTo.receiverName",
          // Free orders have no receipt; keep them apart from older paid
          // orders that simply have no recorded number.
          free: { $eq: ["$totalAmount", 0] },
        },
        quantity: { $sum: "$quantity" },
        amount: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
  ]);
  return grouped.map((g) => ({
    quantity: g.quantity,
    totalAmount: g.amount,
    orders: g.orders,
    paidTo:
      g._id.accountNumber || g._id.receiverName
        ? { accountNumber: g._id.accountNumber ?? null, receiverName: g._id.receiverName ?? null }
        : undefined,
  }));
};

const EMPTY_SALES = {
  sold: 0,
  capacity: 0,
  soldOut: false,
  soldOutTypes: [],
  grossCollected: 0,
  refunded: 0,
  netRevenue: 0,
};

/**
 * Sales figures for several events at once: one query for their ticket
 * types, one aggregation over their paid and refunded orders.
 * Returns a Map keyed by the event id string.
 */
export async function salesByEvent(eventIds) {
  const ids = eventIds.map(toObjectId);
  const tiers = await TicketModel.find({ eventId: { $in: ids } }).lean();
  const tierIds = tiers.map((t) => t._id);

  const grouped = await groupOrdersByTier(tierIds);

  const eventOfTier = new Map(tiers.map((t) => [t._id.toString(), t.eventId.toString()]));

  return new Map(
    ids.map((id) => {
      const key = id.toString();
      const eventTiers = tiers.filter((t) => t.eventId.toString() === key);
      if (eventTiers.length === 0) return [key, EMPTY_SALES];

      const eventRows = grouped.filter((g) => eventOfTier.get(g._id.ticketId.toString()) === key);
      const summary = summarizeOrders(asOrders(eventRows));
      // Sold counts every type, so capacity must too: a turned-off type that
      // already sold stays in, one nobody bought stays out.
      const soldTierIds = new Set(
        eventRows.filter((g) => g._id.status === "paid").map((g) => g._id.ticketId.toString()),
      );
      const counted = eventTiers.filter((tier) => isActiveTier(tier) || soldTierIds.has(tier._id.toString()));

      return [
        key,
        {
          sold: summary.tickets,
          capacity: sum(counted, (tier) => tier.totalQuantity),
          ...eventSoldOut(eventTiers),
          grossCollected: summary.grossCollected,
          refunded: summary.refunded,
          netRevenue: summary.netRevenue,
        },
      ];
    }),
  );
}

/**
 * Sales for one of the organizer's events, or for all of them when no event id
 * is given. `adminScopeId` is the organizer's AdminProfile id (what events
 * store as adminId). An event that is not theirs behaves like a missing one:
 * `event` is null and every figure is zero.
 */
export async function salesBreakdown(adminScopeId, eventId) {
  const events = await Event.find({
    adminId: adminScopeId,
    ...(eventId ? { _id: toObjectId(eventId) } : {}),
  })
    .select("name")
    .lean();

  const eventIds = events.map((e) => e._id);
  const tiers = await TicketModel.find({ eventId: { $in: eventIds } }).lean();
  const tierIds = tiers.map((t) => t._id);
  const grouped = await groupOrdersByTier(tierIds);
  const profile = await AdminProfile.findById(adminScopeId).select("paymentMethods").lean();
  const byReceiver = await groupPaidByReceiver(tierIds);

  const rowsOf = (tier) =>
    grouped.filter((g) => g._id.ticketId.toString() === tier._id.toString());

  const byTicketType = tiers
    .map((tier) => {
      const summary = summarizeOrders(asOrders(rowsOf(tier)));
      return {
        ticketId: tier._id.toString(),
        name: tier.name,
        price: tier.price,
        sold: summary.tickets,
        left: tier.availableQuantity,
        capacity: tier.totalQuantity,
        revenue: summary.netRevenue,
        soldOut: isTierSoldOut(tier),
      };
    })
    // An inactive type nobody bought has nothing to report.
    .filter((row, index) => tiers[index].isActive !== false || row.sold > 0);

  return {
    event: eventId && events[0] ? { _id: events[0]._id.toString(), name: events[0].name } : null,
    totals: summarizeOrders(asOrders(grouped)),
    byTicketType,
    byTelebirr: withConfiguredNumbers(groupByTelebirr(byReceiver), profile?.paymentMethods),
  };
}

const ROW_ORDER = { number: 0, unassigned: 1, before_tracking: 2, free: 3 };

const sortTelebirrRows = (rows) =>
  [...rows].sort(
    (a, b) => ROW_ORDER[a.kind] - ROW_ORDER[b.kind] || b.amount - a.amount,
  );

const telebirrTarget = (row) => {
  const { paidTo } = row;
  if (paidTo?.accountNumber) {
    return {
      key: `number:${paidTo.accountNumber}`,
      kind: "number",
      accountNumber: paidTo.accountNumber,
      receiverName: paidTo.receiverName ?? null,
    };
  }
  if (paidTo?.receiverName) {
    return {
      key: `unassigned:${paidTo.receiverName}`,
      kind: "unassigned",
      accountNumber: null,
      receiverName: paidTo.receiverName,
    };
  }
  const free = Number(row.totalAmount) === 0;
  return {
    key: free ? "free" : "before_tracking",
    kind: free ? "free" : "before_tracking",
    accountNumber: null,
    receiverName: null,
  };
};

/**
 * Splits paid orders by the Telebirr number that received the money.
 * Each input row is one order, or several orders already added together when
 * it carries an `orders` count. Rows without a recorded number are either
 * free ("free") or were paid before numbers were recorded ("before_tracking");
 * two numbers sharing a holder name show as "unassigned".
 */
export function groupByTelebirr(rows) {
  const groups = rows.reduce((acc, row) => {
    const target = telebirrTarget(row);
    const orders = row.orders ?? 1;
    const prev = acc[target.key];
    return {
      ...acc,
      [target.key]: prev
        ? {
            ...prev,
            tickets: prev.tickets + row.quantity,
            orders: prev.orders + orders,
            amount: prev.amount + row.totalAmount,
          }
        : { ...target, tickets: row.quantity, orders, amount: row.totalAmount },
    };
  }, {});
  return sortTelebirrRows(Object.values(groups));
}

/** Makes sure every Telebirr number the organizer has set up appears, even with no sales. */
export function withConfiguredNumbers(rows, paymentMethods = []) {
  const shown = new Set(rows.filter((r) => r.kind === "number").map((r) => r.accountNumber));
  const missing = (paymentMethods || [])
    .filter(
      (pm) =>
        pm?.provider?.toLowerCase() === "telebirr" &&
        pm.accountNumber &&
        !shown.has(pm.accountNumber),
    )
    .map((pm) => ({
      key: `number:${pm.accountNumber}`,
      kind: "number",
      accountNumber: pm.accountNumber,
      receiverName: pm.receiverName ?? null,
      tickets: 0,
      orders: 0,
      amount: 0,
    }));
  return sortTelebirrRows([...rows, ...missing]);
}
