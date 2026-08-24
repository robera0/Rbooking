import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "Server/.env" });
import { Event } from "../Server/models/events.model.js";
import { AdminProfile } from "../Server/models/adminProfile.model.js";

mongoose.connect(process.env.DATABASE).then(async () => {
  const event = await Event.findOne().populate({
    path: "adminId",
    model: "AdminProfile",
    select: "paymentMethods organizationName",
  }).lean();
  console.log(JSON.stringify(event?.adminId, null, 2));
  process.exit(0);
});
