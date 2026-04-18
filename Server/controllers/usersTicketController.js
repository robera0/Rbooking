import { UserTicketModel } from "../models/UserTicketModel.js";
import { TicketModel } from "../models/TicketModel.js";
import mongoose from "mongoose";

export const purchase_ticket = async (req, res) => {
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
};

export const get_tickets = async (req, res) => {
  try {
    const userId = req.user.id;

    const tickets = await UserTicketModel.find({
      userId,
      status: "paid",
    }).populate({
      path: "ticketId",
      populate: {
        path: "eventId",
        model: "Event",
      },
    });

    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const get_tickets_info = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await UserTicketModel.findById(id).populate({
      path: "ticketId",
      populate: {
        path: "eventId",
        model: "Event",
      },
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const update_ticket_status = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ["pending", "paid", "cancelled", "refunded"];

    if (!validStatus.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const ticket = await UserTicketModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
