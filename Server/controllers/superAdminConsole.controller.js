import mongoose from "mongoose";
import catchAsync from "../errors/catchAsync.js";
import AppError from "../errors/AppError.js";
import { UserModel } from "../models/user.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { getPlatformSetting } from "../models/platformSetting.model.js";
import {
  getActivity,
  getEventDetail,
  getOrderDetail,
  getOrganizerDetail,
  getOverview,
  getRevenue,
  getRevenueByOrganizer,
  getUserDetail,
  listAuditLogs,
  listEvents,
  listOrders,
  listOrganizers,
  listScans,
  listUsers,
} from "../service/superAdminConsole.service.js";
import { parsePagination, pageMeta, parseBoolean } from "../utils/pagination.js";
import { parseRange } from "../utils/dateRange.js";

const ok = (res, data, meta) =>
  res.status(200).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });

const optionalDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const me = catchAsync(async (req, res) => {
  const user = await UserModel.findById(req.user.id)
    .select("email role status createdAt lastLoginAt")
    .lean();
  if (!user) throw new AppError("User not found", 404);

  const profile =
    user.role === "admin"
      ? await AdminProfile.findOne({ userId: user._id })
          .select("firstName lastName organizationName avatarUrl")
          .lean()
      : await ProfileModel.findOne({ userId: user._id })
          .select("fullName avatarUrl")
          .lean();

  const name =
    profile?.fullName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    profile?.organizationName ||
    (user.role === "super_admin"
      ? "Super Admin"
      : user.email.split("@")[0]) ||
    "Super Admin";

  return ok(res, {
    id: String(user._id),
    email: user.email,
    role: user.role,
    status: user.status,
    name,
    avatarUrl: profile?.avatarUrl || "",
    joinedAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || null,
  });
});

export const overview = catchAsync(async (req, res) => {
  const { from, to } = parseRange(req.query);
  return ok(res, await getOverview({ from, to }));
});

export const activity = catchAsync(async (req, res) => {
  return ok(res, await getActivity({ limit: req.query.limit }));
});

export const events = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const { rows, total } = await listEvents({
    q: req.query.q,
    status: req.query.status,
    organizerId: req.query.organizerId,
    from: optionalDate(req.query.from),
    to: optionalDate(req.query.to),
    page,
    limit,
    sort: req.query.sort,
  });
  return ok(res, rows, pageMeta(total, page, limit));
});

export const event = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new AppError("Invalid event id", 400);
  }
  return ok(res, await getEventDetail(eventId));
});

export const organizers = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const { rows, total } = await listOrganizers({
    q: req.query.q,
    verified: parseBoolean(req.query.verified),
    status: req.query.status,
    page,
    limit,
  });
  return ok(res, rows, pageMeta(total, page, limit));
});

export const organizer = catchAsync(async (req, res) => {
  const { adminId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new AppError("Invalid organizer id", 400);
  }
  return ok(res, await getOrganizerDetail(adminId));
});

export const users = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const { rows, total } = await listUsers({
    q: req.query.q,
    role: req.query.role,
    status: req.query.status,
    page,
    limit,
  });
  return ok(res, rows, pageMeta(total, page, limit));
});

export const user = catchAsync(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user id", 400);
  }
  return ok(res, await getUserDetail(userId));
});

export const orders = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const { rows, total, totals } = await listOrders({
    q: req.query.q,
    status: req.query.status,
    eventId: req.query.eventId,
    organizerId: req.query.organizerId,
    userId: req.query.userId,
    from: optionalDate(req.query.from),
    to: optionalDate(req.query.to),
    page,
    limit,
  });
  return ok(res, rows, {
    ...pageMeta(total, page, limit),
    totals,
  });
});

export const order = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new AppError("Invalid order id", 400);
  }
  return ok(res, await getOrderDetail(orderId));
});

export const scans = catchAsync(async (req, res) => {
  return ok(
    res,
    await listScans({
      limit: req.query.limit,
      eventId: req.query.eventId,
      result: req.query.result,
    }),
  );
});

export const revenue = catchAsync(async (req, res) => {
  const { from, to } = parseRange(req.query);
  return ok(res, await getRevenue({ from, to }));
});

export const revenueByOrganizer = catchAsync(async (req, res) => {
  const { from, to } = parseRange(req.query);
  return ok(res, await getRevenueByOrganizer({ from, to }));
});

export const settings = catchAsync(async (req, res) => {
  const setting = await getPlatformSetting();
  return ok(res, {
    commissionRate: setting?.commissionRate ?? 0.1,
    currency: setting?.currency || "ETB",
    timezone: setting?.timezone || "Africa/Addis_Ababa",
    supportEmail: setting?.supportEmail || "",
    allowManualPayments: Boolean(setting?.allowManualPayments),
  });
});

export const audit = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const { rows, total } = await listAuditLogs({
    actor: req.query.actor,
    action: req.query.action,
    entity: req.query.entity,
    entityId: req.query.entityId,
    from: optionalDate(req.query.from),
    to: optionalDate(req.query.to),
    page,
    limit,
  });
  return ok(res, rows, pageMeta(total, page, limit));
});
