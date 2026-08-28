import express from "express";
import {
  featuredEvents,
  getEvents,
  fetchEventsId,
  getEventById,
  updateEvent,
  upload,
  generateEventQR,
 
} from "../controllers/events.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";

const eventRouter = express.Router();

eventRouter.get("/events", getEvents);
eventRouter.get("/featuredEvents", featuredEvents);
eventRouter.get("/events/:eventId", getEventById);
eventRouter.put(
  "/admin/events/:eventId",
  authenticateTokenMiddleware,
  upload.array("pictures", 10),
  updateEvent,
); 
eventRouter.patch(
  "/auth/admin/events/:eventId",
  authenticateTokenMiddleware,
  upload.array("pictures", 10),
  updateEvent,
);
eventRouter.get("/events/:eventId/tickets/:ticketId", fetchEventsId);
eventRouter.get("/events/:eventId/qr", generateEventQR);

export default eventRouter;
