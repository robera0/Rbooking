import { hideExpiredMatch } from "../utils/ticketExpiry.js";
import { TicketModel } from "../models/ticket.model.js";
import { Event } from "../models/events.model.js";
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
      status: { $in: ["paid", "pending"] },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "ticketId",
        populate: {
          path: "eventId",
          model: "Event",
        },
      })
      .lean();
  }

  // Orders on this organizer's events, newest first. `eventId` narrows the
  // list to one event; because the organizer's own events are looked up first,
  // an id that belongs to someone else simply returns nothing. Filtering comes
  // before the joins so the cost follows this organizer's orders, not the
  // whole platform's.
  static async findTickets(adminId, { eventId } = {}) {
    const eventIds = await Event.find({
      adminId: new mongoose.Types.ObjectId(adminId),
      ...(eventId ? { _id: new mongoose.Types.ObjectId(eventId) } : {}),
    }).distinct("_id");
    const tierIds = await TicketModel.find({ eventId: { $in: eventIds } }).distinct("_id");

    return await UserTicketModel.aggregate([
      { $match: { ticketId: { $in: tierIds }, ...hideExpiredMatch() } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { email: 1, username: 1 } }],
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "userprofiles",
          localField: "userId",
          foreignField: "userId",
          as: "profile",
          pipeline: [{ $project: { fullName: 1 } }],
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          customerName: {
            $trim: {
              input: {
                $ifNull: ["$profile.fullName", "$user.username", ""],
              },
            },
          },
          customerEmail: { $ifNull: ["$user.email", ""] },
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
      { $unwind: "$ticket" },
      {
        $lookup: {
          from: "events",
          localField: "ticket.eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      { $sort: { purchasedAt: -1 } },
      // Only what the orders screen shows: nothing else about the buyer.
      {
        $project: {
          orderNo: 1,
          quantity: 1,
          totalAmount: 1,
          status: 1,
          purchasedAt: 1,
          phone: 1,
          paidTo: 1,
          customerName: 1,
          customerEmail: 1,
          "user._id": 1,
          "user.email": 1,
          "user.username": 1,
          "ticket._id": 1,
          "ticket.name": 1,
          "ticket.price": 1,
          "event._id": 1,
          "event.name": 1,
          "event.artist.name": 1,
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
