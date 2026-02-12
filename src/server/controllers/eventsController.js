import { Event } from "../models/EventsModel.js";
import { TicketModel } from "../models/TicketModel.js";
import mongoose from "mongoose";
export const get_events = async (req, res) => {
  try {
    const events = await Event.find();

    // Get tickets for each event
    const eventsWithTickets = await Promise.all(
      events.map(async (event) => {
        const tickets = await TicketModel.find({
          eventId: event._id,
        });

        return {
          ...event.toObject(),
          tickets: tickets,
          ticketCount: tickets.length,
        };
      }),
    );

    res.status(200).json({
      success: true,
      events: eventsWithTickets,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// FETCH EVENTS

export const featured_events = async (req, res) => {
  try {
    const limit = 4;
    const events = await Event.find().limit(limit);
    res.status(200).json({ events: events });
  } catch {
    res.status(401).json({ message: "No Filtered Events" });
  }
};

// FETCH WITH RESPECT TO ITS INDEX
export const fetchevents_id = async (req, res) => {
  try {
    const { eventId, ticketId } = req.params;

    if (!ticketId || ticketId === "undefined") {
      return res.status(400).json({ message: "Ticket ID is required" });
    }

    // FIXED: Correct populate path for your nested schema
    const event = await Event.findById(eventId).populate({
      path: "comments", // This is the array of Comment documents in Event
      populate: [
        {
          path: "user", // The user who created the comment document
          model: "User",
          select: "fullName avatarUrl",
        },
        {
          path: "comment.userId", // Nested path for individual comments
          model: "User_Profile",
          select: "fullName avatarUrl",
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const ticketInfo = await TicketModel.findOne({
      _id: ticketId,
      eventId: eventId,
    });

    if (!ticketInfo) {
      return res
        .status(404)
        .json({ message: "Ticket not found for this event" });
    }

    res.status(200).json({
      event: event,
      ticket: ticketInfo,
    });
  } catch (error) {
    console.error("ERROR in fetchevents_id:", error);
    res.status(500).json({ message: error.message });
  }
};
