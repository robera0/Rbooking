import express from "express";
import {
  getAdminProfile,
  deleteUsers,
  suspendUsers,
  deleteEvents,
  addUser,
  updateUser,
  getUsers,
} from "../controllers/admin.controller.js";
import {
  get_dashboard_stats,
  getTransactionLedger,
  get_transaction_by_id,
  get_revenue_history,
  getEvents,
} from "../controllers/analytics.controller.js";
import {
  upload,
  addEvent,
  createTickets,
  createInvitation,
} from "../controllers/events.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { requireRole } from "../middlewares/requireRole.js";
const adminOnly = requireRole("admin");
const adminRouter = express.Router();

adminRouter.get("/admin_users", authenticateTokenMiddleware, getAdminProfile);
adminRouter.get("/users", authenticateTokenMiddleware, adminOnly, getUsers);
adminRouter.post("/users", authenticateTokenMiddleware, adminOnly, addUser);
adminRouter.put("/users/:userId", authenticateTokenMiddleware, adminOnly, updateUser);
adminRouter.post("/users/delete", authenticateTokenMiddleware, adminOnly, deleteUsers);
adminRouter.post("/users/suspend", authenticateTokenMiddleware, adminOnly, suspendUsers);

adminRouter.delete("/events/delete", authenticateTokenMiddleware, adminOnly, deleteEvents);
adminRouter.post(
  "/addEvents",
  authenticateTokenMiddleware,
  adminOnly,
  upload.array("pictures", 10),
  addEvent,
);
adminRouter.post(
  "/events/:eventId/invitation",
  authenticateTokenMiddleware,
  adminOnly,
  createInvitation,
);
// eventRouter.js
adminRouter.post(
  "/events/:eventId/tickets",
  authenticateTokenMiddleware,
  adminOnly,
  createTickets,
);

// Analytics
adminRouter.get(
  "/analytics/dashboard",
  authenticateTokenMiddleware,
  get_dashboard_stats,
);
adminRouter.get("/analytics/transactions", getTransactionLedger);
adminRouter.get(
  "/analytics/transactions/:id",
  authenticateTokenMiddleware,
  get_transaction_by_id,
);
adminRouter.get(
  "/analytics/revenue",
  authenticateTokenMiddleware,
  get_revenue_history,
);
adminRouter.get("/events", authenticateTokenMiddleware, getEvents);

export default adminRouter;
