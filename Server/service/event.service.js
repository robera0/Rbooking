import { Event } from "../models/events.model.js";

class EventService {
  static async create(eventData) {
    return await Event.create(eventData);
  }

  static async updateById(id, eventData) {
    return await Event.findByIdAndUpdate(id, eventData, {
      new: true,
    });
  }

  static async findById(id) {
    return await Event.findById(id).populate({
      path: "comments", // This is the array of Comment documents in Event
      populate: [
        {
          path: "user", // The user who created the comment document
          model: "User",
          select: "fullName avatarUrl",
        },
        {
          path: "comment.userId", // Nested path for individual comments
          model: "userprofiles",
          select: "fullName avatarUrl",
        },
      ],
    });
  }
  static find(query = {}) {
    return Event.find(query);
  }

  static async findAll() {
    return await Event.find();
  }

  static async deleteById(id) {
    return await Event.findByIdAndDelete(id);
  }
  static async deleteMany(eventIds) {
    return await Event.deleteMany({ _id: { $in: eventIds } });
  }

  static async countDocuments(query) {
    return await Event.countDocuments(query);
  }
}

export default EventService;
