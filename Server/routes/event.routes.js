import express from "express";
import {
  featuredEvents,
  getEvents,
  fetchEventsId,
  getEventById,
  updateEvent,
  upload,
  generateEventQR,
  getOrganizerStats,
  toggleOrganizerFollow,
} from "../controllers/events.controller.js";
import { checkReferralCode } from "../controllers/referral.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { requireRole } from "../middlewares/requireRole.js";

const eventRouter = express.Router();

eventRouter.get("/events", getEvents);
eventRouter.get("/featuredEvents", featuredEvents);
eventRouter.get("/events/:eventId", getEventById);
// Public organizer profile card (name, avatar, events/followers counts).
// isFollowing is only filled in when a valid access token cookie is present.
eventRouter.get("/events/:eventId/organizer", getOrganizerStats);
// Is this referral code usable for this event? (checkout field)
eventRouter.get("/events/:eventId/referral/:code", checkReferralCode);
// Follow / unfollow the organizer behind this event (requires sign-in).
eventRouter.post(
  "/events/:eventId/follow",
  authenticateTokenMiddleware,
  toggleOrganizerFollow,
);
// Updating an event is an organizer action. The controller also checks that
// the organizer actually owns the event; the role check here keeps ordinary
// users away from the upload middleware entirely.
eventRouter.put(
  "/admin/events/:eventId",
  authenticateTokenMiddleware,
  requireRole("admin", "super_admin"),
  upload.array("pictures", 10),
  updateEvent,
);
eventRouter.patch(
  "/auth/admin/events/:eventId",
  authenticateTokenMiddleware,
  requireRole("admin", "super_admin"),
  upload.array("pictures", 10),
  updateEvent,
);
eventRouter.get("/events/:eventId/tickets/:ticketId", fetchEventsId);
eventRouter.get("/events/:eventId/qr", generateEventQR);

export default eventRouter;
