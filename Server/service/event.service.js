import { Event } from "../models/events.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";

class EventService {
  static async create(eventData) {
    return await Event.create(eventData);
  }

  static async findByIdAndUpdate(id, eventData) {
    return await Event.findByIdAndUpdate(id, eventData, {
      new: true,
    });
  }

  static async findById(id) {
    const event = await Event.findById(id).populate({
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
    }).populate({
      path: "adminId",
      model: "AdminProfile",
      select: "paymentMethods organizationName",
    });

    // Fallback for legacy events where adminId was mistakenly saved as userId
    if (event && !event.adminId) {
      const rawEvent = await Event.findById(id).lean();
      if (rawEvent && rawEvent.adminId) {
        const profile = await AdminProfile.findOne({ userId: rawEvent.adminId }).select("paymentMethods organizationName");
        if (profile) {
          event.adminId = profile;
        }
      }
    }

    return event;
  }
  static find(query = {}) {
    return Event.find(query).lean();
  }

  static async findAll() {
    return await Event.find().lean();
  }

  static async deleteById(id) {
    return await Event.findByIdAndDelete(id);
  }
  static async deleteMany(eventIds) {
    return await Event.deleteMany({ _id: { $in: eventIds } });
  }

  static async countDocuments(query = {}) {
    return await Event.countDocuments(query);
  }
}

export default EventService;
