import EventService from "../service/event.service.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import UserService from "../service/user.service.js";
import catchAsync from "../errors/catchAsync.js";
import TicketService from "../service/ticket.service.js";
import mongoose from "mongoose";

// Events are created with `adminId` set to the admin's AdminProfile._id
// (see events.controller.js addEvent), not their User._id, so any query
// scoping data to "this admin" has to resolve that id first.
const resolveAdminScopeId = async (userId) => {
  const adminProfile = await AdminProfile.findOne({ userId });
  return adminProfile ? adminProfile._id : userId;
};

// Utility function to get dates
const getDateRanges = () => {
  const now = new Date();

  // Last 30 days
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Last 7 days
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  return { now, thirtyDaysAgo, sevenDaysAgo };
};

export const get_dashboard_stats = catchAsync(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const { thirtyDaysAgo, sevenDaysAgo } = getDateRanges();

  // 1. Total & New Users

  const totalUsers = await UserService.countDocuments({ role: "user" });
  const newRegistrations = await UserService.countDocuments({
    role: "user",
    createdAt: { $gte: sevenDaysAgo },
  });

  // 2. Events & Bookings - scoped to this admin's own events only
  const adminScopeId = await resolveAdminScopeId(userId);
  const adminEventIds = await EventService.find({
    adminId: adminScopeId,
  }).distinct("_id");
  const totalEvents = adminEventIds.length;

  const adminTicketIds = await TicketModel.find({
    eventId: { $in: adminEventIds },
  }).distinct("_id");

  const totalBookings = await UserTicketModel.countDocuments({
    status: "paid",
    ticketId: { $in: adminTicketIds },
  });
  const pendingApprovals = await UserTicketModel.countDocuments({
    status: "pending",
    ticketId: { $in: adminTicketIds },
  });

  // 3. Revenue Metrics
  // Aggregate total amount of this admin's 'paid' tickets
  const revenueAggr = await UserTicketModel.aggregate([
    { $match: { status: "paid", ticketId: { $in: adminTicketIds } } },
    { $group: { _id: null, totalEarnings: { $sum: "$totalAmount" } } },
  ]);

  // Aggregate revenue of last 30 days
  const recentRevenueAggr = await UserTicketModel.aggregate([
    {
      $match: {
        status: "paid",
        ticketId: { $in: adminTicketIds },
        purchasedAt: { $gte: thirtyDaysAgo },
      },
    },
    { $group: { _id: null, recentEarnings: { $sum: "$totalAmount" } } },
  ]);

  const totalEarnings =
    revenueAggr.length > 0 ? revenueAggr[0].totalEarnings : 0;
  const recentEarnings =
    recentRevenueAggr.length > 0 ? recentRevenueAggr[0].recentEarnings : 0;

  // Platform Commission Calculation (assuming 10% base rate)
  const COMMISSION_RATE = 0.1;
  const platformCommission = totalEarnings * COMMISSION_RATE;
  const recentCommission = recentEarnings * COMMISSION_RATE;

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        newLast7Days: newRegistrations,
      },
      bookings: {
        total: totalBookings,
        pending: pendingApprovals,
      },
      events: {
        total: totalEvents,
      },
      revenue: {
        totalEarnings,
        recentEarnings,
        platformCommission,
        recentCommission,
        commissionRate: COMMISSION_RATE,
      },
    },
  });
});
export const getEvents = catchAsync(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const adminScopeId = await resolveAdminScopeId(userId);

  const events = await EventService.find({ adminId: adminScopeId });
  res.status(200).json({ success: true, events: events });
});

export const getTransactionLedger = catchAsync(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const adminScopeId = await resolveAdminScopeId(userId);

  const transactions = await TicketService.findTickets(adminScopeId);

  res.status(200).json({ success: true, transactions: transactions });
});

export const get_transaction_by_id = catchAsync(async (req, res) => {
  const { id } = req.params;

  const transaction = await TicketService.findById(id);

  if (!transaction) {
    return res
      .status(404)
      .json({ success: false, message: "Transaction not found" });
  }

  const formattedTransaction = {
    ...transaction.toObject(),
    commissionAmount:
      transaction.status === "paid" ? transaction.totalAmount * 0.1 : 0,
  };

  res.status(200).json({ success: true, transaction: transaction });
});

export const get_revenue_history = catchAsync(async (req, res, next) => {
  // Aggregates revenue per month for the current year, scoped to this admin's own events
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const adminScopeId = await resolveAdminScopeId(userId);
  const adminEventIds = await EventService.find({
    adminId: adminScopeId,
  }).distinct("_id");
  const adminTicketIds = await TicketModel.find({
    eventId: { $in: adminEventIds },
  }).distinct("_id");

  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const historyAggr = await UserTicketModel.aggregate([
    {
      $match: {
        status: "paid",
        ticketId: { $in: adminTicketIds },
        purchasedAt: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$purchasedAt" } },
        totalRevenue: { $sum: "$totalAmount" },
        totalTickets: { $sum: "$quantity" },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  // Create default 12 month array
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formattedData = months.map((month, index) => {
    const found = historyAggr.find((h) => h._id.month === index + 1);
    return {
      name: month,
      revenue: found ? found.totalRevenue : 0,
      tickets: found ? found.totalTickets : 0,
    };
  });

  res.status(200).json({ success: true, history: formattedData });
});
