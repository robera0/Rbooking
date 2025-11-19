import mongoose from "mongoose";

const HourSchema = new mongoose.Schema({
  day: { type: String },
  start_time: { type: String },
  end_time: { type: String },
});

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  picture: { type: String },
  duration: { type: Number },
  price: { type: Number, required: true },
  age: { type: String },
  hour: [HourSchema],
  header: { type: String },
});

export const EventModel = mongoose.model("event", EventSchema);
