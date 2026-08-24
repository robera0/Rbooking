import catchAsync from "../errors/catchAsync.js";
import { AdminSettingsModel } from "../models/adminSettings.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { Event } from "../models/events.model.js";
import { clearSingleEventCache } from "../config/redis.js";

export const getAdminSettings = catchAsync(async (req, res) => {
  const adminId = req.user.id; // user ID from JWT (which is the admin's base User ID)
  
  let settings = await AdminSettingsModel.findOne({ adminId });
  
  if (!settings) {
    // If settings don't exist, create defaults based on admin profile
    const adminProfile = await AdminProfile.findOne({ userId: adminId });
    
    // By default, activate all payment methods they provided during registration
    let defaultActivePayments = [];
    if (adminProfile && adminProfile.paymentMethods) {
      defaultActivePayments = adminProfile.paymentMethods.map(pm => pm.provider);
    }

    settings = await AdminSettingsModel.create({
      adminId,
      activePaymentMethods: defaultActivePayments,
    });
  }

  // Fetch available methods every time so the frontend knows what to display
  const adminProfileForAvailable = await AdminProfile.findOne({ userId: adminId });
  const paymentMethods = adminProfileForAvailable?.paymentMethods || [];

  res.status(200).json({ success: true, settings, paymentMethods });
});

export const updateAdminSettings = catchAsync(async (req, res) => {
  const adminId = req.user.id;
  
  if (req.body.paymentMethods) {
    const profile = await AdminProfile.findOneAndUpdate(
      { userId: adminId },
      { $set: { paymentMethods: req.body.paymentMethods } },
      { new: true, runValidators: true }
    );
    delete req.body.paymentMethods;

    if (profile) {
      // Clear cache for all events owned by this admin so changes reflect immediately
      const events = await Event.find({
        $or: [{ adminId: profile._id }, { adminId: adminId }]
      }).select("_id").lean();
      
      for (const ev of events) {
        await clearSingleEventCache(ev._id.toString());
      }
    }
  }

  const updatedSettings = await AdminSettingsModel.findOneAndUpdate(
    { adminId },
    { $set: req.body },
    { new: true, runValidators: true, upsert: true }
  );

  res.status(200).json({ success: true, settings: updatedSettings, message: "Settings updated successfully" });
});
