import catchAsync from "../errors/catchAsync.js";
import SuperAdminEventService from "../service/superAdminEventService.js";

export const getEvents = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const allEvents = await SuperAdminEventService.getEvent();
  return res.status(200).json({
    success: true,
    events: allEvents,
  });
});

export const getAdmin = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const allEvents = await SuperAdminEventService.getAdmins();
  return res.status(200).json({
    success: true,
    admins: allEvents,
  });
});
