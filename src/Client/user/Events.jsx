import React from "react";
import { eventService } from "@/Context/ApiEvent";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Map, Heart, Share2 } from "lucide-react";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";
import { useService } from "@/Context/ServiceContext.jsx";
import { useMutation } from "@tanstack/react-query";
const Events = () => {
  const { events, isLoading, error, wishlist, wishlistIsError } =
    eventService();
  const { addFav, setAddFav } = useService();
  const [dateSlide, setDateSlide] = useState(false);
  const [showFullName, setShowFullName] = useState(false);
  const [date, setDate] = useState(null);
  const { mutation: wishlistMutation } = useWishlistMutation();
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
      className:
        "bg-red-500 text-white font-bold py-3 px-4 rounded-none text-center shadow-lg",
    });
    setHasAlerted(true);
  }

  return (
    <div>
      <div className="w-full flex flex-col mt-4 lg:mt-33 items-center space-y-8 lg:space-y-12">
        <p className="text-gray-400 text-sm mb-4">
          {events?.events?.length} events near you
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search events..."
            className="w-full px-4 py-2 bg-[#2A2F34] text-white outline-none rounded-lg"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="px-3 py-1 bg-[#3F454B] text-white rounded-full">
            Music
          </button>
          <button className="px-3 py-1 bg-[#3F454B] text-white rounded-full">
            Sports
          </button>
          <button className="px-3 py-1 bg-[#3F454B] text-white rounded-full">
            Free
          </button>
        </div>

        {error && message?.error}

        <div className="w-full flex flex-col lg:flex-row items-center gap-y-14 lg:pl-3 sm:gap-y-12 lg:gap-y-6 lg:gap-x-2 mb-12">
          {Array.isArray(events?.events) &&
            events?.events?.map((e, idx) => {
              const isAdded = checkWishlist(e._id);
              return (
                <div className="w-[80%] lg:w-[85%] space-y-3">
                  {/* Image Section */}
                  <Link
                    key={idx}
                    to={`/events/${e?._id}/tickets/${e.tickets[0]?._id}`}
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

                      {/* Location badge */}
                      <div className="absolute bottom-3 left-4 flex items-center bg-[#FF7800] text-white px-4 py-1 rounded-xl space-x-2">
                        <Map size={16} />
                        <span className="text-sm">
                          {e?.locale || "Unknown"}
                        </span>
                      </div>

                      {/* SOLD OUT badge for events with no tickets */}
                      {e.tickets?.length === 0 && (
                        <div className="absolute top-3 right-4 bg-red-600 text-white text-sm px-4 py-1 rounded-lg font-semibold">
                          SOLD OUT
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Details Section - FIXED LAYOUT */}
                  <div className="flex justify-between items-start px-2 mt-2">
                    {/* Left: Event name and price */}
                    <div className="flex-1 min-w-0 pr-4">
                      <h1
                        onClick={() => setShowFullName(!showFullName)}
                        title={e?.name}
                        className="text-lg lg:text-xl text-white font-semibold truncate"
                      >
                        {showFullName
                          ? e?.name
                          : e?.name?.length > 25
                            ? `${e?.name.slice(0, 25)}...`
                            : e?.name}
                      </h1>
                      {e.tickets?.length > 0 ? (
                        <p className="text-[#FF7800] text-sm lg:text-md">
                          <span className="font-bold">
                            ${e.tickets[0].price}
                          </span>{" "}
                          / per ticket
                        </p>
                      ) : (
                        <p className="text-red-500 text-xs lg:text-md font-semibold">
                          No tickets available
                        </p>
                      )}
                    </div>

                    {/* Right: Rating + Action buttons */}
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      {/* Rating */}
                      <div className="flex items-center space-x-1">
                        <span className="text-white text-xl font-bold">
                          {e?.rating?.score || "0.0"}
                        </span>
                        <Star className="text-[#FF7800]" size={18} />
                      </div>

                      {/* Action buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={(ev) => handleWishlistToggle(e._id, ev)}
                          disabled={wishlistMutation.isLoading && isMutating}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isAdded
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-neutral-700 hover:bg-neutral-600"
                          } ${wishlistMutation.isLoading && isMutating ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {wishlistMutation.isLoading && isMutating ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Heart
                              size={16}
                              className={`text-white ${isAdded ? "text-white fill-white" : "text-white fill-none"}`}
                            />
                          )}
                        </button>
                        <button className="flex items-center px-2 py-1 bg-[#3F454B] text-white rounded-md">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Events;
