import { TicketModel } from "../models/Ticket.js";

export const get_tickets = async (req, res) => {
  try {
    const ticket = await TicketModel.find();
    res.status(200).json({ tickets: ticket });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
