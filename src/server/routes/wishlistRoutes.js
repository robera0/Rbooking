import express from "express";
import { get_wishlist } from "../controllers/wishlistConroller";
import Wishlist from "@/Client/user/Wishlist";

wishlistrouter = express.Router();

Wishlist.get("/wishlist", get_wishlist);

export default wishlistrouter;
