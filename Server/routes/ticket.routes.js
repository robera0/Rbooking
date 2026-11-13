import express from "express";
import {
  getTickets,
  getTicketsInfo,
  updateTicketStatus,
  purchaseTicket,
  verifyTicket,
  scanTicket,
} from "../controllers/ticket.controller.js";

import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { requireRole } from "../middlewares/requireRole.js";

const ticketRouter = express.Router();

ticketRouter.get("/tickets_home", authenticateTokenMiddleware, getTickets);
ticketRouter.get(
  "/tickets_home/:ticketId",
  authenticateTokenMiddleware,
  getTicketsInfo,
);

ticketRouter.post(
  "/ticket/:ticketId/purchase",
  authenticateTokenMiddleware,
  purchaseTicket,
);
ticketRouter.post(
  "/ticket/:userTicketId/verify",
  authenticateTokenMiddleware,
  verifyTicket,
);
// Changing an order's status affects money and check-in state, so it needs a
// real session and a role. The controller also checks event ownership and
// only lets a super admin issue refunds.
ticketRouter.patch(
  "/ticket/:ticketId/status",
  authenticateTokenMiddleware,
  requireRole("admin", "super_admin"),
  updateTicketStatus,
);
ticketRouter.patch("/tickets/qr", authenticateTokenMiddleware, scanTicket);

export default ticketRouter;
