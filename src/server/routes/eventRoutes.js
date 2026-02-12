import express from "express";
import {
  featured_events,
  get_events,
  fetchevents_id,
} from "../controllers/eventsController.js";

const eventrouter = express.Router();

eventrouter.get("/events", get_events);
eventrouter.get("/", featured_events);
eventrouter.get("/events/:eventId/tickets/:ticketId", fetchevents_id);

export default eventrouter;
