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
import { requireAdmin } from "../middlewares/requireAdmin.js";

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
ticketRouter.patch(
  "/ticket/:ticketId/status",
  authenticateTokenMiddleware,
  requireAdmin,
  updateTicketStatus,
);
ticketRouter.patch("/tickets/qr", authenticateTokenMiddleware, requireAdmin, scanTicket);

export default ticketRouter;
