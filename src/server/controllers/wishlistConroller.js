import { wishlistModel } from "../models/Wishlist.js";

export const get_wishlist = async (req, res) => {
  try {
    const userId = req.user.id;

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
