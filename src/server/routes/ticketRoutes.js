import express from "express";
import { get_tickets } from "../controllers/ticketController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const ticketrouter = express.Router();

ticketrouter.get("/tickets_home", authenticateTokenMiddleware, get_tickets);

export default ticketrouter;
