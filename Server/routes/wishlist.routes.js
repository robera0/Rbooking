import express from "express";
import {
  addWishlist,
  getWishlist,
  removeWishlist,
} from "../controllers/wishlist.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const wishlistRouter = express.Router();

wishlistRouter.get("/wishlist", authenticateTokenMiddleware, getWishlist);
wishlistRouter.post("/wishlist/add", authenticateTokenMiddleware, addWishlist);
wishlistRouter.post(
  "/wishlist/remove",
  authenticateTokenMiddleware,
  removeWishlist,
);

export default wishlistRouter;
