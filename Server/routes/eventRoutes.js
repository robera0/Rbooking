import express from "express";
import {
  featured_events,
  get_events,
  fetchevents_id,
  add_event,
  get_event_by_id,
  update_event,
  upload,
} from "../controllers/eventsController.js";

const eventrouter = express.Router();

eventrouter.get("/events", get_events);
eventrouter.get("/events/:eventId", get_event_by_id);
eventrouter.put("/events/:eventId", upload.array("pictures", 10), update_event);
eventrouter.post("/addEvents", upload.array("pictures", 10), add_event);
eventrouter.get("/", featured_events);
eventrouter.get("/events/:eventId/tickets/:ticketId", fetchevents_id);

export default eventrouter;
