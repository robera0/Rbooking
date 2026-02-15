import { UserTicketModel } from "../models/UserTicketModel.js";
import { TicketModel } from "../models/TicketModel.js";
import { nanoid } from "nanoid";

import mongoose from "mongoose";

export const purchase_ticket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: eventId, ticketId } = req.params;

    const { quantity } = req.body;

    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ message: "Valid Ticket ID required" });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // Find the ticket and make sure it belongs to the event
    const ticket = await TicketModel.findOne({ _id: ticketId, eventId });
    if (!ticket)
      return res
        .status(404)
        .json({ message: "Ticket not found for this event" });
    if (ticket.availableQuantity < quantity)
      return res.status(400).json({ message: "Not enough tickets available" });

    const totalAmount = ticket.price * quantity;

    // Check if user already has this ticket
    let userTicket = await UserTicketModel.findOne({ userId, ticketId });
    const orderNo = nanoid(10);
    if (userTicket) {
      // If exists, update quantity and totalAmount
      userTicket.quantity += quantity;
      userTicket.totalAmount += totalAmount;
      await userTicket.save();
    } else {
      userTicket = await UserTicketModel.create({
        userId,
        ticketId,
        orderNo,
        quantity,
        totalAmount,
        status: "pending",
      });
    }

    ticket.availableQuantity -= quantity;
    await ticket.save();

    res.status(201).json({
      success: true,
      userTicket,
    });
  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).json({ success: false, message: error.message });
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
