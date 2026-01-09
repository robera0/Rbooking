import { Listbox } from "@headlessui/react";
import { useState } from "react";
import { Check, ChevronDown, Heart, Share2, MapPin, Star } from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { eventService } from "../../Context/ApiEvent";
import { labelWeekNumber } from "react-day-picker";
const Wishlist = () => {
  const options = [
    { id: 1, label: "Recently", value: "recently" },
    { id: 2, label: "Most Popular", value: "popular" },
    { id: 3, label: "Top Rated", value: "top" },
  ];

  const [selected, setSelected] = useState(null);
  const [hasAlerted, setHasAlerted] = useState(false);

  const { wishlist, wishlistError, wishlistLoading, wishlistIsError } =
    eventService();

  if (wishlistIsError && !hasAlerted) {
    toast.error("Login Required", {
      duration: 3000,
      position: "top-center",
      className:
        "bg-red-500 text-white font-bold py-3 px-4 rounded-none  text-center shadow-lg",
    });

    setHasAlerted(true);
  }

  if (wishlistLoading) return <p className="text-white">Loading tickets...</p>;
  return (
    <div className="pl-6">
      <Toaster position="top-center" />
      <div className="border border-gray-600/40 w-[97%] h-auto pl-4 pt-6 rounded-md space-y-4">
        <div>
          <h1 className="text-white text-2xl font-semibold">My Wishlist</h1>
        </div>
        <div className="w-full h-[0.3px] bg-gray-600 " />
        {/*SORT  */}
        <div>
          <Listbox value={selected} onChange={setSelected}>
            <div className="relative w-1/2">
              {/* Button */}
              <Listbox.Button
                className="
            relative w-full h-10 cursor-pointer
            rounded-md border border-gray-600/40
            bg-transparent text-white px-3 text-sm
            flex items-center justify-between outline-none
          "
              >
                <span>{selected ? selected.label : "Sort by"}</span>
                <ChevronDown size={16} />
              </Listbox.Button>

              {/* Options */}
              <Listbox.Options
                className="
            absolute z-10 mt-1 w-full
            rounded-md bg-[#222529]
            border border-gray-600/40
            shadow-lg focus:outline-none
          "
              >
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    value={option}
                    className={({ active }) =>
                      `
                cursor-pointer px-3 h-10
                flex items-center text-sm
                ${active ? "bg-orange-500 text-white" : "text-gray-200"}
                `
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

        <div className="mb-12 space-y-6 ">
          {wishlist?.wishlists?.events?.map((w) => (
            <div className="w-[98%] max-w-3xl rounded-2xl bg-[#191B1D] p-4 flex items-stretch gap-4 ">
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
                  <div className="mt-1 w-42  flex items-center gap-1 text-gray-400 text-sm">
                    <MapPin size={14} />
                    <span> {w?.locale}</span>
                  </div>
                </div>

                {/* Price + Button */}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-white text-sm font-semibold whitespace-nowrap">
                    {w?.priceRanges?.[0]?.min}
                    {"Birr "}
                    <span className="text-gray-400 text-xs">/ day</span>
                  </p>

                  <button className="bg-orange-500 text-white text-xs px-4 py-2 rounded-md whitespace-nowrap">
                    View ticket
                  </button>
                </div>
              </div>

              {/* ACTIONS SECTION (LOCKED) */}
              <div className="shrink-0 flex justify-between    h-12 gap-2">
                <button className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <Heart size={16} className="text-white" />
                </button>
                <button className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                  <Share2 size={16} className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      ;
    </div>
  );
};

export default Wishlist;
