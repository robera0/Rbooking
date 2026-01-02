import express from "express";
import { get_wishlist } from "../controllers/wishlistConroller.js";

const wishlistrouter = express.Router();

wishlistrouter.get("/wishlist", get_wishlist);

export default wishlistrouter;
