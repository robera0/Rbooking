import catchAsync from "../errors/catchAsync.js";
import mongoose from "mongoose";
import redisClient, { clearTicketCache, REDIS_PREFIX } from "../config/redis.js";
import TicketService from "../service/ticket.service.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import Transaction from "../models/transaction.model.js";
import { nanoid } from "nanoid";

export const purchaseTicket = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user.id;
    const { ticketId } = req.params;
    const { quantity, phone } = req.body;

    if (!ticketId)
      return res.status(400).json({ message: "Ticket ID required" });
    if (!quantity || quantity <= 0)
      return res.status(400).json({ message: "Invalid quantity" });

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

    const userTicket = await UserTicketModel.create({
      userId,
      ticketId,
      orderNo,
      quantity,
      totalAmount,
      phone: phone || "",
      status: "pending",
    });

    await clearTicketCache(userId);

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
  try {
    const { userTicketId } = req.params;
    const { receiptUrl } = req.body;

    const userId = req.user.id;

    if (!receiptUrl || !receiptUrl.trim())
      return res.status(400).json({ message: "Receipt link is required" });

    // Basic validation: ensure it looks like a valid Telebirr receipt URL
    if (!receiptUrl.includes("ethiotelecom") && !receiptUrl.startsWith("http")) {
      return res.status(400).json({ message: "The link is not correct" });
    }

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

    // Mark ticket as paid
    const updatedTicket = await UserTicketModel.findByIdAndUpdate(
      userTicketId,
      { status: "paid", receiptUrl },
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
    });

    await clearTicketCache(userId);

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
