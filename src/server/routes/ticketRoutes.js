import express from "express";
import {
  get_tickets,
  get_tickets_info,
  purchase_ticket,
  update_ticket_status,
} from "../controllers/usersTicketController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const ticketrouter = express.Router();

ticketrouter.get("/tickets_home", authenticateTokenMiddleware, get_tickets);
ticketrouter.get(
  "/tickets_home/:ticketId",
  authenticateTokenMiddleware,
  get_tickets_info,
);
ticketrouter.post(
  "/purchase/:id/:ticketId",
  authenticateTokenMiddleware,
  purchase_ticket,
);

ticketrouter.patch("/ticket/:ticketId/status", update_ticket_status);

export default ticketrouter;
