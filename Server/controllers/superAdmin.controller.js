import catchAsync from "../errors/catchAsync.js";
import SuperAdminEventService from "../service/superAdminEventService.js";
import { scanAnyTicket } from "../service/superAdminScan.service.js";

export const getEvents = catchAsync(async (req, res, next) => {
  const allEvents = await SuperAdminEventService.getEvent();
  return res.status(200).json({
    success: true,
    events: allEvents,
  });
});

export const getAdmin = catchAsync(async (req, res, next) => {
  const allEvents = await SuperAdminEventService.getAdmins();
  return res.status(200).json({
    success: true,
    admins: allEvents,
  });
});

export const scan = catchAsync(async (req, res, next) => {
  const result = await scanAnyTicket(req.body?.token, req.user.id);
  // A repeat scan is a normal answer, not a failure, so it stays a 200 and
  // the app tells the two cases apart by `outcome`.
  return res.status(200).json({ success: true, ...result });
});
