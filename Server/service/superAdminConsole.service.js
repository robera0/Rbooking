import mongoose from "mongoose";
import { Event } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { UserModel } from "../models/user.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { Payout } from "../models/payout.model.js";
import { ScanLog } from "../models/scanLog.model.js";
import { AuditLog } from "../models/auditLog.model.js";
import { getPlatformSetting } from "../models/platformSetting.model.js";
import { startOfToday } from "../utils/dateRange.js";
import { regexFor } from "../utils/pagination.js";
import AppError from "../errors/AppError.js";

const round2 = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round((parsed + Number.EPSILON) * 100) / 100;
};
const num = (value) => Number(value) || 0;
const id = (value) => (value ? String(value._id ?? value) : "");
const oid = (value) => new mongoose.Types.ObjectId(String(value));

// Null/undefined means "use the platform rate"; 0 is a legitimate override.
const rateOr = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const PAID = { status: "paid" };

/* ── shared lookup stages ─────────────────────────────────────────────── */

// Events store adminId as AdminProfile._id, but older events stored the
// User._id. Resolve either shape in one lookup.
const organizerLookupFor = (ref) => [
  {
    $lookup: {
      from: "adminprofiles",
      let: { adminRef: ref },
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                { $eq: ["$_id", "$$adminRef"] },
                { $eq: ["$userId", "$$adminRef"] },
              ],
            },
          },
        },
        { $limit: 1 },
        {
          $project: {
            organizationName: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            phone: 1,
            avatarUrl: 1,
            isVerified: 1,
            commissionRate: 1,
            userId: 1,
          },
        },
      ],
      as: "organizer",
    },
  },
  { $unwind: { path: "$organizer", preserveNullAndEmptyArrays: true } },
];

const buyerLookups = [
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "buyer",
    },
  },
  { $unwind: { path: "$buyer", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "userprofiles",
      localField: "userId",
      foreignField: "userId",
      as: "buyerProfile",
    },
  },
  { $unwind: { path: "$buyerProfile", preserveNullAndEmptyArrays: true } },
];

const orderLookups = [
  {
    $lookup: {
      from: "tickets",
      localField: "ticketId",
      foreignField: "_id",
      as: "tier",
    },
  },
  { $unwind: { path: "$tier", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "events",
      localField: "tier.eventId",
      foreignField: "_id",
      as: "event",
    },
  },
  { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
  ...organizerLookupFor("$event.adminId"),
  ...buyerLookups,
];

/* ── normalisers ──────────────────────────────────────────────────────── */

function normalizeEvent(row = {}) {
  return {
    id: id(row._id),
    name: row.name || "Untitled event",
    poster: row.pictures?.[0] || row.links?.venues?.pictures?.[0] || "",
    status: row.status || "draft",
    isFeatured: Boolean(row.isFeatured),
    type: row.type || "",
    startAt:
      row.dates?.start?.dateTime || row.dates?.start?.localDate || null,
    timezone: row.dates?.timezone || null,
    venue: row.links?.venues?.name || "",
    city: row.links?.venues?.city || "",
    capacity: num(row.capacity),
    available: num(row.available),
    sold: num(row.sold),
    gross: round2(row.gross),
    checkins: num(row.checkins),
    organizer: {
      id: id(row.organizer?._id),
      name: row.organizer?.organizationName || "Unknown organizer",
      email: row.organizer?.email || "",
    },
  };
}

function normalizeOrganizer(row = {}, commissionRate) {
  const gross = num(row.gross);
  const rate = rateOr(row.commissionRate, commissionRate);
  const commission = round2(gross * rate);
  const refunded = round2(row.refunded);
  const paidOut = round2(row.paidOut);
  return {
    id: id(row._id),
    organizationName: row.organizationName || "Unnamed organization",
    contactName:
      [row.firstName, row.lastName].filter(Boolean).join(" ") ||
      row.email ||
      "",
    email: row.email || row.user?.email || "",
    phone: row.phone || "",
    city: row.city || "",
    avatarUrl: row.avatarUrl || "",
    verified: Boolean(row.isVerified),
    userStatus: row.user?.status || "active",
    events: num(row.events),
    ticketsSold: num(row.sold),
    gross: round2(gross),
    commission,
    refunded,
    paidOut,
    balance: round2(gross - commission - refunded - paidOut),
    commissionRate: rateOr(row.commissionRate, null),
    joinedAt: row.createdAt || row.user?.createdAt || null,
  };
}

function normalizeOrder(row = {}) {
  return {
    id: id(row._id),
    orderNo: row.orderNo || "",
    status: row.status || "pending",
    quantity: num(row.quantity),
    amount: round2(row.totalAmount),
    isVerified: Boolean(row.isVerified),
    receiptUrl: row.receiptUrl || "",
    phone: row.phone || row.buyerProfile?.phone || "",
    referenceId: row.referenceId || "",
    purchasedAt: row.purchasedAt || row.createdAt || null,
    expiresAt: row.expiresAt || null,
    checkedIn: Boolean(row.checked?.checkedIn),
    checkedInAt: row.checked?.checkedInAt || null,
    buyer: {
      id: id(row.buyer?._id),
      name:
        row.buyerProfile?.fullName ||
        row.buyer?.email ||
        "Unknown buyer",
      email: row.buyer?.email || "",
      phone: row.phone || row.buyerProfile?.phone || "",
    },
    event: {
      id: id(row.event?._id),
      name: row.event?.name || "Deleted event",
      startAt:
        row.event?.dates?.start?.dateTime ||
        row.event?.dates?.start?.localDate ||
        null,
      timezone: row.event?.dates?.timezone || null,
    },
    organizer: {
      id: id(row.organizer?._id),
      name: row.organizer?.organizationName || "Unassigned",
    },
    tier: {
      id: id(row.tier?._id),
      name: row.tier?.name || row.ticketType || "Ticket",
      price: row.tier?.price ?? null,
    },
  };
}

function normalizeUser(row = {}) {
  return {
    id: id(row._id),
    email: row.email || "",
    role: row.role || "user",
    status: row.status || "active",
    fullName:
      row.profile?.fullName ||
      row.adminProfile?.organizationName ||
      row.email ||
      "Unnamed",
    phone: row.profile?.phone || row.adminProfile?.phone || "",
    organizationName: row.adminProfile?.organizationName || "",
    orders: num(row.orders),
    spend: round2(row.spend),
    joinedAt: row.createdAt || null,
    lastLoginAt: row.lastLoginAt || null,
    isProfileComplete: Boolean(row.isProfileComplete),
  };
}

/* ── overview ─────────────────────────────────────────────────────────── */

export async function getOverview({ from, to }) {
  const now = new Date();
  const expiringBefore = new Date(now.getTime() + 60 * 60 * 1000);
  const setting = await getPlatformSetting();
  const rate = Number(setting?.commissionRate ?? 0.1);
  const today = startOfToday();

  const [
    totalUsers,
    newUsers,
    totalOrganizers,
    pendingOrganizers,
    totalEvents,
    publishedEvents,
    draftEvents,
    paidOrders,
    pendingOrders,
    expiringSoon,
    checkinsToday,
    totalCheckins,
    revenueAgg,
    refundAgg,
    refundCount,
    payoutAgg,
    series,
    topEvents,
  ] = await Promise.all([
    UserModel.countDocuments({ role: "user", deletedAt: null }),
    UserModel.countDocuments({
      role: "user",
      deletedAt: null,
      createdAt: { $gte: from, $lt: to },
    }),
    AdminProfile.countDocuments({}),
    AdminProfile.countDocuments({ isVerified: { $ne: true } }),
    Event.countDocuments({ deletedAt: null }),
    Event.countDocuments({ deletedAt: null, status: "published" }),
    Event.countDocuments({ deletedAt: null, status: "draft" }),
    UserTicketModel.countDocuments(PAID),
    UserTicketModel.countDocuments({
      status: "pending",
      expiresAt: { $gt: now },
    }),
    UserTicketModel.countDocuments({
      status: "pending",
      expiresAt: { $gt: now, $lt: expiringBefore },
    }),
    UserTicketModel.countDocuments({
      "checked.checkedIn": true,
      "checked.checkedInAt": { $gte: today },
    }),
    UserTicketModel.countDocuments({ "checked.checkedIn": true }),
    UserTicketModel.aggregate([
      {
        $match: {
          status: "paid",
          purchasedAt: { $gte: from, $lt: to },
        },
      },
      {
        $group: {
          _id: null,
          gross: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          tickets: { $sum: "$quantity" },
        },
      },
    ]),
    UserTicketModel.aggregate([
      {
        $match: {
          status: "refunded",
          $or: [
            { refundedAt: { $gte: from, $lt: to } },
            {
              refundedAt: { $exists: false },
              updatedAt: { $gte: from, $lt: to },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          refunded: {
            $sum: { $ifNull: ["$refundAmount", "$totalAmount"] },
          },
        },
      },
    ]),
    UserTicketModel.countDocuments({
      status: "refunded",
      $or: [
        { refundedAt: { $gte: from, $lt: to } },
        {
          refundedAt: { $exists: false },
          updatedAt: { $gte: from, $lt: to },
        },
      ],
    }),
    Payout.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    UserTicketModel.aggregate([
      {
        $match: {
          status: "paid",
          purchasedAt: { $gte: from, $lt: to },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$purchasedAt",
              timezone: "Africa/Addis_Ababa",
            },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          tickets: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    UserTicketModel.aggregate([
      {
        $match: {
          status: "paid",
          purchasedAt: { $gte: from, $lt: to },
        },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "ticketId",
          foreignField: "_id",
          as: "tier",
        },
      },
      { $unwind: { path: "$tier", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "events",
          localField: "tier.eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$event._id",
          name: { $first: "$event.name" },
          revenue: { $sum: "$totalAmount" },
          tickets: { $sum: "$quantity" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const gross = round2(revenueAgg[0]?.gross);
  const refunded = round2(refundAgg[0]?.refunded);
  const commission = round2(gross * rate);
  const net = round2(gross - commission - refunded);
  const paidOut = round2(payoutAgg[0]?.total);

  const alerts = [];
  if (pendingOrganizers > 0) {
    alerts.push({
      type: "warning",
      message: `${pendingOrganizers} organizer${pendingOrganizers === 1 ? "" : "s"} awaiting verification`,
      href: "/organizers?verified=false",
    });
  }
  if (expiringSoon > 0) {
    alerts.push({
      type: "info",
      message: `${expiringSoon} pending order${expiringSoon === 1 ? "" : "s"} expiring within an hour`,
      href: "/orders?status=pending",
    });
  }
  if (refundCount > 0) {
    alerts.push({
      type: "danger",
      message: `${refundCount} refund${refundCount === 1 ? "" : "s"} in this period`,
      href: "/orders?status=refunded",
    });
  }

  return {
    range: { from, to },
    kpis: {
      users: { total: totalUsers, new: newUsers },
      organizers: { total: totalOrganizers, pending: pendingOrganizers },
      events: {
        total: totalEvents,
        published: publishedEvents,
        draft: draftEvents,
      },
      orders: {
        paid: paidOrders,
        pending: pendingOrders,
        expiringSoon,
        inRange: revenueAgg[0]?.orders || 0,
        tickets: revenueAgg[0]?.tickets || 0,
      },
      revenue: {
        gross,
        commission,
        net,
        refunded,
        paidOut,
        payoutDue: round2(net - paidOut),
        commissionRate: rate,
        currency: setting?.currency || "ETB",
      },
      checkins: { today: checkinsToday, total: totalCheckins },
    },
    revenueSeries: series.map((row) => ({
      date: row._id,
      revenue: round2(row.revenue),
      orders: row.orders,
      tickets: row.tickets,
    })),
    topEvents: topEvents.map((row) => ({
      id: id(row._id),
      name: row.name || "Deleted event",
      revenue: round2(row.revenue),
      tickets: row.tickets,
    })),
    alerts,
  };
}

/* ── events ───────────────────────────────────────────────────────────── */

export async function listEvents({
  q,
  status,
  organizerId,
  from,
  to,
  page,
  limit,
  sort,
}) {
  const skip = (page - 1) * limit;
  const baseMatch = { deletedAt: null };

  if (status) baseMatch.status = status;
  if (from || to) {
    baseMatch["dates.start.dateTime"] = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lt: to } : {}),
    };
  }

  if (organizerId) {
    const profile = await AdminProfile.findById(organizerId)
      .select("userId")
      .lean();
    const refs = [organizerId, profile?.userId]
      .filter(Boolean)
      .map((value) => oid(value));
    baseMatch.adminId = { $in: refs };
  }

  const sortMap = {
    "-createdAt": { createdAt: -1 },
    createdAt: { createdAt: 1 },
    name: { name: 1 },
    "-name": { name: -1 },
    startAt: { "dates.start.dateTime": 1 },
    "-startAt": { "dates.start.dateTime": -1 },
    "-gross": { gross: -1 },
    gross: { gross: 1 },
    "-sold": { sold: -1 },
    sold: { sold: 1 },
  };
  const sortStage = sortMap[sort] || sortMap["-createdAt"];

  const pipeline = [
    { $match: baseMatch },
    ...organizerLookupFor("$adminId"),
    {
      $lookup: {
        from: "tickets",
        localField: "_id",
        foreignField: "eventId",
        as: "tiers",
      },
    },
    {
      $lookup: {
        from: "usertickets",
        let: { tierIds: "$tiers._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$ticketId", "$$tierIds"] },
                  { $eq: ["$status", "paid"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              gross: { $sum: "$totalAmount" },
              sold: { $sum: "$quantity" },
              checkins: {
                $sum: { $cond: ["$checked.checkedIn", 1, 0] },
              },
            },
          },
        ],
        as: "orderStats",
      },
    },
    {
      $addFields: {
        capacity: { $sum: "$tiers.totalQuantity" },
        available: { $sum: "$tiers.availableQuantity" },
        sold: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.sold", 0] }, 0],
        },
        gross: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.gross", 0] }, 0],
        },
        checkins: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.checkins", 0] }, 0],
        },
      },
    },
  ];

  if (q) {
    const rx = regexFor(q);
    pipeline.push({
      $match: {
        $or: [
          { name: rx },
          { "links.venues.name": rx },
          { "links.venues.city": rx },
          { "organizer.organizationName": rx },
          { "organizer.firstName": rx },
          { "organizer.lastName": rx },
          { "organizer.email": rx },
        ],
      },
    });
  }

  pipeline.push({
    $facet: {
      rows: [
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            name: 1,
            pictures: 1,
            status: 1,
            isFeatured: 1,
            type: 1,
            dates: 1,
            links: 1,
            organizer: 1,
            capacity: 1,
            available: 1,
            sold: 1,
            gross: 1,
            checkins: 1,
          },
        },
      ],
      total: [{ $count: "count" }],
    },
  });

  const [result] = await Event.aggregate(pipeline);
  const rows = (result?.rows || []).map(normalizeEvent);
  return { rows, total: result?.total?.[0]?.count || 0 };
}

export async function getEventDetail(eventId) {
  const event = await Event.findOne({
    _id: oid(eventId),
    deletedAt: null,
  }).lean();
  if (!event) throw new AppError("Event not found", 404);

  const setting = await getPlatformSetting();
  const rate = Number(setting?.commissionRate ?? 0.1);

  const [organizer, tiers, tierStats, pendingAgg, recentOrders] =
    await Promise.all([
      AdminProfile.findOne({
        $or: [{ _id: event.adminId }, { userId: event.adminId }],
      }).lean(),
      TicketModel.find({ eventId: event._id }).lean(),
      UserTicketModel.aggregate([
        {
          $lookup: {
            from: "tickets",
            localField: "ticketId",
            foreignField: "_id",
            as: "tier",
          },
        },
        { $unwind: "$tier" },
        { $match: { "tier.eventId": event._id, status: "paid" } },
        {
          $group: {
            _id: "$ticketId",
            gross: { $sum: "$totalAmount" },
            sold: { $sum: "$quantity" },
            checkins: {
              $sum: { $cond: ["$checked.checkedIn", 1, 0] },
            },
          },
        },
      ]),
      UserTicketModel.aggregate([
        {
          $lookup: {
            from: "tickets",
            localField: "ticketId",
            foreignField: "_id",
            as: "tier",
          },
        },
        { $unwind: "$tier" },
        {
          $match: {
            "tier.eventId": event._id,
            status: "pending",
            expiresAt: { $gt: new Date() },
          },
        },
        { $count: "count" },
      ]),
      listOrders({ eventId: String(event._id), page: 1, limit: 8 }),
    ]);

  const statsByTier = new Map(
    tierStats.map((row) => [String(row._id), row]),
  );
  const normalizedTiers = tiers.map((tier) => {
    const stats = statsByTier.get(String(tier._id)) || {};
    return {
      id: String(tier._id),
      name: tier.name,
      price: tier.price,
      total: tier.totalQuantity,
      available: tier.availableQuantity,
      sold: num(stats.sold),
      gross: round2(stats.gross),
      checkins: num(stats.checkins),
      isActive: tier.isActive !== false,
    };
  });

  const capacity = normalizedTiers.reduce(
    (sum, tier) => sum + tier.total,
    0,
  );
  const sold = normalizedTiers.reduce((sum, tier) => sum + tier.sold, 0);
  const gross = round2(
    normalizedTiers.reduce((sum, tier) => sum + tier.gross, 0),
  );
  const checkins = normalizedTiers.reduce(
    (sum, tier) => sum + tier.checkins,
    0,
  );

  const normalized = normalizeEvent({
    ...event,
    capacity,
    available: normalizedTiers.reduce(
      (sum, tier) => sum + tier.available,
      0,
    ),
    sold,
    gross,
    checkins,
    organizer,
  });

  return {
    event: normalized,
    organizer: organizer
      ? {
          id: String(organizer._id),
          organizationName: organizer.organizationName || "",
          contactName: [organizer.firstName, organizer.lastName]
            .filter(Boolean)
            .join(" "),
          email: organizer.email || "",
          phone: organizer.phone || "",
          verified: Boolean(organizer.isVerified),
          city: organizer.city || "",
        }
      : null,
    tiers: normalizedTiers,
    stats: {
      capacity,
      sold,
      available: capacity - sold,
      gross,
      commission: round2(gross * rate),
      checkins,
      pending: pendingAgg[0]?.count || 0,
      commissionRate: rate,
    },
    recentOrders: recentOrders.rows,
  };
}

/* ── organizers ───────────────────────────────────────────────────────── */

export async function listOrganizers({
  q,
  verified,
  status,
  page,
  limit,
}) {
  const skip = (page - 1) * limit;
  const setting = await getPlatformSetting();
  const rate = Number(setting?.commissionRate ?? 0.1);

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "events",
        let: { profileId: "$_id", userId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $ifNull: ["$deletedAt", null] }, null] },
                  {
                    $or: [
                      { $eq: ["$adminId", "$$profileId"] },
                      { $eq: ["$adminId", "$$userId"] },
                    ],
                  },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "events",
      },
    },
    {
      $lookup: {
        from: "tickets",
        let: { eventIds: "$events._id" },
        pipeline: [
          { $match: { $expr: { $in: ["$eventId", "$$eventIds"] } } },
          { $project: { _id: 1 } },
        ],
        as: "tiers",
      },
    },
    {
      $lookup: {
        from: "usertickets",
        let: { tierIds: "$tiers._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$ticketId", "$$tierIds"] },
                  { $eq: ["$status", "paid"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              gross: { $sum: "$totalAmount" },
              sold: { $sum: "$quantity" },
            },
          },
        ],
        as: "orderStats",
      },
    },
    {
      $lookup: {
        from: "usertickets",
        let: { tierIds: "$tiers._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$ticketId", "$$tierIds"] },
                  { $eq: ["$status", "refunded"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              refunded: {
                $sum: { $ifNull: ["$refundAmount", "$totalAmount"] },
              },
            },
          },
        ],
        as: "refundStats",
      },
    },
    {
      $lookup: {
        from: "payouts",
        localField: "_id",
        foreignField: "organizerId",
        pipeline: [
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ],
        as: "payoutStats",
      },
    },
    {
      $addFields: {
        eventsCount: { $size: "$events" },
        gross: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.gross", 0] }, 0],
        },
        sold: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.sold", 0] }, 0],
        },
        refunded: {
          $ifNull: [{ $arrayElemAt: ["$refundStats.refunded", 0] }, 0],
        },
        paidOut: {
          $ifNull: [{ $arrayElemAt: ["$payoutStats.total", 0] }, 0],
        },
      },
    },
  ];

  const match = {};
  if (typeof verified === "boolean") match.isVerified = verified;
  if (status) match["user.status"] = status;
  if (q) {
    const rx = regexFor(q);
    match.$or = [
      { organizationName: rx },
      { firstName: rx },
      { lastName: rx },
      { email: rx },
      { phone: rx },
      { "user.email": rx },
    ];
  }
  if (Object.keys(match).length) pipeline.push({ $match: match });

  pipeline.push({
    $facet: {
      rows: [
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            organizationName: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            phone: 1,
            city: 1,
            avatarUrl: 1,
            isVerified: 1,
            commissionRate: 1,
            createdAt: 1,
            user: 1,
            events: "$eventsCount",
            sold: 1,
            gross: 1,
            refunded: 1,
            paidOut: 1,
          },
        },
      ],
      total: [{ $count: "count" }],
    },
  });

  const [result] = await AdminProfile.aggregate(pipeline);
  return {
    rows: (result?.rows || []).map((row) =>
      normalizeOrganizer(row, rate),
    ),
    total: result?.total?.[0]?.count || 0,
  };
}

export async function getOrganizerDetail(adminId) {
  const profile = await AdminProfile.findById(adminId).lean();
  if (!profile) throw new AppError("Organizer not found", 404);

  const [user, setting, events, recentOrders] = await Promise.all([
    UserModel.findById(profile.userId)
      .select("email role status createdAt lastLoginAt")
      .lean(),
    getPlatformSetting(),
    Event.find({
      $or: [{ adminId: profile._id }, { adminId: profile.userId }],
      deletedAt: null,
    })
      .select("_id name status pictures dates links")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    listOrders({ organizerId: String(profile._id), page: 1, limit: 8 }),
  ]);

  const rate = Number(setting?.commissionRate ?? 0.1);
  const eventIds = events.map((event) => event._id);
  const tiers = eventIds.length
    ? await TicketModel.find({ eventId: { $in: eventIds } })
        .select("_id")
        .lean()
    : [];
  const tierIds = tiers.map((tier) => tier._id);

  const [orderStats, refundStats, payoutStats, payouts] = await Promise.all([
    tierIds.length
      ? UserTicketModel.aggregate([
          {
            $match: {
              ticketId: { $in: tierIds },
              status: "paid",
            },
          },
          {
            $group: {
              _id: null,
              gross: { $sum: "$totalAmount" },
              sold: { $sum: "$quantity" },
              checkins: {
                $sum: { $cond: ["$checked.checkedIn", 1, 0] },
              },
              orders: { $sum: 1 },
            },
          },
        ])
      : [],
    tierIds.length
      ? UserTicketModel.aggregate([
          {
            $match: {
              ticketId: { $in: tierIds },
              status: "refunded",
            },
          },
          {
            $group: {
              _id: null,
              refunded: {
                $sum: { $ifNull: ["$refundAmount", "$totalAmount"] },
              },
              count: { $sum: 1 },
            },
          },
        ])
      : [],
    Payout.aggregate([
      { $match: { organizerId: profile._id, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payout.find({ organizerId: profile._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  const gross = round2(orderStats[0]?.gross);
  const refunded = round2(refundStats[0]?.refunded);
  const commission = round2(gross * rateOr(profile.commissionRate, rate));
  const paidOut = round2(payoutStats[0]?.total);

  return {
    organizer: {
      id: String(profile._id),
      organizationName: profile.organizationName || "",
      contactName: [profile.firstName, profile.lastName]
        .filter(Boolean)
        .join(" "),
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || user?.email || "",
      phone: profile.phone || "",
      city: profile.city || "",
      region: profile.region || "",
      country: profile.country || "",
      address: profile.streetAddress || "",
      businessType: profile.businessType || "",
      avatarUrl: profile.avatarUrl || "",
      coverPage: profile.coverPage || "",
      verified: Boolean(profile.isVerified),
      verifiedAt: profile.verifiedAt || null,
      verificationNote: profile.verificationNote || "",
      rejectionReason: profile.rejectionReason || "",
      commissionRate: rateOr(profile.commissionRate, null),
      userStatus: user?.status || "active",
      userEmail: user?.email || "",
      joinedAt: profile.createdAt || user?.createdAt || null,
      lastLoginAt: user?.lastLoginAt || null,
      documents: {
        idDocument: profile.idDocument || "",
        businessLicense: profile.businessLicense || "",
        companyLogo: profile.companyLogo || "",
        coverPage: profile.coverPage || "",
      },
      paymentMethods: (profile.paymentMethods || []).map((method) => ({
        provider: method.provider || "",
        accountNumber: method.accountNumber || "",
        receiverName: method.receiverName || "",
      })),
    },
    stats: {
      events: events.length,
      ticketsSold: num(orderStats[0]?.sold),
      orders: num(orderStats[0]?.orders),
      checkins: num(orderStats[0]?.checkins),
      gross,
      commission,
      refunded,
      refundCount: refundStats[0]?.count || 0,
      commissionRate: rateOr(profile.commissionRate, rate),
      paidOut,
      balance: round2(gross - commission - refunded - paidOut),
      currency: setting?.currency || "ETB",
    },
    recentEvents: events.slice(0, 8).map((event) => ({
      id: String(event._id),
      name: event.name || "Untitled event",
      status: event.status || "draft",
      poster:
        event.pictures?.[0] || event.links?.venues?.pictures?.[0] || "",
      startAt:
        event.dates?.start?.dateTime ||
        event.dates?.start?.localDate ||
        null,
      venue: event.links?.venues?.name || "",
    })),
    recentOrders: recentOrders.rows,
    payouts: payouts.map((payout) => ({
      id: String(payout._id),
      amount: round2(payout.amount),
      method: payout.method,
      reference: payout.reference || "",
      status: payout.status,
      note: payout.note || "",
      createdAt: payout.createdAt,
    })),
  };
}

/* ── users ────────────────────────────────────────────────────────────── */

export async function listUsers({ q, role, status, page, limit }) {
  const skip = (page - 1) * limit;
  const match = { deletedAt: null };
  if (role) match.role = role;
  if (status) match.status = status;

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "userprofiles",
        localField: "_id",
        foreignField: "userId",
        as: "profile",
      },
    },
    { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "adminprofiles",
        localField: "_id",
        foreignField: "userId",
        as: "adminProfile",
      },
    },
    {
      $unwind: {
        path: "$adminProfile",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "usertickets",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", "$$userId"] },
                  { $eq: ["$status", "paid"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              orders: { $sum: 1 },
              spend: { $sum: "$totalAmount" },
            },
          },
        ],
        as: "orderStats",
      },
    },
    {
      $addFields: {
        orders: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.orders", 0] }, 0],
        },
        spend: {
          $ifNull: [{ $arrayElemAt: ["$orderStats.spend", 0] }, 0],
        },
      },
    },
  ];

  if (q) {
    const rx = regexFor(q);
    pipeline.push({
      $match: {
        $or: [
          { email: rx },
          { "profile.fullName": rx },
          { "profile.phone": rx },
          { "adminProfile.organizationName": rx },
        ],
      },
    });
  }

  pipeline.push({
    $facet: {
      rows: [
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            email: 1,
            role: 1,
            status: 1,
            createdAt: 1,
            lastLoginAt: 1,
            isProfileComplete: 1,
            profile: 1,
            adminProfile: 1,
            orders: 1,
            spend: 1,
          },
        },
      ],
      total: [{ $count: "count" }],
    },
  });

  const [result] = await UserModel.aggregate(pipeline);
  return {
    rows: (result?.rows || []).map(normalizeUser),
    total: result?.total?.[0]?.count || 0,
  };
}

export async function getUserDetail(userId) {
  const user = await UserModel.findById(userId)
    .select("-password -refreshTokens")
    .lean();
  if (!user) throw new AppError("User not found", 404);

  const [profile, adminProfile, stats, recentOrders] = await Promise.all([
    ProfileModel.findOne({ userId: user._id }).lean(),
    AdminProfile.findOne({ userId: user._id }).lean(),
    UserTicketModel.aggregate([
      { $match: { userId: user._id, status: "paid" } },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          tickets: { $sum: "$quantity" },
          spend: { $sum: "$totalAmount" },
          checkins: {
            $sum: { $cond: ["$checked.checkedIn", 1, 0] },
          },
          firstPurchase: { $min: "$purchasedAt" },
          lastPurchase: { $max: "$purchasedAt" },
        },
      },
    ]),
    listOrders({ userId: String(user._id), page: 1, limit: 10 }),
  ]);

  const row = stats[0] || {};
  return {
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role,
      status: user.status,
      joinedAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || null,
      isProfileComplete: Boolean(user.isProfileComplete),
      fullName:
        profile?.fullName ||
        adminProfile?.organizationName ||
        user.email,
      phone: profile?.phone || adminProfile?.phone || "",
      city: profile?.address || adminProfile?.city || "",
      avatarUrl: profile?.avatarUrl || adminProfile?.avatarUrl || "",
      organizationName: adminProfile?.organizationName || "",
    },
    stats: {
      orders: num(row.orders),
      tickets: num(row.tickets),
      spend: round2(row.spend),
      checkins: num(row.checkins),
      firstPurchase: row.firstPurchase || null,
      lastPurchase: row.lastPurchase || null,
    },
    recentOrders: recentOrders.rows,
  };
}

/* ── orders ───────────────────────────────────────────────────────────── */

export async function listOrders({
  q,
  status,
  eventId,
  organizerId,
  userId,
  from,
  to,
  page,
  limit,
}) {
  const skip = (page - 1) * limit;
  const match = {};

  if (status) match.status = status;
  if (eventId) match["event._id"] = oid(eventId);
  if (userId) match.userId = oid(userId);
  if (from || to) {
    match.purchasedAt = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lt: to } : {}),
    };
  }
  if (organizerId) {
    const profile = await AdminProfile.findById(organizerId)
      .select("userId")
      .lean();
    const refs = [organizerId, profile?.userId]
      .filter(Boolean)
      .map((value) => oid(value));
    match["event.adminId"] = { $in: refs };
  }
  if (q) {
    const rx = regexFor(q);
    match.$or = [
      { orderNo: rx },
      { "buyer.email": rx },
      { "buyerProfile.fullName": rx },
      { "event.name": rx },
    ];
  }

  const pipeline = [
    ...orderLookups,
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    {
      $facet: {
        rows: [
          { $sort: { purchasedAt: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              orderNo: 1,
              status: 1,
              quantity: 1,
              totalAmount: 1,
              isVerified: 1,
              receiptUrl: 1,
              phone: 1,
              referenceId: 1,
              purchasedAt: 1,
              createdAt: 1,
              expiresAt: 1,
              checked: 1,
              buyer: 1,
              buyerProfile: 1,
              event: 1,
              organizer: 1,
              tier: 1,
              ticketType: 1,
            },
          },
        ],
        total: [{ $count: "count" }],
        sums: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: "$totalAmount" },
            },
          },
        ],
      },
    },
  ];

  const [result] = await UserTicketModel.aggregate(pipeline);
  return {
    rows: (result?.rows || []).map(normalizeOrder),
    total: result?.total?.[0]?.count || 0,
    totals: {
      count: result?.sums?.[0]?.count || 0,
      amount: round2(result?.sums?.[0]?.amount),
    },
  };
}

export async function getOrderDetail(orderId) {
  const [result] = await UserTicketModel.aggregate([
    { $match: { _id: oid(orderId) } },
    ...orderLookups,
    { $limit: 1 },
  ]);

  if (!result) throw new AppError("Order not found", 404);

  const timeline = await AuditLog.find({
    entityType: "order",
    $or: [{ entityId: String(orderId) }, { entityId: result.orderNo }],
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return {
    order: normalizeOrder(result),
    timeline: timeline.map((item) => ({
      id: String(item._id),
      action: item.action,
      message: item.message,
      actorEmail: item.actorEmail,
      createdAt: item.createdAt,
      metadata: item.metadata,
    })),
  };
}

/* ── scanner / activity ───────────────────────────────────────────────── */

export async function listScans({ limit = 20, eventId, result } = {}) {
  const filter = {};
  if (eventId) filter.eventId = oid(eventId);
  if (result) filter.result = result;
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const rows = await ScanLog.find(filter)
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return rows.map((row) => ({
    id: String(row._id),
    orderNo: row.orderNo || "",
    eventId: row.eventId ? String(row.eventId) : "",
    eventName: row.eventName || "",
    buyerName: row.buyerName || "",
    tierName: row.tierName || "",
    scannerEmail: row.scannerEmail || "",
    result: row.result,
    reason: row.reason || "",
    createdAt: row.createdAt,
  }));
}

export async function listAuditLogs({
  actor,
  action,
  entity,
  entityId,
  from,
  to,
  page,
  limit,
}) {
  const skip = (page - 1) * limit;
  const filter = {};
  if (action) filter.action = action;
  if (entity) filter.entityType = entity;
  if (entityId) filter.entityId = String(entityId);
  if (actor) filter.actorEmail = regexFor(actor);
  if (from || to) {
    filter.createdAt = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lt: to } : {}),
    };
  }

  const [rows, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    rows: rows.map((row) => ({
      id: String(row._id),
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      message: row.message,
      actorEmail: row.actorEmail,
      actorRole: row.actorRole,
      metadata: row.metadata,
      createdAt: row.createdAt,
    })),
    total,
  };
}

export async function getActivity({ limit = 20 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const audit = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  if (audit.length) {
    return audit.map((row) => ({
      id: String(row._id),
      type: "audit",
      action: row.action,
      message: row.message,
      actorEmail: row.actorEmail,
      createdAt: row.createdAt,
    }));
  }

  // Before any audit entries exist, recent scans are still useful activity.
  const scans = await ScanLog.find()
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();
  return scans.map((row) => ({
    id: String(row._id),
    type: "scan",
    action: `scan.${row.result}`,
    message: `${row.orderNo || "Code"} · ${row.buyerName || "Unknown"} · ${row.result}`,
    actorEmail: row.scannerEmail,
    createdAt: row.createdAt,
  }));
}

/* ── revenue ──────────────────────────────────────────────────────────── */

export async function getRevenue({ from, to }) {
  const setting = await getPlatformSetting();
  const rate = Number(setting?.commissionRate ?? 0.1);
  const now = new Date();

  const [paid, refunds, pending, payouts, series] = await Promise.all([
    UserTicketModel.aggregate([
      {
        $match: {
          status: "paid",
          purchasedAt: { $gte: from, $lt: to },
        },
      },
      {
        $group: {
          _id: null,
          gross: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          tickets: { $sum: "$quantity" },
        },
      },
    ]),
    UserTicketModel.aggregate([
      {
        $match: {
          status: "refunded",
          $or: [
            { refundedAt: { $gte: from, $lt: to } },
            {
              refundedAt: { $exists: false },
              updatedAt: { $gte: from, $lt: to },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          refunded: {
            $sum: { $ifNull: ["$refundAmount", "$totalAmount"] },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    UserTicketModel.aggregate([
      {
        $match: {
          status: "pending",
          expiresAt: { $gt: now },
        },
      },
      {
        $group: {
          _id: null,
          value: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Payout.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    UserTicketModel.aggregate([
      {
        $match: {
          status: "paid",
          purchasedAt: { $gte: from, $lt: to },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$purchasedAt",
              timezone: "Africa/Addis_Ababa",
            },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const gross = round2(paid[0]?.gross);
  const refunded = round2(refunds[0]?.refunded);
  const commission = round2(gross * rate);
  const net = round2(gross - commission - refunded);
  const paidOut = round2(payouts[0]?.total);

  return {
    range: { from, to },
    gross,
    commission,
    net,
    refunded,
    refundCount: refunds[0]?.count || 0,
    pending: {
      value: round2(pending[0]?.value),
      count: pending[0]?.count || 0,
    },
    paidOut,
    payoutDue: round2(net - paidOut),
    orders: paid[0]?.orders || 0,
    tickets: paid[0]?.tickets || 0,
    commissionRate: rate,
    currency: setting?.currency || "ETB",
    series: series.map((row) => ({
      date: row._id,
      revenue: round2(row.revenue),
      orders: row.orders,
    })),
  };
}

export async function getRevenueByOrganizer({ from, to }) {
  const setting = await getPlatformSetting();
  const rate = Number(setting?.commissionRate ?? 0.1);

  const [paid, refunds, payouts] = await Promise.all([
    UserTicketModel.aggregate([
      {
        $match: {
          status: "paid",
          purchasedAt: { $gte: from, $lt: to },
        },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "ticketId",
          foreignField: "_id",
          as: "tier",
        },
      },
      { $unwind: { path: "$tier", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "events",
          localField: "tier.eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      ...organizerLookupFor("$event.adminId"),
      {
        $group: {
          _id: "$organizer._id",
          name: { $first: "$organizer.organizationName" },
          email: { $first: "$organizer.email" },
          gross: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          tickets: { $sum: "$quantity" },
          commissionRate: { $first: "$organizer.commissionRate" },
        },
      },
      { $sort: { gross: -1 } },
    ]),
    UserTicketModel.aggregate([
      {
        $match: {
          status: "refunded",
          $or: [
            { refundedAt: { $gte: from, $lt: to } },
            {
              refundedAt: { $exists: false },
              updatedAt: { $gte: from, $lt: to },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "ticketId",
          foreignField: "_id",
          as: "tier",
        },
      },
      { $unwind: { path: "$tier", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "events",
          localField: "tier.eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      ...organizerLookupFor("$event.adminId"),
      {
        $group: {
          _id: "$organizer._id",
          refunded: {
            $sum: { $ifNull: ["$refundAmount", "$totalAmount"] },
          },
        },
      },
    ]),
    Payout.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$organizerId",
          paidOut: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const refundMap = new Map(
    refunds.map((row) => [String(row._id), num(row.refunded)]),
  );
  const payoutMap = new Map(
    payouts.map((row) => [String(row._id), num(row.paidOut)]),
  );

  return paid.map((row) => {
    const organizerId = String(row._id);
    const refunded = round2(refundMap.get(organizerId));
    const paidOut = round2(payoutMap.get(organizerId));
    const commissionRate = rateOr(row.commissionRate, rate);
    const gross = round2(row.gross);
    const commission = round2(gross * commissionRate);
    return {
      organizerId,
      name: row.name || "Unassigned",
      email: row.email || "",
      gross,
      commission,
      refunded,
      paidOut,
      balance: round2(gross - commission - refunded - paidOut),
      orders: row.orders,
      tickets: row.tickets,
      commissionRate,
    };
  });
}
