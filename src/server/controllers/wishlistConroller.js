import { wishlistModel } from "../models/Wishlist";

export const get_wishlist = async (req, res) => {
  const userId = req.params._id;
  const wishlist = await wishlistModel.findOne({ userId }).populate("events");
  try {
    res.status(200).json({ wishlists: wishlist });
  } catch {
    res
      .status(401)
      .json({ message: "No events with the wishlist with this  id " });
  }
};
