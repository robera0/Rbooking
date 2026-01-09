import { UserTicketModel } from "../models/UserTicketModel.js";
import { TicketModel } from "../models/TicketModel.js";
import mongoose from "mongoose";

export const get_tickets = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("userId", userId);
    const tickets = await UserTicketModel.find({ userId: userId }).populate({
      path: "ticketId",
      populate: {
        path: "eventId",
        model: "Event",
      },
    });
    console.log("ticket", tickets);

    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const get_tickets_info = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket_info = await UserTicketModel.find({
      ticketId,
    }).populate({
      path: "ticketId",
      populate: {
        path: "eventId",
        model: "Event",
      },
    });
    console.log("ticketinfo", ticket_info);

    res.status(200).json({ ticket_info });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
