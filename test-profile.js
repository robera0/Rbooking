import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'Server/.env' });

import { ProfileModel } from './Server/models/profile.model.js';
import { UserModel } from './Server/models/user.model.js';
import connectDB from './Server/config/databse.js';

async function test() {
  await connectDB();
  
  // Create a mock user
  const user = await UserModel.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  });
  
  console.log('Created user:', user._id);
  
  // Test the profile upsert logic exactly as it is in the controller
  const profileData = {
    fullName: 'Test User',
    phone: '+251911223344',
    address: 'Addis Ababa'
  };
  
  const idStr = user._id.toString();
  
  const profile = await ProfileModel.findOneAndUpdate(
    { userId: idStr },
    profileData,
    { new: true, upsert: true }
  );
  
  console.log('Upserted profile:', profile);
  
  // Test retrieval
  const fetched = await ProfileModel.findOne({ userId: idStr }).populate('userId').exec();
  console.log('Fetched profile:', fetched ? 'Found' : 'Not found');
  console.log('Profile fullName:', fetched?.fullName);
  console.log('Populated user email:', fetched?.userId?.email);
  
  await UserModel.findByIdAndDelete(user._id);
  await ProfileModel.findByIdAndDelete(profile._id);
  
  mongoose.connection.close();
}

test().catch(console.error);
