import { UserModel } from "../models/user.model.js";
class UserService {
  static async create(userData) {
    return await UserModel.create(userData);
  }

  static async updateById(id, userData) {
    return await UserModel.findByIdAndUpdate(id, userData, { new: true });
  }
  static async findByIdAndUpdate(id, updateData) {
    return await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    ).select("-password -refreshTokens");
  }
  static async suspendUsers(userIds) {
    return await UserModel.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: "suspended" } },
    );
  }
  static async updatePasswordByUserId(userId, password) {
    return await UserModel.findOneAndUpdate(
      { user: userId },
      { password },
      { new: true },
    ).exec();
  }

  static async findByEmail(email) {
    return await UserModel.findOne({ email }).populate();
  }

  static async findById(id) {
    return await UserModel.findById(id);
  }

  static async findByGoogleId(id) {
    return await UserModel.findOne({ googleId: id }).select(
      "-password -googleId",
    );
  }

  static async findByPhoneNumber(phoneNumber) {
    return UserModel.findOne({ phoneNumber });
  }

  static async deleteUsers(userIds) {
    return UserModel.deleteMany({
      _id: { $in: userIds },
    });
  }
  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await UserModel.find().select("-password").skip(skip).limit(limit);
  }
}

export default UserService;
