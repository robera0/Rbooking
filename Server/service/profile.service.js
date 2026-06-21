import { ProfileModel } from "../models/profile.model.js";
class ProfileService {
  static create(userData) {
    return new ProfileModel(userData);
  }

  static async save(obj) {
    await obj.save();
  }
  static async findOneAndUpdate(user, data) {
    return await ProfileModel.findOneAndUpdate(
      { userId: user },
      data,
      { new: true, upsert: true }, // upsert = create if doesn't exist
    );
  }
  static async updateById(id, userData) {
    return await ProfileModel.findByIdAndUpdate(id, userData, {
      new: true,
    });
  }
  static async findByUserId(userId) {
    return ProfileModel.findOne({ userId }).populate("userId");
  }

  static async findById(id) {
    return await ProfileModel.findById(id);
  }

  static async findByPhoneNumber(phoneNumber) {
    return ProfileModel.findOne({ phoneNumber });
  }
  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await ProfileModel.find()
      .select("-password")
      .skip(skip)
      .limit(limit);
  }
}

export default ProfileService;
