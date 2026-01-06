import express from "express";
import { get_wishlist } from "../controllers/wishlistConroller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const wishlistrouter = express.Router();

wishlistrouter.get("/wishlist", authenticateTokenMiddleware, get_wishlist);

export default wishlistrouter;
