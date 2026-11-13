import express from "express";
import {
  getEvents,
  getAdmin,
  scan,
} from "../controllers/superAdmin.controller.js";
import {
  activity,
  audit,
  event,
  events,
  me,
  order,
  orders,
  organizer,
  organizers,
  overview,
  revenue,
  revenueByOrganizer,
  scans,
  settings,
  user,
  users,
} from "../controllers/superAdminConsole.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { requireRole } from "../middlewares/requireRole.js";
import {
  cancelOrder,
  checkInOrder,
  deleteEvent,
  deleteUser,
  markOrderPaid,
  refundOrder,
  undoOrderCheckIn,
  updateEventStatus,
  updateOrganizerCommission,
  updateOrganizerStatus,
  updateUser,
  verifyOrganizer,
} from "../controllers/superAdminActions.controller.js";

const SuperAdminRouter = express.Router();

// Everything here exposes platform-wide data, so only super admins get in.
SuperAdminRouter.use(authenticateTokenMiddleware, requireRole("super_admin"));

// Identity + platform overview
SuperAdminRouter.get("/me", me);
SuperAdminRouter.get("/overview", overview);
SuperAdminRouter.get("/activity", activity);

// Read-only console resources (Phase 1)
SuperAdminRouter.get("/events", events);
SuperAdminRouter.get("/events/:eventId", event);
SuperAdminRouter.get("/organizers", organizers);
SuperAdminRouter.get("/organizers/:adminId", organizer);
SuperAdminRouter.get("/users", users);
SuperAdminRouter.get("/users/:userId", user);
SuperAdminRouter.get("/orders", orders);
SuperAdminRouter.get("/orders/:orderId", order);
SuperAdminRouter.get("/scans", scans);
SuperAdminRouter.get("/revenue", revenue);
SuperAdminRouter.get("/revenue/organizers", revenueByOrganizer);
SuperAdminRouter.get("/settings", settings);
SuperAdminRouter.get("/audit", audit);

// Phase 2 — audited mutations
SuperAdminRouter.patch("/events/:eventId/status", updateEventStatus);
SuperAdminRouter.delete("/events/:eventId", deleteEvent);
SuperAdminRouter.patch("/organizers/:adminId/verify", verifyOrganizer);
SuperAdminRouter.patch("/organizers/:adminId/status", updateOrganizerStatus);
SuperAdminRouter.patch(
  "/organizers/:adminId/commission",
  updateOrganizerCommission,
);
SuperAdminRouter.patch("/users/:userId", updateUser);
SuperAdminRouter.delete("/users/:userId", deleteUser);
SuperAdminRouter.post("/orders/:orderId/refund", refundOrder);
SuperAdminRouter.post("/orders/:orderId/cancel", cancelOrder);
SuperAdminRouter.post("/orders/:orderId/mark-paid", markOrderPaid);
SuperAdminRouter.post("/orders/:orderId/check-in", checkInOrder);
SuperAdminRouter.post("/orders/:orderId/undo-check-in", undoOrderCheckIn);

// Legacy endpoints kept for the existing scanner / super-admin module.
SuperAdminRouter.get("/all_events", getEvents);
SuperAdminRouter.get("/all_admins", getAdmin);
SuperAdminRouter.post("/scan", scan);

export default SuperAdminRouter;
