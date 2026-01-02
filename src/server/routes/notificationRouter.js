import express from "express";
import { get_notification } from "../controllers/notificationController.js";

const notirouter = express.Router();

notirouter.get("/notifications", get_notification);

export default notirouter;
