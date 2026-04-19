import Event from "../models/event.model.js";

class EventService {
    static create(eventData) {
        return new Event(eventData);
    }

    static async save(obj) {
        await obj.save();
    }

    static async updateById(id, eventData) {
        return await Event.findByIdAndUpdate(id, eventData, {
            new: true,
        });
    }

    static async findById(id) {
        return await Event.findById(id);
    }

    static async findAll() {
        return await Event.find();
    }

    static async deleteById(id) {
        return await Event.findByIdAndDelete(id);
    }

    static async countDocuments(query) {
        return await Event.countDocuments(query);
    }
}

export default EventService;