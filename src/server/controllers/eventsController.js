import { Event } from "../models/EventsModel.js";

export const get_events = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ events: events });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// featured events

export const featured_events = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const events = await Event.find().limit(limit);
    res.status(200).json({ events: events });
  } catch {
    res.status(401).json({ message: "No Filtered Events" });
  }
};
