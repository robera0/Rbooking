import { wishlistModel } from "../models/Wishlist.js";
import mongoose from "mongoose";

/*  GET WISHLIST  */

export const get_wishlist = async (req, res) => {
  console.log(req.user);
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const wishlist = await wishlistModel
      .findOne({ userId })

      .populate([
        {
          path: "items.eventId",
          select: "_id name date locale pictures priceRanges",
        },

        {
          path: "items.ticketId",
          select: "_id name price quantity availableSeats",
        },
      ]);

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    res.status(200).json({
      wishlist,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);

    res.status(500).json({
      message: "Server error while fetching wishlist",
    });
  }
};

/*  ADD TO WISHLIST  */

export const add_wishlist = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const eventId = new mongoose.Types.ObjectId(req.body.eventId);

    const ticketId = new mongoose.Types.ObjectId(req.body.ticketId);

    const updatedWishlist = await wishlistModel.findOneAndUpdate(
      { userId },

      {
        $addToSet: {
          items: {
            eventId,
            ticketId,
          },
        },
      },

      {
        new: true,
        upsert: true,
      },
    );

    res.status(200).json({
      message: "Added to wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.error("ADD WISHLIST ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*  REMOVE FROM WISHLIST  */

export const remove_wishlist = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const ticketId = new mongoose.Types.ObjectId(req.body.ticketId);

    const updatedWishlist = await wishlistModel.findOneAndUpdate(
      { userId },

      {
        $pull: {
          items: {
            ticketId,
          },
        },
      },

      {
        new: true,
      },
    );

    if (!updatedWishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    res.status(200).json({
      message: "Removed from wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.error("REMOVE WISHLIST ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
