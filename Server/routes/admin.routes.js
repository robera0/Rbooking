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

const adminRouter = express.Router();

adminRouter.get("/admin_users", getAdminProfile);
adminRouter.post("/users", addUser);
adminRouter.put("/users/:userId", updateUser);
adminRouter.post("/users/delete", deleteUsers);
adminRouter.post("/users/suspend", suspendUsers);

adminRouter.post("/events/delete", deleteEvents);
adminRouter.post("/events", addEvent);

// Analytics
adminRouter.get("/analytics/dashboard", get_dashboard_stats);
adminRouter.get("/analytics/transactions", get_transaction_ledger);
adminRouter.get("/analytics/transactions/:id", get_transaction_by_id);
adminRouter.get("/analytics/revenue", get_revenue_history);

export default adminRouter;
