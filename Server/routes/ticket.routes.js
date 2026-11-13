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
// Changes whether an order counts as paid, so it needs a signed-in admin.
// (The handler still has to check that the order belongs to that admin before
// this is wired to a screen.)
ticketRouter.patch(
  "/ticket/:ticketId/status",
  authenticateTokenMiddleware,
  requireRole("admin"),
  updateTicketStatus,
);
ticketRouter.patch("/tickets/qr", authenticateTokenMiddleware, scanTicket);

export default ticketRouter;
