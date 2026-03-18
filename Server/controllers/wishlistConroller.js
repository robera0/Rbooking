import { wishlistModel } from "../models/Wishlist.js";
import mongoose from "mongoose";

export const get_wishlist = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log(userId);
    const wishlist = await wishlistModel.findOne({ userId }).populate({
      path: "events",
      select: "name price date locale pictures priceRanges.min",
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found for this user",
      });
    }

    console.log("the wishlist is ", wishlist);
    res.status(200).json({ wishlists: wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching wishlist",
    });
  }
};

export const add_wishlist = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const events = new mongoose.Types.ObjectId(req.body.events);

    const newWishlist = await wishlistModel.findOneAndUpdate(
      { userId },
      { $addToSet: { events: events } },
      { new: true, upsert: true },
    );

    if (!newWishlist) {
      return res.status(404).json({
        message: "newWishlist not added bc user was not found",
      });
    }

    console.log("the wishlist added is ", newWishlist);
    res.status(200).json({ wishlists: newWishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const remove_wishlist = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const eventId = new mongoose.Types.ObjectId(req.body.events);

    const updatedWishlist = await wishlistModel.findOneAndUpdate(
      { userId },
      { $pull: { events: eventId } },
      { new: true },
    );

    if (!updatedWishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    res.status(200).json({
      message: "Event removed successfully",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
