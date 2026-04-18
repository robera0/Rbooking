import express from "express";
import {
  get_users,
  delete_users,
  suspend_users,
  delete_events,
  add_event,
  add_user,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/users", get_users);
adminRouter.post("/users", add_user);
adminRouter.post("/users/delete", delete_users); 
adminRouter.post("/users/suspend", suspend_users);

adminRouter.post("/events/delete", delete_events);
adminRouter.post("/events", add_event);

export default adminRouter;
