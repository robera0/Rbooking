import mongoose from "mongoose";
import redisClient, {
  clearWishListCache,
  REDIS_PREFIX,
} from "../config/redis.js";
import whishListService from "../service/wishlist.service.js";
import catchAsync from "../errors/catchAsync.js";
import AppError from "../errors/AppError.js";

/*  GET WISHLIST  */

export const getWishlist = catchAsync(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const cacheKey = `${REDIS_PREFIX}user:wishlist:${userId}`;

  let cachedWishlist = [];

  try {
    cachedWishlist = await redisClient.smembers(cacheKey);
  } catch (error) {
    console.log("Redis unavailable, using database:", error.message);
  }

  if (cachedWishlist.length > 0) {
    const populatedItems = await whishListService.findOne(userId);

    return res.status(200).json({
      success: true,
      wishlist: populatedItems,
      source: "cache-hit",
    });
  }

  const wishlist = await whishListService.findOne(userId);

  if (!wishlist) {
    return res.status(404).json({
      message: "Wishlist not found",
    });
  }

  // Try to cache, but don't fail the request if Redis is unavailable
  try {
    const itemIdsToCache = (wishlist.items || [])
      .map((item) => item?.eventId?._id?.toString())
      .filter(Boolean);

    if (itemIdsToCache.length > 0) {
      const pipeline = redisClient.pipeline();

      pipeline.sadd(cacheKey, ...itemIdsToCache);
      pipeline.expire(cacheKey, 3600);

      await pipeline.exec();
    } else {
      await redisClient.unlink(cacheKey);
    }
  } catch (error) {
    console.log("Could not update Redis cache:", error.message);
  }

  return res.status(200).json({
    success: true,
    wishlist,
    source: "database",
  });
});

/*  ADD TO WISHLIST  */

export const addWishlist = catchAsync(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const eventId = new mongoose.Types.ObjectId(req.body.eventId);

  const ticketId = new mongoose.Types.ObjectId(req.body.ticketId);

  const updatedWishlist = await whishListService.findOneAndUpdate(
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

  try {
    await clearWishListCache(userId);
  } catch (error) {
    console.log(
      "Redis unavailable, wishlist cache not cleared:",
      error.message,
    );
  }
  res.status(200).json({
    message: "Added to wishlist",
    wishlist: updatedWishlist,
  });
});

/*  REMOVE FROM WISHLIST  */

export const removeWishlist = catchAsync(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const ticketId = new mongoose.Types.ObjectId(req.body.ticketId);

  const updatedWishlist = await whishListService.findOneAndUpdate(
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
    next(new AppError("whishlist not found", 404));
  }
  try {
    await clearWishListCache(userId);
  } catch (error) {
    console.log(
      "Redis unavailable, wishlist cache not cleared:",
      error.message,
    );
  }
  res.status(200).json({
    message: "Removed from wishlist",
    wishlist: updatedWishlist,
  });
});
