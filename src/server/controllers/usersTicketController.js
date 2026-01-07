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
