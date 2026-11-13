import mongoose from "mongoose";
import catchAsync from "../errors/catchAsync.js";
import SuperAdminEventService from "../service/superAdminEventService.js";
import { scanAnyTicket } from "../service/superAdminScan.service.js";
import { ScanLog } from "../models/scanLog.model.js";
import { recordAudit } from "../service/audit.service.js";

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
  const token = req.body?.token;
  const eventId = req.body?.eventId || null;

  if (eventId && !mongoose.Types.ObjectId.isValid(eventId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid event id" });
  }

  try {
    const result = await scanAnyTicket(token, req.user.id, eventId);

    // A scan is an operational event worth keeping even when the app closes.
    try {
      await ScanLog.create({
        orderId: result.ticket?.userTicketId || null,
        orderNo: result.ticket?.orderNo || "",
        eventId: result.event?.id || null,
        eventName: result.event?.name || "",
        buyerName: result.holder?.name || "",
        tierName: result.ticket?.name || "",
        scannerId: req.user.id,
        scannerEmail: req.user.email || "",
        result:
          result.outcome === "checked_in" ? "checked_in" : "already_scanned",
      });
      await recordAudit({
        req,
        action: "ticket.scan",
        entityType: "order",
        entityId:
          result.ticket?.userTicketId ||
          result.ticket?.orderNo ||
          "",
        message: `${result.outcome === "checked_in" ? "Checked in" : "Repeat scan"}: ${result.ticket?.orderNo} · ${result.event?.name}`,
        metadata: { outcome: result.outcome },
      });
    } catch (logError) {
      console.error("[scan] could not record scan", logError.message);
    }

    // A repeat scan is a normal answer, not a failure, so it stays a 200 and
    // the app tells the two cases apart by `outcome`.
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    try {
      await ScanLog.create({
        orderNo:
          typeof token === "string" ? token.trim().slice(0, 120) : "",
        scannerId: req.user.id,
        scannerEmail: req.user.email || "",
        result: "invalid",
        reason: error.message,
      });
    } catch (logError) {
      console.error("[scan] could not record failed scan", logError.message);
    }
    throw error;
  }
});
