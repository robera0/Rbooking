import catchAsync from "../errors/catchAsync.js";
import mongoose from "mongoose";
import redisClient, { clearTicketCache } from "../config/redis.js";
import TicketService from "../service/ticket.service.js";
import { nanoid } from "nanoid";

export const purchaseTicket = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user.id;
    const { ticketId } = req.params;
    const { quantity = 1 } = req.body;

    if (!ticketId)
      return res.status(400).json({ message: "Ticket ID required" });
    if (!quantity || quantity <= 0)
      return res.status(400).json({ message: "Invalid quantity" });

    const ticket = await TicketService.findTicketById(ticketId, session);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.availableQuantity < quantity)
      return res.status(400).json({ message: "Not enough tickets available" });

    const orderNo = `ORD-${nanoid(10)}`;
    const totalAmount = ticket.price * quantity;

    const userTicket = await TicketService.create(
      { userId, ticketId, orderNo, quantity, totalAmount, status: "pending" },
      session,
    );

    await TicketService.decrementQuantity(ticketId, quantity, session);

    await session.commitTransaction();
    session.endSession();

    await clearTicketCache(userId);

    res.status(201).json({ success: true, userTicket });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const cacheKey = `user:ticket:list:${userId}`;

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
    const cacheKey = `user:ticket:info:${ticketId}`; // fixed key (no JSON.stringify needed)

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
      redisClient.del(`user:ticket:info:${id}`),
    ]);

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
