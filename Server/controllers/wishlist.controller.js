import mongoose from "mongoose";
import redisClient, { clearWishListCache, REDIS_PREFIX } from "../config/redis.js";
import whishListService from "../service/wishlist.service.js";
import catchAsync from "../errors/catchAsync.js";
import AppError from "../errors/AppError.js";

/*  GET WISHLIST  */

export const getWishlist = catchAsync(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const cacheKey = `${REDIS_PREFIX}user:wishlist:${userId}`;
  const cachedWishlist = await redisClient.smembers(cacheKey);
  if (cachedWishlist && cachedWishlist.length > 0) {
    const populatedItems = await whishListService.findOne(userId);
    // Refresh the cache rolling TTL (1 hour) to keep active users warm
    await redisClient.expire(cacheKey, 3600);
    return res.status(200).json({
      success: true,
      wishlist: populatedItems,
      source: "cache-hit (populated from DB)",
    });
  }
  const wishlist = await whishListService.findOne(userId);

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
  console.log(updatedWishlist);
  await clearWishListCache(userId);
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
  await clearWishListCache(userId);
  res.status(200).json({
    message: "Removed from wishlist",
    wishlist: updatedWishlist,
  });
});
