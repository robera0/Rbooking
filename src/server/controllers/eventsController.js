import { Event } from "../models/EventsModel.js";
import { TicketModel } from "../models/TicketModel.js";

export const get_events = async (req, res) => {
  try {
    const { q, date, location } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { locale: { $regex: q, $options: "i" } },
        { type: { $regex: q, $options: "i" } },
      ];
    }

    if (date) {
      filter["dates.start.dateTime"] = date;
    }

    if (location) {
      filter.location = date;
    }

    const events = await Event.find(filter);

    const eventsWithTickets = await Promise.all(
      events.map(async (event) => {
        const tickets = await TicketModel.find({ eventId: event._id });

        return {
          ...event.toObject(),

          tickets,
          ticketCount: tickets.length,
        };
      }),
    );

    const sortedEvent = eventsWithTickets.sort(
      (a, b) => b.ticketCount - a.ticketCount,
    );

    if (sortedEvent.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No event found",
      });
    }

    res.status(200).json({
      success: true,
      events: sortedEvent,
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

    const event = await Event.findById(eventId).populate({
      path: "comments",
      populate: {
        path: "user",
        select: "fullName avatarUrl",
      },
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
