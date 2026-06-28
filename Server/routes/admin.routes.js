import express from "express";
import {
  getAdminProfile,
  deleteUsers,
  suspendUsers,
  deleteEvents,
  addEvent,
  addUser,
  updateUser,
} from "../controllers/admin.controller.js";
import {
  get_dashboard_stats,
  get_transaction_ledger,
  get_transaction_by_id,
  get_revenue_history,
} from "../controllers/analytics.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const adminRouter = express.Router();

adminRouter.get("/admin_users", authenticateTokenMiddleware, getAdminProfile);
adminRouter.post("/users", authenticateTokenMiddleware, addUser);
adminRouter.put("/users/:userId", authenticateTokenMiddleware, updateUser);
adminRouter.post("/users/delete", authenticateTokenMiddleware, deleteUsers);
adminRouter.post("/users/suspend", authenticateTokenMiddleware, suspendUsers);

adminRouter.post("/events/delete", authenticateTokenMiddleware, deleteEvents);
adminRouter.post("/events", addEvent);

// Analytics
adminRouter.get(
  "/analytics/dashboard",
  authenticateTokenMiddleware,
  get_dashboard_stats,
);
adminRouter.get("/analytics/transactions", get_transaction_ledger);
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

export default adminRouter;
