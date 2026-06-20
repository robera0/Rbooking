import catchAsync from "../errors/catchAsync.js";
import mongoose from "mongoose";
import redisClient, { clearTicketCache } from "../config/redis.js";
import TicketService from "../service/ticket.service.js";

export const getTickets = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const cacheKey = `user:ticket:list:${userId}`;

    const cachedTickets = await redisClient.smembers(cacheKey);

    if (cachedTickets && cachedTickets.length > 0) {
      const populatedTickets = await TicketService.find(userId);
      await redisClient.expire(cacheKey, 3600);
      return res.status(200).json({
        success: true,
        events: populatedTickets,
        source: "cache",
      });
    }
    const tickets = await TicketService.find(userId);

    const itemIdsToCache = (tickets || [])
      .map((item) => item?._id?.toString())
      .filter(Boolean);
    if (itemIdsToCache && itemIdsToCache.length > 0) {
      const pipeline = redisClient.pipeline();
      pipeline.sadd(cacheKey, ...itemIdsToCache);
      pipeline.expire(cacheKey, 3600);
      pipeline.exec();
    }
    res.status(200).json({ events: tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketsInfo = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const cacheKey = `user:ticket:list:${JSON.stringify(ticketId)}`;
    const cachedTickets = await redisClient.get(cacheKey);
    if (cachedTickets && cachedTickets.length > 0) {
      const populatedTicket = await TicketService.findById(ticketId);
      await redisClient.expire(cacheKey, 3600);
      return res.status(200).json({
        success: true,
        ticket: populatedTicket,
        source: "cache-hit",
      });
    }
    const ticket = await TicketService.findById(ticketId);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    await redisClient.setex(cacheKey, 3600, JSON.stringify(ticket));
    res.status(200).json({ ticket });
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
    await clearTicketCache(id);
    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* export const purchase_ticket = async (req, res) => {
  const session = await mongoose.startSession();
  console.log(session);
  session.startTransaction();

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user.id;

    const ticketId = req.params.ticketId;
    const { quantity } = req.body;
    const orderNo = `ORD-${new Date().toISOString()}-${Math.floor(Math.random() * 1000)}`;

    if (!ticketId)
      return res.status(400).json({ message: "Ticket ID required" });

    if (!quantity || quantity <= 0)
      return res.status(400).json({ message: "Invalid quantity" });

    const ticket = await TicketModel.findById(ticketId).session(session);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.availableQuantity < quantity)
      return res.status(400).json({ message: "Not enough tickets available" });

    const totalAmount = ticket.price * quantity;

    const userTicket = await UserTicketModel.create(
      [
        {
          userId,
          ticketId,
          orderNo,
          quantity,
          totalAmount,
          status: "pending",
        },
      ],
      { session },
    );

    ticket.availableQuantity -= quantity;
    await ticket.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      userTicket: userTicket[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};*/
