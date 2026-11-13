import catchAsync from "../errors/catchAsync.js";
import * as actions from "../service/superAdminActions.service.js";

const ok = (res, data) => res.status(200).json({ success: true, data });

export const updateEventStatus = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.updateEventStatus(req, req.params.eventId, {
      status: req.body?.status,
      isFeatured: req.body?.isFeatured,
      note: req.body?.note,
    }),
  ),
);

export const deleteEvent = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.deleteEvent(req, req.params.eventId, {
      reason: req.body?.reason,
    }),
  ),
);

export const verifyOrganizer = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.verifyOrganizer(req, req.params.adminId, {
      verified: req.body?.verified,
      note: req.body?.note,
    }),
  ),
);

export const updateOrganizerStatus = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.updateOrganizerStatus(req, req.params.adminId, {
      status: req.body?.status,
    }),
  ),
);

export const updateOrganizerCommission = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.updateOrganizerCommission(req, req.params.adminId, {
      rate: req.body?.rate,
    }),
  ),
);

export const updateUser = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.updateUser(req, req.params.userId, {
      status: req.body?.status,
      role: req.body?.role,
    }),
  ),
);

export const deleteUser = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.deleteUser(req, req.params.userId, {
      reason: req.body?.reason,
    }),
  ),
);

export const refundOrder = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.refundOrder(req, req.params.orderId, {
      amount: req.body?.amount,
      reason: req.body?.reason,
      returnSeats: req.body?.returnSeats,
    }),
  ),
);

export const cancelOrder = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.cancelOrder(req, req.params.orderId, {
      reason: req.body?.reason,
    }),
  ),
);

export const markOrderPaid = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.markOrderPaid(req, req.params.orderId, {
      note: req.body?.note,
      reference: req.body?.reference,
    }),
  ),
);

export const checkInOrder = catchAsync(async (req, res) =>
  ok(res, await actions.checkInOrder(req, req.params.orderId)),
);

export const undoOrderCheckIn = catchAsync(async (req, res) =>
  ok(
    res,
    await actions.undoOrderCheckIn(req, req.params.orderId, {
      reason: req.body?.reason,
    }),
  ),
);
