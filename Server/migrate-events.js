import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { Event } from "./models/events.model.js";
import { AdminProfile } from "./models/adminProfile.model.js";

async function run() {
  await mongoose.connect(process.env.MONGO || process.env.NEW_MONGO);
  console.log("Connected to DB.");

  const events = await Event.find({});
  let updated = 0;
  for (const ev of events) {
    // If ev.adminId points to a User, AdminProfile.findById will fail or return null.
    // If it points to an AdminProfile, it will return the profile.
    const profileById = await AdminProfile.findById(ev.adminId);
    if (!profileById) {
      // It's likely a userId. Let's find the profile by userId
      const profileByUserId = await AdminProfile.findOne({ userId: ev.adminId });
      if (profileByUserId) {
        ev.adminId = profileByUserId._id;
        await ev.save();
        updated++;
        console.log(`Migrated event ${ev._id} to AdminProfile ${profileByUserId._id}`);
      }
    }
  }
  console.log(`Migration complete. Updated ${updated} events.`);
  process.exit(0);
}
run().catch(console.error);
