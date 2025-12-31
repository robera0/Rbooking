import express from "express";
import {
  featured_events,
  get_events,
} from "../controllers/eventsController.js";

const eventrouter = express.Router();

eventrouter.get("/events", get_events);
eventrouter.get("/", featured_events);

export default eventrouter;
