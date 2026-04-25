import express from "express";
import {
  get_users,
  delete_users,
  suspend_users,
  delete_events,
  add_event,
  add_user,
  update_user,
} from "../controllers/adminController.js";
import { 
  get_dashboard_stats, 
  get_transaction_ledger, 
  get_revenue_history 
} from "../controllers/analyticsController.js";

const adminRouter = express.Router();

adminRouter.get("/users", get_users);
adminRouter.post("/users", add_user);
adminRouter.put("/users/:userId", update_user);
adminRouter.post("/users/delete", delete_users); 
adminRouter.post("/users/suspend", suspend_users);

adminRouter.post("/events/delete", delete_events);
adminRouter.post("/events", add_event);

// Analytics
adminRouter.get("/analytics/dashboard", get_dashboard_stats);
adminRouter.get("/analytics/transactions", get_transaction_ledger);
adminRouter.get("/analytics/revenue", get_revenue_history);

export default adminRouter;
