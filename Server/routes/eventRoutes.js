import express from "express";
import {
  featured_events,
  get_events,
  fetchevents_id,
  add_event,
  upload,
} from "../controllers/eventsController.js";

const eventrouter = express.Router();

eventrouter.get("/events", get_events);
eventrouter.post("/addEvents", upload.array("pictures", 10), add_event);
eventrouter.get("/", featured_events);
eventrouter.get("/events/:eventId/tickets/:ticketId", fetchevents_id);

export default eventrouter;
