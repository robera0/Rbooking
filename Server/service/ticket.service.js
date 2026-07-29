import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import Transaction from "../models/transaction.model.js";
import mongoose from "mongoose";
class TicketService {
  static async create(data, session) {
    const [ticket] = await UserTicketModel.create([data], { session });
    return ticket;
  }
  static async decrementQuantity(ticketId, quantity, session) {
    return await TicketModel.findByIdAndUpdate(
      ticketId,
      { $inc: { availableQuantity: -quantity } },
      { new: true, session },
    );
  }
  static async findByIdAndUpdate(id, status) {
    return await UserTicketModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
  }

  static async findById(id) {
    return await Transaction.findById(id)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "event",
      });
  }

  static async find(userId) {
    return await UserTicketModel.find({
      userId,
      status: "paid",
    })
      .populate({
        path: "ticketId",
        populate: {
          path: "eventId",
          model: "Event",
        },
      })
      .lean();
  }

  static async findTickets(adminId) {
    return await UserTicketModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                password: 0,
                refreshTokens: 0,
                __v: 0,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "tickets",
          localField: "ticketId",
          foreignField: "_id",
          as: "ticket",
        },
      },

      {
        $unwind: "$ticket",
      },

      // Join Event
      {
        $lookup: {
          from: "events",
          localField: "ticket.eventId",
          foreignField: "_id",
          as: "event",
        },
      },

      {
        $unwind: "$event",
      },

      {
        $match: {
          "event.adminId": new mongoose.Types.ObjectId(adminId),
        },
      },

      {
        $sort: {
          purchasedAt: -1,
        },
      },
    ]);
  }

  static async findById(ticketId) {
    return await UserTicketModel.findById(ticketId).populate({
      path: "ticketId",
      populate: {
        path: "eventId",
        model: "Event",
        select: "name type locale dates pictures",
      },
    });
  }

  static async findTicketById(ticketId, session) {
    return await TicketModel.findById(ticketId).session(session);
  }

  static async findByEventId(eventId) {
    return await Transaction.findOne({ event: eventId })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "event",
      });
  }

  static async findByTxRef(txRef) {
    return await Transaction.findOne({ tx_ref: txRef })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "event",
      });
  }

  static async getStatusByTxRef(txRef) {
    return await Transaction.findOne({ tx_ref: txRef }).select("status");
  }

  static async updateStatusByTxRef(txRef, status) {
    return await Transaction.findOneAndUpdate(
      { tx_ref: txRef },
      { status },
      {
        new: true,
      },
    );
  }

  static async deleteById(id) {
    return await Transaction.findByIdAndDelete(id);
  }

  static async countByEventId(eventId, query) {
    return await Transaction.countDocuments({ event: eventId, ...query });
  }
}

export default TicketService;
