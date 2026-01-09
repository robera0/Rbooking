import express from "express";
import {
  get_tickets,
  get_tickets_info,
} from "../controllers/usersTicketController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const ticketrouter = express.Router();

ticketrouter.get("/tickets_home", authenticateTokenMiddleware, get_tickets);
ticketrouter.get(
  "/tickets_home/:ticketId",
  authenticateTokenMiddleware,
  get_tickets_info
);

export default ticketrouter;
