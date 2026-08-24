import mongoose from 'mongoose';
import { AdminProfile } from './Server/models/adminProfile.model.js';
import { UserModel } from './Server/models/user.model.js';

const MONGO_URI = 'mongodb+srv://Paysso:Paysso2020%24Lifestar@cluster0.2yhcx8v.mongodb.net/TimeBooking?retryWrites=true&w=majority';

async function test() {
  await mongoose.connect(MONGO_URI);
  
  const admin = await AdminProfile.findOne().populate('userId').exec();
  if (!admin) {
    console.log("No admin profile found in DB");
  } else {
    console.log("Found admin profile:");
    console.log(admin);
  }
  
  mongoose.connection.close();
}

test().catch(console.error);
