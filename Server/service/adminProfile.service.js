import { AdminProfile } from "../models/adminProfile.model.js";

class AdminProfileService {
  static async create(userData, options = {}) {
    return await AdminProfile.create(userData, options);
  }

  static async updateById(id, userData) {
    return await AdminProfile.findByIdAndUpdate(id, userData, { new: true });
  }

  static async findById(id) {
    return await AdminProfile.findById(id);
  }

  static async findOne(id) {
    return await AdminProfile.findOne({ userId: id }).populate("userId").exec();
  }
  static async findByEmail(email) {
    return await AdminProfile.findOne({ email: email });
  }
  static async findByPhoneNumber(phoneNumber) {
    return AdminProfile.findOne({ phoneNumber });
  }
  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await AdminProfile.find()
      .select("-password")
      .skip(skip)
      .limit(limit);
  }
}

export default AdminProfileService;
