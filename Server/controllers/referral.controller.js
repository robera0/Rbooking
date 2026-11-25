import { AdminProfile } from "../models/adminProfile.model.js";
import {
  ReferralError,
  createReferral,
  listReferrals,
  referralDetail,
  resolveReferral,
  setReferralActive,
} from "../service/referral.service.js";

const fail = (res, error) => {
  if (error instanceof ReferralError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error("referral error:", error.message);
  return res.status(500).json({ success: false, message: "Something went wrong" });
};

// Organizer id for the signed-in admin, or null.
const organizerId = async (req) => {
  const profile = await AdminProfile.findOne({ userId: req.user.id })
    .select("_id")
    .lean();
  return profile?._id ?? null;
};

const withOrganizer = (handler) => async (req, res) => {
  try {
    const adminId = await organizerId(req);
    if (!adminId) {
      return res
        .status(403)
        .json({ success: false, message: "Organizer profile not found" });
    }
    return await handler(req, res, adminId);
  } catch (error) {
    return fail(res, error);
  }
};

export const listMyReferrals = withOrganizer(async (_req, res, adminId) => {
  res.json({ success: true, referrals: await listReferrals(adminId) });
});

export const createMyReferral = withOrganizer(async (req, res, adminId) => {
  const referral = await createReferral(adminId, req.body || {});
  res.status(201).json({ success: true, referral });
});

export const getMyReferral = withOrganizer(async (req, res, adminId) => {
  res.json({ success: true, ...(await referralDetail(adminId, req.params.id)) });
});

export const updateMyReferral = withOrganizer(async (req, res, adminId) => {
  const referral = await setReferralActive(
    adminId,
    req.params.id,
    req.body?.isActive,
  );
  res.json({ success: true, referral });
});

// Public: lets checkout confirm a code before the buyer pays.
export const checkReferralCode = async (req, res) => {
  try {
    const referral = await resolveReferral(req.params.code, req.params.eventId);
    if (!referral) return res.json({ success: true, valid: false });
    return res.json({ success: true, valid: true, name: referral.name });
  } catch (error) {
    return fail(res, error);
  }
};
