import catchAsync from "../errors/catchAsync.js";
import mongoose from "mongoose";
import redisClient, {
  clearTicketCache,
  clearTicketInfoCache,
  safeGet,
  safeRedis,
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
import { amountsMatch } from "../utils/amount.js";
import { logVerificationFailure } from "../service/verificationLog.service.js";
import EventService from "../service/event.service.js";
import {
  checkInInvitation,
  InvitationError,
} from "../service/invitation.service.js";
import {
  getExpectedReceiver,
  nameMatches,
} from "../service/receiver.service.js";

export const purchaseTicket = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const userId = req.user.id;
  const { ticketId } = req.params;
  const { quantity, phone } = req.body;
  if (!ticketId) return res.status(400).json({ message: "Ticket ID required" });
  if (!quantity || quantity <= 0)
    return res.status(400).json({ message: "Invalid quantity" });

  try {
    const ticket = await TicketModel.findOneAndUpdate(
      {
        _id: ticketId,
        availableQuantity: { $gte: quantity },
        isActive: { $ne: false },
      },
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
      _id: userTicketId,
      userId,
      ticketId,
      ticketType: ticket.name,
      quantity,
      orderNo,
      isVerified: isFree ? true : false,
      totalAmount,
      qrCode,
      phone: phone || "",
      status: isFree ? "paid" : "pending",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
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

    const cachedRaw = await safeGet(cacheKey);
    if (cachedRaw) {
      await safeRedis(() => redisClient.expire(cacheKey, 3600));
      return res.status(200).json({
        success: true,
        events: JSON.parse(cachedRaw),
        source: "cache",
      });
    }

    const tickets = await TicketService.find(userId);

    if (tickets && tickets.length > 0) {
      await safeRedis(() => {
        const pipeline = redisClient.pipeline();
        pipeline.set(cacheKey, JSON.stringify(tickets));
        pipeline.expire(cacheKey, 3600);
        return pipeline.exec();
      });
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

    const cachedRaw = await safeGet(cacheKey);
    if (cachedRaw) {
      const cachedTicket = JSON.parse(cachedRaw);
      // Cached before qrCode existed/was backfilled - don't serve it stale.
      if (cachedTicket.qrCode) {
        await safeRedis(() => redisClient.expire(cacheKey, 3600));
        return res.status(200).json({
          success: true,
          ticket: cachedTicket,
          source: "cache",
        });
      }
    }

    let ticket = await TicketService.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Backfill: tickets purchased before qrCode was added to the schema
    // never got one persisted, so generate it now.
    if (!ticket.qrCode) {
      const qrPayload = JSON.stringify({
        userTicketId: ticket._id,
        token: ticket.orderNo,
      });
      const qrCode = await QRCode.toDataURL(qrPayload, {
        width: 600,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      await UserTicketModel.updateOne({ _id: ticket._id }, { qrCode });
      ticket = ticket.toObject ? ticket.toObject() : ticket;
      ticket.qrCode = qrCode;
    }

    await safeRedis(() =>
      redisClient.setex(cacheKey, 3600, JSON.stringify(ticket)),
    );

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
      safeRedis(() => redisClient.del(`${REDIS_PREFIX}user:ticket:info:${id}`)),
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

  let loggedTicket = null;
  const fail = async (status, reason, message, details) => {
    await logVerificationFailure({
      userId,
      userTicketId,
      receiptUrl,
      userTicket: loggedTicket,
      status,
      reason,
      message,
      details,
    });
    return res.status(status).json({ message });
  };

  if (!receiptUrl || !receiptUrl.trim())
    return fail(400, "MISSING_RECEIPT_URL", "Receipt link is required");

  // Basic validation: ensure it looks like a valid Telebirr receipt URL
  if (!receiptUrl.includes("ethiotelecom") && !receiptUrl.startsWith("http")) {
    return fail(400, "INVALID_LINK", "The link is not correct");
  }

  try {
    // Fetch the UserTicket and populate ticket tier (to get eventId)

    const userTicket = await UserTicketModel.findById(userTicketId).populate({
      path: "ticketId",
      select: "eventId name price",
    });

    if (!userTicket) return fail(404, "TICKET_NOT_FOUND", "Ticket not found");
    loggedTicket = userTicket;

    if (userTicket.userId.toString() !== userId)
      return fail(403, "NOT_TICKET_OWNER", "Unauthorized");

    if (userTicket.status === "paid")
      return fail(
        400,
        "ALREADY_VERIFIED",
        "This ticket has already been verified",
      );

    if (userTicket.status === "cancelled")
      return fail(400, "TICKET_CANCELLED", "This ticket was cancelled");

    const expected = await getExpectedReceiver(userTicket);
    if (expected.message) {
      return fail(
        expected.status,
        "RECEIVER_ACCOUNT_UNAVAILABLE",
        expected.message,
      );
    }
    const { eventInfo, adminProfile } = expected;
    const EXPECTED_RECEIVER = expected.receiverName;

    console.log(EXPECTED_RECEIVER, " and");

    // verification

    const TOTAL_AMOUNT = userTicket.totalAmount;

    const isValid = await verifyReceipt(receiptUrl);

    if (!isValid || isValid.error || !isValid.receipt) {
      return fail(
        400,
        "RECEIPT_LOOKUP_FAILED",
        isValid?.error || "Receipt verification failed or invalid URL",
        { providerResponse: isValid?.error ?? null },
      );
    }

    const receipt = isValid.receipt;

    if (receipt.transactionStatus !== "Completed") {
      return fail(
        400,
        "TRANSACTION_NOT_COMPLETED",
        "Transaction is not completed",
        { transactionStatus: receipt.transactionStatus },
      );
    }
    if (!nameMatches(receipt.creditedPartyName, EXPECTED_RECEIVER)) {
      return fail(
        400,
        "RECEIVER_NAME_MISMATCH",
        "Invalid receiver name on receipt",
        {
          expectedReceiver: EXPECTED_RECEIVER,
          receiptReceiver: receipt.creditedPartyName,
        },
      );
    }

    if (!amountsMatch(receipt.settledAmount, TOTAL_AMOUNT)) {
      return fail(
        400,
        "AMOUNT_MISMATCH",
        `Invalid amount. Expected ${TOTAL_AMOUNT}, but receipt shows ${receipt.settledAmount}`,
        { expectedAmount: TOTAL_AMOUNT, receiptAmount: receipt.settledAmount },
      );
    }

    if (!receipt.receiptNo) {
      return fail(
        400,
        "RECEIPT_NUMBER_MISSING",
        "Receipt number is missing from receipt data",
      );
    }

    const existingTicket = await UserTicketModel.findOne({
      referenceId: receipt.receiptNo,
    });

    if (existingTicket) {
      return fail(
        400,
        "RECEIPT_ALREADY_USED",
        "This receipt has already been used.",
        {
          receiptNo: receipt.receiptNo,
          usedByUserTicketId: existingTicket._id.toString(),
        },
      );
    }

    // Mark ticket as paid
    const updatedTicket = await UserTicketModel.findByIdAndUpdate(
      userTicketId,
      {
        status: "paid",
        isVerified: true,
        receiptUrl,
        referenceId: receipt.receiptNo,
      },
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
    await clearTicketInfoCache(userTicketId);

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
    // The unique index on referenceId is what makes receipt reuse atomic:
    // two concurrent verifications can both pass the findOne check above,
    // but only one update can win.
    if (error.code === 11000) {
      return fail(
        400,
        "RECEIPT_ALREADY_USED",
        "This receipt has already been used.",
        {
          race: true,
        },
      );
    }
    await logVerificationFailure({
      userId,
      userTicketId,
      receiptUrl,
      userTicket: loggedTicket,
      status: 500,
      reason: "SERVER_ERROR",
      message: error.message,
    });
    console.error("verifyTicket error:", error.message);
    console.error(error);
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
  if (!token) {
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
  // orderNo alone is unique and fully identifies the ticket - matching on
  // it is sufficient. (userTicketId from the QR payload is still required
  // above for basic format validation, but isn't used as a match filter:
  // tickets bought before a past bug fix have a QR-embedded userTicketId
  // that never matched the ticket's real _id, so requiring it here would
  // permanently lock those out of check-in.)
  const userTicket = await UserTicketModel.findOneAndUpdate(
    {
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

  // 2) Invitation
  try {
    const result = await checkInInvitation(token, scannerUserId);
    if (result?.status === "ok") {
      const { invitation } = result;
      return res.status(200).json({
        success: true,
        type: "invitation",
        message: "Valid invitation",
        invitation: {
          guestName: invitation.guestName,
          email: invitation.email,
          phone: invitation.phone,
          checkedInAt: invitation.checkedInAt,
        },
      });
    }
    if (result?.status === "used") {
      return res.status(409).json({
        success: false,
        message: "Invitation already used",
        guestName: result.invitation.guestName,
        scannedAt: result.invitation.checkedInAt,
      });
    }
    if (result?.status === "invalid") {
      return res
        .status(403)
        .json({ success: false, message: "Invitation is not valid" });
    }
  } catch (error) {
    if (error instanceof InvitationError) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    throw error;
  }
  // populate ticket details (name) for UI display
  if (userTicket) {
    await userTicket.populate({ path: "ticketId", select: "name" });
  }

  if (!userTicket) {
    const existing = await UserTicketModel.findOne({ orderNo: token }).populate(
      { path: "ticketId", select: "name" },
    );

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
  return res
    .status(200)
    .json({ success: true, message: "Checked in", userTicket });
});
