import { ProfileModel } from "Server/models/profile.model";
class ProfileService {
  static create(userData) {
    return new ProfileModel(userData);
  }

  static async save(obj) {
    await obj.save();
  }

  static async updateById(id, userData) {
    return await ProfileModel.findByIdAndUpdate(id, userData, {
      new: true,
    });
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
