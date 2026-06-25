import express from "express";
import {
  getAdminProfile,
  deleteUsers,
  suspendUsers,
  deleteEvents,
  addUser,
  updateUser,
} from "../controllers/admin.controller.js";
import {
  get_dashboard_stats,
  get_transaction_ledger,
  get_transaction_by_id,
  get_revenue_history,
  getEvents,
} from "../controllers/analytics.controller.js";
import { upload, addEvent } from "../controllers/events.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const adminRouter = express.Router();

adminRouter.get("/admin_users", authenticateTokenMiddleware, getAdminProfile);
adminRouter.post("/users", authenticateTokenMiddleware, addUser);
adminRouter.put("/users/:userId", authenticateTokenMiddleware, updateUser);
adminRouter.post("/users/delete", authenticateTokenMiddleware, deleteUsers);
adminRouter.post("/users/suspend", authenticateTokenMiddleware, suspendUsers);

adminRouter.post("/events/delete", authenticateTokenMiddleware, deleteEvents);
adminRouter.post(
  "/addEvents",
  upload.array("pictures", 10),
  authenticateTokenMiddleware,
  addEvent,
);

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
adminRouter.get("/events", authenticateTokenMiddleware, getEvents);

export default adminRouter;
