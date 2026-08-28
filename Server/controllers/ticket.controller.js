import catchAsync from "../errors/catchAsync.js";
import mongoose from "mongoose";
import redisClient, {
  clearTicketCache,
  REDIS_PREFIX,
} from "../config/redis.js";
import TicketService from "../service/ticket.service.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import Transaction from "../models/transaction.model.js";
import { nanoid } from "nanoid";
import verifyReceipt from "../service/verifyRecipt.service.js";
import { notificationModel } from "../models/notification.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { Event } from "../models/events.model.js";
import QRCode from "qrcode";

export const purchaseTicket = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const userId = req.user.id;
  const { ticketId, eventId } = req.params;
  const { quantity, phone } = req.body;
  const event = await EventService.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  if (!ticketId) return res.status(400).json({ message: "Ticket ID required" });
  if (!quantity || quantity <= 0)
    return res.status(400).json({ message: "Invalid quantity" });

  try {
    // Atomically check availability AND decrement in one operation.
    // $inc is atomic in MongoDB — no replica-set session needed.
    const ticket = await TicketModel.findOneAndUpdate(
      { _id: ticketId, availableQuantity: { $gte: quantity } },
      { $inc: { availableQuantity: -quantity } },
      { new: true },
    );

    if (!ticket) {
      // Either the ticket doesn't exist or there aren't enough seats
      const exists = await TicketModel.exists({ _id: ticketId });
      if (!exists) return res.status(404).json({ message: "Ticket not found" });
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const orderNo = `ORD-${nanoid(10)}`;
    const totalAmount = ticket.price * quantity;
    const isFree = totalAmount === 0;

    const userTicketId = new mongoose.Types.ObjectId();
    const qrPayload = JSON.stringify({
      userTicketId: userTicketId,
      token: orderNo,
    });

    const qrCode = await QRCode.toDataURL(qrPayload, {
      width: 600,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const userTicket = await UserTicketModel.create({
      userId,
      ticketId,
      quantity,
      orderNo,
      isVerified: isFree ? true : false,
      totalAmount,
      qrCode,
      phone: phone || "",
      status: isFree ? "verified" : "pending",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await clearTicketCache(userId);

    // Notify Admin of purchase
    try {
      const ticketDetails =
        await TicketModel.findById(ticketId).populate("eventId");
      if (
        ticketDetails &&
        ticketDetails.eventId &&
        ticketDetails.eventId.adminId
      ) {
        let adminProfile = await AdminProfile.findById(
          ticketDetails.eventId.adminId,
        );
        if (!adminProfile) {
          adminProfile = await AdminProfile.findOne({
            userId: ticketDetails.eventId.adminId,
          });
        }

        if (adminProfile && adminProfile.userId) {
          // Check Admin Settings
          const { AdminSettingsModel } =
            await import("../models/adminSettings.model.js");
          const adminSettings = await AdminSettingsModel.findOne({
            adminId: adminProfile.userId,
          });

          if (
            !adminSettings ||
            adminSettings.notifications?.adminAlerts?.newTicketPurchase !==
              false
          ) {
            await notificationModel.findOneAndUpdate(
              { userId: adminProfile.userId },
              {
                $push: {
                  notifications: {
                    $each: [
                      {
                        title: "New Ticket Purchase",
                        type: "payment",
                        message: `A new order (${orderNo}) has been placed for ${quantity} tickets for the event "${ticketDetails.eventId.name}".`,
                      },
                    ],
                    $position: 0,
                  },
                },
              },
              { upsert: true, new: true, runValidators: true },
            );
          }
        }
      }
    } catch (notifErr) {
      console.error("Error sending admin purchase notification:", notifErr);
    }

    res.status(201).json({ success: true, userTicket });
  } catch (error) {
    console.error("purchaseTicket error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const cacheKey = `${REDIS_PREFIX}user:ticket:list:${userId}`;

    const cachedRaw = await redisClient.get(cacheKey);
    if (cachedRaw) {
      await redisClient.expire(cacheKey, 3600);
      return res.status(200).json({
        success: true,
        events: JSON.parse(cachedRaw),
        source: "cache",
      });
    }

    const tickets = await TicketService.find(userId);

    if (tickets && tickets.length > 0) {
      const pipeline = redisClient.pipeline();
      pipeline.set(cacheKey, JSON.stringify(tickets));
      pipeline.expire(cacheKey, 3600);
      await pipeline.exec();
    }

    res.status(200).json({ success: true, events: tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketsInfo = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const cacheKey = `${REDIS_PREFIX}user:ticket:info:${ticketId}`;

    const cachedRaw = await redisClient.get(cacheKey);
    if (cachedRaw) {
      await redisClient.expire(cacheKey, 3600);
      return res.status(200).json({
        success: true,
        ticket: JSON.parse(cachedRaw),
        source: "cache",
      });
    }

    const ticket = await TicketService.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    await redisClient.setex(cacheKey, 3600, JSON.stringify(ticket));

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ["pending", "paid", "cancelled", "refunded"];
    if (!validStatus.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const ticket = await TicketService.findByIdAndUpdate(id, status);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    await Promise.all([
      clearTicketCache(ticket.userId),
      redisClient.del(`${REDIS_PREFIX}user:ticket:info:${id}`),
    ]);

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/auth/ticket/:userTicketId/verify
 * User submits their orderNo code to verify and confirm their ticket.
 * - Validates ownership + code match
 * - Updates status to "paid"
 * - Creates a Transaction record with isVerified: true
 */
export const verifyTicket = async (req, res) => {
  const { userTicketId } = req.params;
  const { receiptUrl } = req.body;

  const userId = req.user.id;

  const EXPECTED_RECEIVER = "Robera Ararsa Ulu";

  if (!receiptUrl || !receiptUrl.trim())
    return res.status(400).json({ message: "Receipt link is required" });

  // Basic validation: ensure it looks like a valid Telebirr receipt URL
  if (!receiptUrl.includes("ethiotelecom") && !receiptUrl.startsWith("http")) {
    return res.status(400).json({ message: "The link is not correct" });
  }

  try {
    // Fetch the UserTicket and populate ticket tier (to get eventId)
    const userTicket = await UserTicketModel.findById(userTicketId).populate({
      path: "ticketId",
      select: "eventId name price",
    });

    if (!userTicket)
      return res.status(404).json({ message: "Ticket not found" });

    if (userTicket.userId.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    if (userTicket.status === "paid")
      return res
        .status(400)
        .json({ message: "This ticket has already been verified" });

    if (userTicket.status === "cancelled")
      return res.status(400).json({ message: "This ticket was cancelled" });

    // verification
    const TOTAL_AMOUNT = userTicket.totalAmount;

    const isValid = await verifyReceipt(receiptUrl);

    if (!isValid || isValid.error || !isValid.receipt) {
      return res.status(400).json({
        message: isValid?.error || "Receipt verification failed or invalid URL",
      });
    }

    const receipt = isValid.receipt;
    const settledAmount = parseFloat(receipt.settledAmount);

    if (receipt.transactionStatus !== "Completed") {
      return res.status(400).json({ message: "Transaction is not completed" });
    }

    if (receipt.creditedPartyName !== EXPECTED_RECEIVER) {
      return res
        .status(400)
        .json({ message: "Invalid receiver name on receipt" });
    }

    if (settledAmount !== TOTAL_AMOUNT) {
      return res.status(400).json({
        message: `Invalid amount. Expected ${TOTAL_AMOUNT}, but receipt shows ${receipt.settledAmount}`,
      });
    }

    if (!receipt.receiptNo) {
      return res
        .status(400)
        .json({ message: "Receipt number is missing from receipt data" });
    }

    const existingTicket = await UserTicketModel.findOne({
      receiptNo: receipt.receiptNo,
    });
    if (existingTicket) {
      return res
        .status(400)
        .json({ message: "This receipt has already been used." });
    }
    // Mark ticket as paid
    const updatedTicket = await UserTicketModel.findByIdAndUpdate(
      userTicketId,
      { status: "paid", isVerified: true, receiptUrl },
      { new: true },
    ).populate({
      path: "ticketId",
      populate: {
        path: "eventId",
        model: "Event",
        select: "name type locale dates pictures",
      },
    });

    // Create the verified Transaction record
    await Transaction.create({
      user: userId,
      event: userTicket.ticketId.eventId,
      ticket: userTicketId,
      isVerified: true,
      receiptNo: receipt.receiptNo,
    });

    await clearTicketCache(userId);

    // Notify Admin of verification
    try {
      const eventInfo = await Event.findById(userTicket.ticketId.eventId);
      if (eventInfo && eventInfo.adminId) {
        let adminProfile = await AdminProfile.findById(eventInfo.adminId);
        if (!adminProfile) {
          adminProfile = await AdminProfile.findOne({
            userId: eventInfo.adminId,
          });
        }

        if (adminProfile && adminProfile.userId) {
          await notificationModel.findOneAndUpdate(
            { userId: adminProfile.userId },
            {
              $push: {
                notifications: {
                  $each: [
                    {
                      title: "Ticket Verified",
                      type: "payment",
                      message: `Order ${userTicket.orderNo} for the event "${eventInfo.name}" has been verified and marked as paid.`,
                    },
                  ],
                  $position: 0,
                },
              },
            },
            { upsert: true, new: true, runValidators: true },
          );
        }
      }
    } catch (notifErr) {
      console.error("Error sending admin verification notification:", notifErr);
    }

    res.status(200).json({
      success: true,
      message: "Ticket verified successfully!",
      userTicket: updatedTicket,
    });
  } catch (error) {
    console.error("verifyTicket error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scanTicket = catchAsync(async (req, res, next) => {
  const { userTicketId, token } = req.body;
  const scannerUserId = req.user.id;

  if (!userTicketId || !token) {
    return res.status(400).json({
      success: false,
      message: "Invalid QR payload format.",
    });
  }
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Gate staff access required." });
  }
  const userTicket = await UserTicketModel.findOneAndUpdate(
    {
      _id: userTicketId,
      orderNo: token,
      status: "paid",
      isVerified: true,
      "checked.checkedIn": false,
    },
    {
      $set: {
        "checked.checkedIn": true,
        "checked.checkedInAt": new Date(),
        "checked.checkedInBy": scannerUserId,
      },
    },
    { new: true },
  );

  if (!userTicket) {
    const existing = await UserTicketModel.findOne({ orderNo });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }
    if (existing.checked?.checkedIn) {
      return res.status(409).json({
        success: false,
        message: "Ticket already scanned",
        scannedAt: existing.checked.checkedInAt,
        scannedBy: existing.checked.checkedInBy,
      });
    }
    return res.status(403).json({
      success: false,
      message: `Ticket cannot be checked in (status: ${existing.status}, verified: ${existing.isVerified})`,
    });
  }

  res.status(200).json({ success: true, message: "Checked in", userTicket });
});
