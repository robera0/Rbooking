import mongoose from "mongoose";
import {
  DatesSchema,
  ClassificationSchema,
  PriceRangeSchema,
} from "./EventsModel.js";

const TicketSchema = new mongoose.Schema({
  name: String,
  url: String,
  pictures: [String],
  locale: String,
  dates: DatesSchema,
  ticket_id: Number,
  seat: String,
  classifications: [ClassificationSchema],
  priceRanges: [PriceRangeSchema],
});

export const TicketModel = new mongoose.model("tickets", TicketSchema);
