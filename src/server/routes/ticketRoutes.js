import express from "express";
import { get_tickets } from "../controllers/ticketController.js";

const ticketrouter = express.Router();

ticketrouter.get("/tickets_home", get_tickets);

export default ticketrouter;
