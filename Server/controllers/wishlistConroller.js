import { wishlistModel } from "../models/Wishlist.js";
import mongoose from "mongoose";
import redisClient, { clearWishListCache } from "../config/redis.js";

/*  GET WISHLIST  */

export const get_wishlist = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const cacheKey = `user:wishlist:${userId}`;
    const cachedWishlist = await redisClient.smembers(cacheKey);
    if (cachedWishlist && cachedWishlist.length > 0) {
      const populatedItems = await wishlistModel.findOne({ userId }).populate([
        {
          path: "items.eventId",
          select: "_id name date locale pictures priceRanges",
        },
        {
          path: "items.ticketId",
          select: "_id name price quantity availableSeats",
        },
      ]);

      // Refresh the cache rolling TTL (1 hour) to keep active users warm
      await redisClient.expire(cacheKey, 3600);
      return res.status(200).json({
        success: true,
        wishlist: populatedItems,
        source: "cache-hit (populated from DB)",
      });
    }
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
    const itemIdsToCache = (wishlist?.items || [])
      .map((item) => item?.eventId?._id?.toString())
      .filter(Boolean);
    // write pipeline
    if (itemIdsToCache.length > 0) {
      const pipeline = redisClient.pipeline();
      pipeline.sadd(cacheKey, ...itemIdsToCache);
      pipeline.expire(cacheKey, 3600);
      await pipeline.exec();
    } else {
      await redisClient.unlink(cacheKey);
    }
    res.status(200).json({
      success: true,
      wishlist: wishlist,
      source: "database",
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    res.status(500).json({
      message: "Server error while fetching wishlist",
      error: error,
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
    await clearWishListCache(userId);
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
    await clearWishListCache(userId);
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
