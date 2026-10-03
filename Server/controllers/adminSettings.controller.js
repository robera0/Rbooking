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
    // Telebirr is the only provider wired up for payment verification.
    if (req.body.paymentMethods.some((pm) => pm.provider !== "Telebirr")) {
      return res.status(400).json({
        message: "Only Telebirr is supported as a payment provider",
      });
    }

    // Telebirr's receipt API only ever returns the payer's first name, so
    // a receiver name saved with a surname attached can never match on
    // verification. The frontend already trims this, but normalize here
    // too in case a request bypasses it.
    const normalizedPaymentMethods = req.body.paymentMethods.map((pm) => ({
      ...pm,
      receiverName: pm.receiverName?.trim().split(/\s+/)[0] || "",
    }));

    const profile = await AdminProfile.findOneAndUpdate(
      { userId: adminId },
      { $set: { paymentMethods: normalizedPaymentMethods } },
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

  // Never write the raw body: it could overwrite adminId or any other field.
  const allowed = Object.keys(AdminSettingsModel.schema.paths).filter(
    (k) => !["_id", "__v", "adminId", "createdAt", "updatedAt"].includes(k),
  );
  const safeUpdate = Object.fromEntries(
    Object.entries(req.body).filter(
      ([k]) =>
        allowed.includes(k) ||
        allowed.some((a) => a.startsWith(k + ".") || k.startsWith(a + ".")),
    ),
  );

  const updatedSettings = await AdminSettingsModel.findOneAndUpdate(
    { adminId },
    { $set: safeUpdate },
    { new: true, runValidators: true, upsert: true }
  );

  res.status(200).json({ success: true, settings: updatedSettings, message: "Settings updated successfully" });
});
