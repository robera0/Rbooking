import React, { useState } from "react";
import { eventService } from "@/Context/ApiEvent";
import { Link } from "react-router-dom";
import { Star, Map, Heart, Share2 } from "lucide-react";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";
import { useService } from "@/Context/ServiceContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { EventLoader } from "@/components/Loader.jsx";
const Events = () => {
  const { events, isLoading, error, isFetching, wishlist, wishlistIsError } =
    eventService();

  const { type, setType } = useService();
  const { mutation: wishlistMutation } = useWishlistMutation();

  const [showFullName, setShowFullName] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);
  const filterButtons = [
    { name: "All", type: "" },
    { name: "Concert", type: "concert" },
    { name: "Festival", type: "festival" },
    { name: "Free", type: "free" },
  ];

  console.log(filterButtons);
  const checkWishlist = (eventId) => {
    return (
      wishlist?.wishlists?.events?.some((item) => item?._id === eventId) ||
      false
    );
  };

  const handleWishlistToggle = (eventId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyAdded = checkWishlist(eventId);

    wishlistMutation.mutate({
      event_id: eventId,
      isAdding: !isCurrentlyAdded,
    });
  };

  if (wishlistIsError && !hasAlerted) {
    toast.error("Login Required", {
      duration: 3000,
      position: "top-center",
    });
    setHasAlerted(true);
  }

  return (
    <div className="w-full flex flex-col mt-4 lg:mt-33 items-center space-y-8 lg:space-y-12">
      <p className="text-gray-400 text-sm mb-4">
        {" "}
        {events?.events?.length} events near you{" "}
      </p>{" "}
      {/* Search */}{" "}
      <div className="relative mb-4">
        {" "}
        <input
          type="text"
          placeholder="Search events..."
          className="w-full px-4 py-2 bg-[#2A2F34] text-white outline-none rounded-lg"
        />{" "}
      </div>{" "}
      {/* Filter chips */}{" "}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.isArray(filterButtons) &&
          filterButtons?.map((b, idx) => (
            <button
              key={idx}
              onClick={() => {
                setType(b.type);
              }}
              className={`px-3 py-1 ${b.type === type && "bg-[#FF7800] font-semibold"} bg-[#3F454B]  text-white rounded-full transition-ease-in duration-300`}
            >
              {" "}
              {b.name}
            </button>
          ))}
      </div>
      {/* LOADING ANIMATION */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center items-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: "linear",
              }}
              className="w-12 h-12 border-4 border-[#FF7800] border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Error */}
      {error && (
        <p className="text-red-500 font-semibold">
          {error?.message || "Something went wrong"}
        </p>
      )}
      {/* Events */}
      {!isLoading && (
        <div className="w-full flex flex-col lg:flex-row items-center gap-y-14 lg:pl-3 lg:gap-y-6 lg:gap-x-2 mb-12">
          {Array.isArray(events?.events) &&
            events.events.map((e) => {
              const isAdded = checkWishlist(e._id);

              return (
                <motion.div
                  key={e._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-[80%] lg:w-[85%] space-y-3"
                >
                  {/* Image Section */}
                  <Link
                    to={`/events/${e?._id}/tickets/${e.tickets?.[0]?._id}`}
                    className="w-full flex justify-center"
                  >
                    <div className="relative h-80 sm:h-96 lg:h-[500px] rounded-xl overflow-hidden">
                      <img
                        src={
                          e?.pictures?.[0] || e?.pictures?.[1] || "/Login.jpg"
                        }
                        alt={e?.name || "event image"}
                        className="w-full h-full object-cover rounded-xl"
                      />

                      {/* Location */}
                      <div className="absolute bottom-3 left-4 flex items-center bg-[#FF7800] text-white px-4 py-1 rounded-xl space-x-2">
                        <Map size={16} />
                        <span className="text-sm">
                          {e?.locale || "Unknown"}
                        </span>
                      </div>

                      {/* SOLD OUT */}
                      {e.tickets?.length === 0 && (
                        <div className="absolute top-3 right-4 bg-red-600 text-white text-sm px-4 py-1 rounded-lg font-semibold">
                          SOLD OUT
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex justify-between items-start px-2 mt-2">
                    <div className="flex-1 min-w-0 pr-4">
                      <h1
                        onClick={() => setShowFullName((prev) => !prev)}
                        className="text-lg lg:text-xl text-white font-semibold truncate"
                      >
                        {showFullName
                          ? e?.name
                          : e?.name?.length > 25
                            ? `${e?.name.slice(0, 25)}...`
                            : e?.name}
                      </h1>

                      {e.tickets?.length > 0 ? (
                        <p className="text-[#FF7800] text-sm">
                          <span className="font-bold">
                            ${e.tickets[0].price}
                          </span>{" "}
                          / per ticket
                        </p>
                      ) : (
                        <p className="text-red-500 text-sm font-semibold">
                          No tickets available
                        </p>
                      )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-white text-xl font-bold">
                          {e?.rating?.score || "0.0"}
                        </span>
                        <Star className="text-[#FF7800]" size={18} />
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={(ev) => handleWishlistToggle(e._id, ev)}
                          disabled={wishlistMutation.isLoading}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isAdded ? "bg-red-500" : "bg-neutral-700"
                          } ${
                            wishlistMutation.isLoading
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {wishlistMutation.isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Heart
                              size={16}
                              className={`text-white ${
                                isAdded ? "fill-white" : "fill-none"
                              }`}
                            />
                          )}
                        </button>

                        <button className="flex items-center px-2 py-1 bg-[#3F454B] text-white rounded-md">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Events;
