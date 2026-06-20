import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import mongoose from "mongoose";
class TicketService {
  static create(transactionData) {
    return new TicketModel.create(transactionData);
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
    }).populate({
      path: "ticketId",
      populate: {
        path: "eventId",
        model: "Event",
      },
    });
  }

  static async findById(ticketId) {
    return await UserTicketModel.findById(ticketId).populate({
      path: "ticketId",
      populate: {
        path: "eventId",
        model: "Event",
      },
    });
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
