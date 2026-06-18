import User from "../model/user.model.js";

class UserService {
    static create(userData) {
        return new User(userData);
    }

    static async save(obj) {
        await obj.save();
    }

    static async updateById(id, userData) {
        return await User.findByIdAndUpdate(id, userData, { new: true });
    }

    static async updatePasswordByUserId(userId, password) {
        return await User.findOneAndUpdate(
            { user: userId },
            { password },
            { new: true },
        ).exec();
    }

    static async findByEmail(email) {
        return await User.findOne({ email }).populate();
    }

    static async findById(id) {
        return await User.findById(id);
    }

    static async findByGoogleId(id) {
        return await User.findOne({ googleId: id }).select("-password -googleId");
    }

    static async findByPhoneNumber(phoneNumber) {
        return User.findOne({ phoneNumber });
    }
    static async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await User.find()
            .select("-password")
            .skip(skip)
            .limit(limit);
    }
}

export default UserService;
