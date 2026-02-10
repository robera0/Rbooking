import { Listbox } from "@headlessui/react";
import { useState } from "react";
import { Check, ChevronDown, Heart, Share2, MapPin, Star } from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { eventService } from "../../Context/ApiEvent";
import { useService } from "@/Context/ServiceContext";
import { Link } from "react-router-dom";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";

const Wishlist = () => {
  const options = [
    { id: 1, label: "Recently", value: "recently" },
    { id: 2, label: "Most Popular", value: "popular" },
    { id: 3, label: "Top Rated", value: "top" },
  ];

  const { mutation: wishlistMutation } = useWishlistMutation();
  const [selected, setSelected] = useState(null);
  const [hasAlerted, setHasAlerted] = useState(false);

  const { addFav } = useService();
  const { wishlist, wishlistError, wishlistLoading, wishlistIsError } =
    eventService();

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

  if (wishlistLoading) {
    return (
      <div className="pl-6">
        <div className="border border-gray-600/40 w-[97%] h-auto pl-4 pt-6 rounded-md">
          <h1 className="text-white text-2xl font-semibold">My Wishlist</h1>
          <div className="flex items-center justify-center h-64">
            <p className="text-white">Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get events or empty array
  const events = wishlist?.wishlists?.events || [];

  // Apply sorting if selected
  const sortedEvents = selected
    ? [...events].sort((a, b) => {
        switch (selected.value) {
          case "recently":
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case "popular":
            return (b.views || 0) - (a.views || 0);
          case "top":
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      })
    : events;

  return (
    <div className="pl-6">
      <Toaster position="top-center" />
      <div className="border border-gray-600/40 w-[97%] h-auto pl-4 pt-6 rounded-md space-y-4">
        <div className="flex justify-between items-center pr-4">
          <h1 className="text-white text-2xl font-semibold">My Wishlist</h1>
          {events.length > 0 && (
            <span className="text-gray-400 text-sm">
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          )}
        </div>
        <div className="w-full h-[0.3px] bg-gray-600" />

        {/* SORT */}
        <div>
          <Listbox value={selected} onChange={setSelected}>
            <div className="relative w-1/2">
              <Listbox.Button className="relative w-full h-10 cursor-pointer rounded-md border border-gray-600/40 bg-transparent text-white px-3 text-sm flex items-center justify-between outline-none">
                <span>{selected ? selected.label : "Sort by"}</span>
                <ChevronDown size={16} />
              </Listbox.Button>

              <Listbox.Options className="absolute z-10 mt-1 w-full rounded-md bg-[#222529] border border-gray-600/40 shadow-lg focus:outline-none">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    value={option}
                    className={({ active }) =>
                      `cursor-pointer px-3 h-10 flex items-center text-sm ${active ? "bg-orange-500 text-white" : "text-gray-200"}`
                    }
                  >
                    {({ selected }) => (
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {selected && <Check size={14} />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center pr-4">
            <Heart size={48} className="text-gray-500 mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-400 mb-6">
              Events you add to your wishlist will appear here
            </p>
            <Link to="/">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition-colors">
                Browse Events
              </button>
            </Link>
          </div>
        ) : (
          <div className="mb-12 space-y-6 pr-4">
            {sortedEvents.map((w) => {
              // Check if this event is being toggled
              const isMutating = wishlistMutation.variables?.event_id === w._id;
              const isAdded = checkWishlist(w._id);

              return (
                <div
                  key={w._id}
                  className="w-full rounded-2xl bg-[#191B1D] p-4 flex items-stretch gap-4 hover:bg-[#1e2023] transition-colors"
                >
                  {/* IMAGE SECTION */}
                  <div className="shrink-0">
                    <img
                      src={w?.pictures?.[0] || "/Login.jpg"}
                      alt={w?.name}
                      className="w-32 h-32 rounded-xl object-cover"
                    />
                  </div>

                  {/* INFO SECTION */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Rating */}
                      <div className="flex items-center gap-1 text-orange-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </div>

                      {/* Title */}
                      <h3 className="mt-2 text-sm font-semibold text-white truncate">
                        {w?.name}
                      </h3>

                      {/* Location */}
                      <div className="mt-1 w-42 flex items-center gap-1 text-gray-400 text-sm">
                        <MapPin size={14} />
                        <span>{w?.locale}</span>
                      </div>
                    </div>

                    {/* Price + Button */}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-white text-sm font-semibold whitespace-nowrap">
                        {w?.priceRanges?.[0]?.min || "Free"}
                        {w?.priceRanges?.[0]?.min && "Birr "}
                        <span className="text-gray-400 text-xs">/ day</span>
                      </p>
                      <Link
                        to={`/events/${w._id}`}
                        className="flex-1 max-w-[120px]"
                      >
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2 rounded-md transition-colors">
                          View
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* ACTIONS SECTION */}
                  <div className="shrink-0 flex flex-col gap-2">
                    <button
                      onClick={(e) => handleWishlistToggle(w._id, e)}
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
                          className={`text-white ${isAdded ? "fill-white" : "fill-none"}`}
                        />
                      )}
                    </button>
                    <button className="w-8 h-8 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors">
                      <Share2 size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
