import express from "express";
import {
  add_wishlist,
  get_wishlist,
  remove_wishlist,
} from "../controllers/wishlist.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const wishlistRouter = express.Router();

wishlistRouter.get("/wishlist", authenticateTokenMiddleware, get_wishlist);
wishlistRouter.post("/wishlist/add", authenticateTokenMiddleware, add_wishlist);
wishlistRouter.post(
  "/wishlist/remove",
  authenticateTokenMiddleware,
  remove_wishlist,
);

export default wishlistRouter;
