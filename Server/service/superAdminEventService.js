import { AdminProfile } from "../models/adminProfile.model.js";
import { Event } from "../models/events.model.js";

class SuperAdminEventService {
  static async getEvent() {
    return await Event.find().populate("adminId", "organizationName");
  }

  static async getAdmins() {
    return await AdminProfile.find().populate(
      "userId",
      "email status isProfileComplete",
    );
  }
}

export default SuperAdminEventService;
