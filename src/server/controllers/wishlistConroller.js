import { wishlistModel } from "../models/Wishlist.js";

export const get_wishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await wishlistModel.findOne({ userId });
    res.status(200).json({ wishlists: wishlist });
  } catch {
    res
      .status(401)
      .json({ message: "No events with the wishlist with this  id " });
  }
};
