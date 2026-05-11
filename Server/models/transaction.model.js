import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  tx_ref: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

// Virtual for id
TransactionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

TransactionSchema.set("toJSON", {
  virtuals: true,
});

TransactionSchema.set("toObject", {
  virtuals: true,
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
