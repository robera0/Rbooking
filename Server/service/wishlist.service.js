import { wishlistModel } from "../models/wishlist.model.js";
class whishListService {
  static async findOne(userId) {
    return await wishlistModel.findOne({ userId }).populate([
      {
        path: "items.eventId",
        select: "_id name date locale pictures priceRanges",
      },
      {
        path: "items.ticketId",
        select: "_id name price quantity availableSeats",
      },
    ]);
  }

  static async findOneAndUpdate(query, update, options = {}) {
    return await wishlistModel.findOneAndUpdate(query, update, options);
  }
}

export default whishListService;
