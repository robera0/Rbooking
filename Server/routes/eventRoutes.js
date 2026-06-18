import express from "express";
import {
  featured_events,
  get_events,
  fetchEvents_id,
  add_event,
  get_event_by_id,
  update_event,
  upload,
} from "../controllers/eventsController.js";

const eventRouter = express.Router();

eventRouter.get("/events", get_events);
eventRouter.get("/featuredevents", featured_events);
eventRouter.get("/events/:eventId", get_event_by_id);
eventRouter.put("/events/:eventId", upload.array("pictures", 10), update_event);
eventRouter.post("/addEvents", upload.array("pictures", 10), add_event);

eventRouter.get("/events/:eventId/tickets/:ticketId", fetchEvents_id);

export default eventRouter;
