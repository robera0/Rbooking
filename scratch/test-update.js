import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "Server/.env" });
import { TicketModel } from "../Server/models/ticket.model.js";

mongoose.connect(process.env.DATABASE).then(async () => {
  const eventId = "66c72e27e8d641d99903ab76"; // we need a valid eventId to test, I'll just check if it throws
  const priceRanges = [{ type: "VIP", min: 1200, capacity: 50 }];
  const eventIdObj = new mongoose.Types.ObjectId(eventId);
  
  const ticketOps = priceRanges.map((pr) => {
    return {
      updateOne: {
        filter: { eventId: eventIdObj, name: pr.type },
        update: {
          $set: {
            price: Number(pr.min),
            totalQuantity: Number(pr.capacity) || 0,
          },
          $setOnInsert: {
            availableQuantity: Number(pr.capacity) || 0,
          }
        },
        upsert: true
      }
    };
  });
  
  if (ticketOps.length > 0) {
    try {
      const res = await TicketModel.bulkWrite(ticketOps);
      console.log(res);
    } catch(e) {
      console.error(e);
    }
  }
  process.exit(0);
});
