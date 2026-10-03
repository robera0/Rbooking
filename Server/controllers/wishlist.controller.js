import mongoose from "mongoose";
import redisClient, { clearWishListCache, safeRedis, REDIS_PREFIX } from "../config/redis.js";
import whishListService from "../service/wishlist.service.js";
import catchAsync from "../errors/catchAsync.js";
import AppError from "../errors/AppError.js";

/*  GET WISHLIST  */

export const getWishlist = catchAsync(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const cacheKey = `${REDIS_PREFIX}user:wishlist:${userId}`;
  const cachedWishlist = await safeRedis(() => redisClient.smembers(cacheKey), []);
  if (cachedWishlist && cachedWishlist.length > 0) {
    const populatedItems = await whishListService.findOne(userId);
    // Refresh the cache rolling TTL (1 hour) to keep active users warm
    await safeRedis(() => redisClient.expire(cacheKey, 3600));
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
  const itemIdsToCache = (wishlist?.items || [])
    .map((item) => item?.eventId?._id?.toString())
    .filter(Boolean);
  // write pipeline
  if (itemIdsToCache.length > 0) {
    await safeRedis(() => {
      const pipeline = redisClient.pipeline();
      pipeline.sadd(cacheKey, ...itemIdsToCache);
      pipeline.expire(cacheKey, 3600);
      return pipeline.exec();
    });
  } else {
    await safeRedis(() => redisClient.unlink(cacheKey));
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

  if (
    !mongoose.Types.ObjectId.isValid(req.body.eventId) ||
    !mongoose.Types.ObjectId.isValid(req.body.ticketId)
  ) {
    return next(new AppError("A valid eventId and ticketId are required", 400));
  }
  const eventId = new mongoose.Types.ObjectId(req.body.eventId);
  const ticketId = new mongoose.Types.ObjectId(req.body.ticketId);

  // One entry per event: drop any earlier entry for it (it may point at a
  // different ticket tier) before adding, so the same event can't be saved
  // twice and removal by event always finds it.
  await whishListService.findOneAndUpdate(
    { userId },
    { $pull: { items: { eventId } } },
    { new: true },
  );

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

  const { eventId, ticketId } = req.body;
  if (
    !mongoose.Types.ObjectId.isValid(eventId) &&
    !mongoose.Types.ObjectId.isValid(ticketId)
  ) {
    return next(new AppError("An eventId or ticketId is required", 400));
  }

  // Match by event when we have one: the client may send a different ticket
  // tier than the one that was saved, which used to make removal a silent
  // no-op.
  const pullFilter = mongoose.Types.ObjectId.isValid(eventId)
    ? { eventId: new mongoose.Types.ObjectId(eventId) }
    : { ticketId: new mongoose.Types.ObjectId(ticketId) };

  const updatedWishlist = await whishListService.findOneAndUpdate(
    { userId },

    {
      $pull: {
        items: pullFilter,
      },
    },

    {
      new: true,
    },
  );

  if (!updatedWishlist) {
    return next(new AppError("whishlist not found", 404));
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
