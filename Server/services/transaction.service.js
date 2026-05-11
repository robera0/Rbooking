import Transaction from "../models/transaction.model.js";

class TransactionService {
    static create(transactionData) {
        return new Transaction(transactionData);
    }

    static async save(obj) {
        await obj.save();
    }

    static async updateById(id, transactionData) {
        return await Transaction.findByIdAndUpdate(id, transactionData, {
            new: true,
        })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "event",
            })
    }

    static async findById(id) {
        return await Transaction.findById(id)
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "event",
            })
    }

    static async findAll() {
        return await Transaction.find()
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "event",
            })
    }

    static async findByEventId(eventId) {
        return await Transaction.findOne({ event: eventId })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "event",
            })
    }

    static async findByTxRef(txRef) {
        return await Transaction.findOne({ tx_ref: txRef })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "event",
            })
    }

    static async getStatusByTxRef(txRef) {
        return await Transaction.findOne({ tx_ref: txRef }).select("status");
    }

    static async updateStatusByTxRef(txRef, status) {
        return await Transaction.findOneAndUpdate({ tx_ref: txRef }, { status }, {
            new: true,
        })
    }

    static async deleteById(id) {
        return await Transaction.findByIdAndDelete(id);
    }

    static async countByEventId(eventId, query) {
        return await Transaction.countDocuments({ event: eventId, ...query });
    }
}

export default TransactionService;