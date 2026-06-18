import User from "../model/user.model.js";

class ProfileService {
    static create(userData) {
        return new User(userData);
    }

    static async save(obj) {
        await obj.save();
    }

    static async updateById(id, userData) {
        return await User.findByIdAndUpdate(id, userData, { new: true });
    }


    static async findById(id) {
        return await User.findById(id);
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

export default ProfileService;
