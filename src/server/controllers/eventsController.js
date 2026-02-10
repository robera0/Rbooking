import { Event } from "../models/EventsModel.js";
import { CommentModel } from "../models/CommentModel.js";

export const get_events = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ events: events });
    console.log(events?.events?.comments);
  } catch {
    res.status(500).json({ message: "Server error" });
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
    const { id } = req.params;

    const event = await Event.findById(id).populate({
      path: "comments",
      populate: {
        path: "comment.userId",
        model: "User_Profile",
        select: "fullName avatarUrl createdAt",
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ event_id: event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
