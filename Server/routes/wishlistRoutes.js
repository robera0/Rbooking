import express from "express";
import {
  add_wishlist,
  get_wishlist,
  remove_wishlist,
} from "../controllers/wishlistConroller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const wishlistrouter = express.Router();

wishlistrouter.get("/wishlist", authenticateTokenMiddleware, get_wishlist);
wishlistrouter.post("/wishlist/add", authenticateTokenMiddleware, add_wishlist);
wishlistrouter.post(
  "/wishlist/remove",
  authenticateTokenMiddleware,
  remove_wishlist,
);

export default wishlistrouter;
