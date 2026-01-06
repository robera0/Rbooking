import { UserTicketModel } from "../models/UserTicketModel.js";

export const get_tickets = async (req, res) => {
  try {
    const user_id = req.user.id;

    const ticket = await UserTicketModel.find({ user_id })
      .select("-__v")
      .populate({
        path: "ticketId", // populate the ticket
        populate: {
          path: "eventId", // then populate the event inside ticket
          model: "Event",
        },
      });
    res.status(200).json({ tickets: ticket });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
