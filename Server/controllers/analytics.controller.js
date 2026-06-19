import { Event } from "../models/events.model.js";
import { UserModel } from "../models/user.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";

// Utility function to get dates
const getDateRanges = () => {
  const now = new Date();

  // Last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  return { now, thirtyDaysAgo, sevenDaysAgo };
};

export const get_dashboard_stats = async (req, res) => {
  try {
    const { thirtyDaysAgo, sevenDaysAgo } = getDateRanges();

    // 1. Total & New Users
    const totalUsers = await UserModel.countDocuments({ role: "user" });
    const newRegistrations = await UserModel.countDocuments({
      role: "user",
      createdAt: { $gte: sevenDaysAgo },
    });

    // 2. Events & Bookings
    const totalEvents = await Event.countDocuments({});
    const totalBookings = await UserTicketModel.countDocuments();
    const pendingApprovals = await UserTicketModel.countDocuments({
      status: "pending",
    });

    // 3. Revenue Metrics
    // Aggregate total amount of all 'paid' tickets
    const revenueAggr = await UserTicketModel.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, totalEarnings: { $sum: "$totalAmount" } } },
    ]);

    // Aggregate revenue of last 30 days
    const recentRevenueAggr = await UserTicketModel.aggregate([
      { $match: { status: "paid", purchasedAt: { $gte: thirtyDaysAgo } } },
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
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const get_transaction_ledger = async (req, res) => {
  try {
    const transactions = await UserTicketModel.find()
      .populate("userId", "username email fullName")
      .populate("ticketId", "type price")
      .sort({ purchasedAt: -1 });

    const formattedTransactions = transactions.map((item) => ({
      ...item.toObject(),
      commissionAmount: item.status === "paid" ? item.totalAmount * 0.1 : 0,
    }));

    res
      .status(200)
      .json({ success: true, transactions: formattedTransactions });
  } catch (error) {
    console.error("Transaction Ledger Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const get_transaction_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await UserTicketModel.findById(id)
      .populate("userId", "username email fullName role")
      .populate({
        path: "ticketId",
        populate: {
          path: "eventId",
          model: "Event",
          select: "name type locale dates pictures",
        },
      });

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

    res.status(200).json({ success: true, transaction: formattedTransaction });
  } catch (error) {
    console.error("Fetch Transaction Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const get_revenue_history = async (req, res) => {
  try {
    // Aggregates revenue per month for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const historyAggr = await UserTicketModel.aggregate([
      {
        $match: {
          status: "paid",
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
  } catch (error) {
    console.error("Revenue History Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
