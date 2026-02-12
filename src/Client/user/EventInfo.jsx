import {
  SquarePen,
  MapPin,
  ClockFading,
  Heart,
  Share2,
  Ticket,
  Star,
  MoveRight,
  Puzzle,
  Shield,
  Search,
  CreditCard,
  ImageUp,
  ChevronDown,
  ArrowBigRight,
  ThumbsDown,
  ThumbsUp,
  CalendarIcon,
  ChevronUp,
  User,
  MapIcon,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useParams } from "react-router-dom";
import { Listbox } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Amenities } from "../../components/Reusable";
import { EventPolices } from "../../components/Reusable";
import { useLoaderData } from "react-router-dom";
import { useWishlistMutation } from "./api/addwishlist.api.jsx";
import { useState, useEffect } from "react";
import { useService } from "@/Context/ServiceContext";
import { eventService } from "@/Context/ApiEvent";
import { useMutation, useQuery, QueryClient } from "@tanstack/react-query";
import moment from "moment";
import { CalendarDemo } from "@/components/ui/calendar";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { add } from "date-fns";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    {
      headers: {
        "User-Agent": "Rbooking-App",
      },
    },
  );

  if (!res.ok) return null;
  return res.json();
};

const LocationMarker = ({ position, setPosition, setAddress }) => {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      setPosition([lat, lng]);

      const data = await reverseGeocode(lat, lng);
      if (data?.display_name) {
        setAddress(data.display_name);
      }
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>📍 Location selected</Popup>
    </Marker>
  ) : null;
};

const SearchButton = () => (
  <button className="w-12 h-12 lg:h-[55px] sm:w-[55px]  py-3 bg-[#FF7800] flex items-center justify-center text-lg text-white font-semibold rounded-full lg:hover:scale-95 transition-transform duration-200">
    <Search className="w-5 h-5" />
  </button>
);

const EventInfo = () => {
  const queryClient = new QueryClient();
  const progress = [100, 100, 100, 100, 50];
  const options = [
    { id: 1, label: 5, value: "5/5" },
    { id: 2, label: 5, value: "4/5" },
    { id: 3, label: 3, value: "3/5" },
    { id: 4, label: 2, value: "2/5" },
    { id: 4, label: 1, value: "1/5" },
    { id: 4, label: 0, value: "0/5" },
  ];

  const [selected, setSelected] = useState(null);
  const [dateSlide, setDateSlide] = useState(false);
  const [mapSlide, setMapSlide] = useState(false);
  const [dates, setDates] = useState(null);
  const [likeCount, setLikeCount] = useState(15);
  const [dislikeCount, setDislikeCount] = useState(2);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const {
    setEditMenuActive,
    setCheckoutOpen,
    checkoutOpen,
    addFav,
    setAddFav,
  } = useService();
  const [showFullName, setShowFullName] = useState(false);
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");

  const { mutation: wishlistMutation } = useWishlistMutation();

  const { fetchEventById, wishlist } = eventService();
  const { eventId, ticketId } = useParams();

  const [showMore, setShowMore] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const {
    data: event_id,
    event_idisLoading,
    isError,
  } = useQuery({
    queryKey: ["event", eventId, ticketId],
    queryFn: () => fetchEventById(eventId, ticketId),
  });

  const event = event_id?.event || null;
  const ticket = event_id?.ticket || null;

  const prices =
    event?.priceRanges?.length > 0
      ? event.priceRanges
      : ticket
        ? [
            {
              type: "General",
              currency: "USD",
              min: ticket.price,
              max: ticket.price,
            },
          ]
        : [];

  const standardTicket = prices.find((p) =>
    String(p.type || "")
      .toLowerCase()
      .includes("standard"),
  );

  const otherTickets = prices.filter((p) => p !== standardTicket);

  const handleCheckout = (ticket) => {
    setSelectedTicket(ticket);
    setCheckoutOpen(true);
  };

  const date = new Date(event?.dates?.start?.localDate || Date.now());
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const checkWishlist = () => {
    if (!event?._id || !wishlist) return false;
    return (
      wishlist?.wishlists?.events?.some((item) => item?._id === event?._id) ||
      false
    );
  };
  setAddFav(checkWishlist());
  const Maps = () => {
    return (
      <div className="w-full h-full">
        <MapContainer
          center={[9.03, 38.74]}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full rounded-lg shadow-md"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationMarker
            position={position}
            setPosition={setPosition}
            setAddress={setAddress}
          />
        </MapContainer>
      </div>
    );
  };

  // initialize counts from event when available
  useEffect(() => {
    if (!event) return;
    if (typeof event.likesCount === "number") setLikeCount(event.likesCount);
    if (typeof event.dislikesCount === "number")
      setDislikeCount(event.dislikesCount);
  }, [event]);

  const handleLikeToggle = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      if (disliked) {
        setDisliked(false);
        setDislikeCount((c) => Math.max(0, c - 1));
      }
    }
    // TODO: persist like/unlike to backend
  };

  const handleDislikeToggle = () => {
    if (disliked) {
      setDisliked(false);
      setDislikeCount((c) => Math.max(0, c - 1));
    } else {
      setDisliked(true);
      setDislikeCount((c) => c + 1);
      if (liked) {
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      }
    }
    // TODO: persist dislike/un-dislike to backend
  };

  return (
    <div className=" space-y-8 mb-12 lg:p-6">
      {/*EDIT BUTTON */}
      <div className="lg:hidden flex justify-center  ">
        <button
          onClick={() => setEditMenuActive(true)}
          className="flex text-white  font-semibold bg-[#FF7800] px-10 py-3 rounded-md space-x-2 lg:cursor-pointer"
        >
          <SquarePen />
          <span>Edit Search</span>
        </button>
      </div>

      <div className=" flex justify-center items-center ">
        <div className="hidden lg:block relative  w-full lg:w-[76%] z-10 flex sm:flex-col justify-center items-center space-y-4 lg:px-22 px-12 py-4">
          <div className="flex lg:px-4 flex-col lg:flex-row justify-center items-center w-full pt-6 text-white text-md font-light bg-[#191B1D] rounded-xl  lg:space-x-12 space-y-6">
            {/* Calendar Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDateSlide(!dateSlide);
              }}
              className="w-[80%] lg:w-[75%] flex justify-between items-center px-4 py-3 bg-[#6C6D6E] rounded-lg shadow-md"
            >
              <div className="flex items-center space-x-3">
                <CalendarIcon strokeWidth={1} className="text-white w-5 h-5" />
                <div className="flex flex-col">
                  {!dates ? (
                    <>
                      <span>Dates</span>
                      <span>All Dates</span>
                    </>
                  ) : (
                    <span className="text-[#FF7800] font-semibold">
                      {dates.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {dateSlide ? (
                <ChevronUp className="text-black" />
              ) : (
                <ChevronDown className="text-black" />
              )}
            </button>

            {/* CALENDAR PANEL */}
            <div
              className={`absolute left-8 top-[75px] w-[250px] bg-[#D9D9D9] rounded-lg overflow-hidden z-50 transition-[max-height] duration-500 ease-in-out ${
                dateSlide ? "max-h-[500px] mt-3" : "max-h-0 mt-0"
              }`}
            >
              <CalendarDemo
                mode="single"
                selected={dates}
                onSelect={setDates}
                buttonVariant="ghost"
                className="p-4 w-full bg-transparent rounded-xl shadow-lg text-black"
                classNames={{
                  day: "h-8 w-8 flex items-center justify-center rounded-lg hover:bg-orange-200",
                  month_caption:
                    "text-lg text-center font-semibold text-orange-500",
                  nav_button: "text-orange-500 hover:text-orange-700",
                }}
              />
            </div>

            {/* LOCATION INPUT */}
            <div className="relative w-[80%] lg:w-[75%] h-[4rem] bg-[#6C6D6E] rounded-lg shadow-md flex items-center px-4">
              <MapIcon strokeWidth={1} className="text-white w-6 h-6 mr-3" />
              <input
                type="text"
                placeholder="Location"
                className="flex-1 outline-none placeholder:text-white text-white font-light"
              />
            </div>

            {/* SEARCH INPUT */}
            <div className="relative w-[80%] lg:w-[75%] h-[4rem] bg-[#6C6D6E] rounded-lg shadow-md flex items-center px-4">
              <User strokeWidth={1} className="text-white w-6 h-6 mr-3" />
              <input
                type="text"
                placeholder="Artist, Event or Venue"
                className="flex-1 outline-none placeholder:text-white text-white font-light"
              />
            </div>

            {/* MAIN SEARCH BUTTON */}
            <div className="md:hidden lg:flex items-center lg:mb-8  md:ml-12 ml-6">
              <SearchButton />
            </div>
          </div>
        </div>
      </div>

      {/*HEADER */}
      <div className="flex flex-col pl-6 lg:pl-12 space-y-4  ">
        <div className="flex flex-col space-y-2">
          {/* Event name and date */}
          <div className="flex flex-wrap space-y-2 justify-between items-center">
            {/* MOBILE ONLY */}
            <h1
              className="block lg:hidden text-white text-lg font-semibold cursor-pointer"
              onClick={() => setShowFullName(!showFullName)}
              title={event?.name}
            >
              {showFullName
                ? event?.name
                : event?.name?.length > 25
                  ? `${event?.name.slice(0, 25)}...`
                  : event?.name}
            </h1>

            {/* DESKTOP ONLY */}
            <h1
              className="hidden lg:block text-white lg:text-2xl font-semibold"
              title={event?.name}
            >
              {event?.name}
            </h1>

            <div className="inline-flex items-center mr-3 space-x-2 px-3 py-1 bg-[#3F454B] text-sm text-white rounded-md">
              <ClockFading className="w-5 h-5" />
              <span>{formatted}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (!mapSlide) {
                  setMapSlide(true);
                } else {
                  setMapSlide(false);
                }
              }}
            >
              <MapPin className="w-5 h-5 text-white" />
            </button>

            <p className=" text-[#808080] text-sm truncate max-w-1/2">
              {address || event?.locale}
            </p>
          </div>
          <div>
            {!mapSlide && (
              <p className=" text-[#808080] text-sm  max-w-full">
                click the map icon to see the full map
              </p>
            )}
          </div>
          <AnimatePresence>
            {mapSlide && (
              <motion.div
                initial={{ opacity: 0, y: -30, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -30, height: 0 }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                }}
                className="space-y-4 overflow-hidden"
              >
                <div className="w-[90%]  h-62 p-5 rounded-xl space-y-2">
                  <Maps />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end mr-12 space-x-2">
          <div className=" flex  space-x-2  items-center px-2 py-1 bg-[#3F454B] text-white rounded-md">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                wishlistMutation.mutate({
                  event_id: event?._id,
                  isAdding: !addFav,
                });
              }}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  addFav ? "text-white fill-white" : "text-white fill-none"
                }`}
              />
            </button>
          </div>

          <div className=" flex  space-x-2  items-center px-2 py-1 bg-[#3F454B] text-white rounded-md">
            <Share2 className="text-white flex text-center w-5 h-5" />
          </div>
        </div>
        {/*EVENT IMAGES */}

        <div className="space-y-4  flex lg:flex-row flex-col">
          <div className="w-full ">
            <div className="w-[90%] lg:w-[95%]  rounded-2xl overflow-hidden">
              <img
                src={event?.pictures?.[0] || "/1308183.jpeg"}
                alt={event?.name || "Event image"}
                className="w-full h-[350px] lg:h-[450px] object-cover"
              />
            </div>
          </div>
          <div className="w-full space-y-3">
            {/*TOP IMAGE  */}
            <div className="w-full">
              <div className="w-[90%] rounded-2xl overflow-hidden">
                <img
                  src={event?.pictures?.[1] || "/1308183.jpeg"}
                  alt={event?.name || "Event image"}
                  className="w-full h-[200px] lg:h-[150px] object-cover object-center"
                />
              </div>
            </div>

            <div className="w-full lg:flex space-y-3 lg:space-x-4">
              <div className="w-[90%] rounded-2xl overflow-hidden">
                <img
                  src={event?.pictures?.[2] || "/1308183.jpeg"}
                  alt={event?.name || "Event image"}
                  className="w-full h-[200px] lg:h-[290px] object-cover"
                />
              </div>

              <div className="w-[90%] rounded-2xl overflow-hidden relative">
                {/* Image */}
                <img
                  src="/1308183.jpeg"
                  alt="Login"
                  className="w-full h-[200px] object-cover"
                />

                {/* Overlay */}
                <div className="absolute  flex  justify-center items-center inset-0 bg-black/60 ">
                  <button className="text-white">View More</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*TICKET */}
        <div className="space-y-6">
          {standardTicket && (
            <div className="bg-[#191B1D] w-[90%] p-5 rounded-xl space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <h2 className="text-[#808080] font-semibold">
                    {standardTicket?.type}
                  </h2>

                  <h1 className="text-xl text-white font-bold">
                    {standardTicket?.min} {standardTicket?.currency}
                  </h1>
                </div>

                <Ticket className="w-12 h-12 text-[#34C759]" />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MoveRight className="text-white w-4" />

                  <h3 className="text-white font-bold">
                    {event?.rating?.score ?? "-"}
                  </h3>

                  <span className="flex gap-1 text-orange-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <MoveRight className="text-white w-4" />
                  <h3 className="text-[#808080] font-bold">
                    No Specific Offers
                  </h3>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                {!showMore ? (
                  <button
                    onClick={() => setShowMore(true)}
                    className="text-white font-semibold bg-[#FF9A41] px-8 py-3 rounded-2xl hover:scale-105 transition"
                  >
                    View More Tickets
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(standardTicket)}
                    className="text-white font-semibold bg-[#FF9A41] px-8 py-3 rounded-2xl hover:scale-105 transition"
                  >
                    Get Ticket
                  </button>
                )}
              </div>
            </div>
          )}

          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 overflow-hidden"
              >
                {otherTickets.map((ticket, idx) => (
                  <div
                    key={idx}
                    className="bg-[#191B1D] w-[90%] p-5 rounded-xl space-y-4"
                  >
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <h2 className="text-[#808080] font-semibold">
                          {ticket?.type}
                        </h2>

                        <h1 className="text-xl text-white font-bold">
                          {ticket?.min || ticket?.max} {ticket?.currency}
                        </h1>
                      </div>

                      <Ticket className="w-12 h-12 text-orange-500" />
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MoveRight className="text-white w-4" />

                        <h3 className="text-white font-bold">
                          {event?.rating?.score ?? "-"}
                        </h3>

                        <span className="flex gap-1 text-orange-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MoveRight className="text-white w-4" />
                        <h3 className="text-[#808080] font-bold">
                          No Specific Offers
                        </h3>
                      </div>
                    </div>

                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => handleCheckout(ticket)}
                        className="text-white font-semibold bg-[#FF9A41] px-8 py-3 rounded-2xl hover:scale-105 transition"
                      >
                        Get Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Debug Checkout */}
          {checkoutOpen && (
            <div className="text-white mt-6">
              Selected: {selectedTicket?.type} —{" "}
              {selectedTicket?.min || selectedTicket?.max}{" "}
              {selectedTicket?.currency}
            </div>
          )}
        </div>

        <div className="mt-12 space-y-12">
          {/*ABOUT THE EVENT */}
          <div className="space-y-4">
            <div>
              <h1 className="text-white text-2xl font-semibold">
                About This Event
              </h1>
            </div>
            <div className="w-[80%] h-[0.3px] bg-gray-600 " />
            <p className="w-[90%] text-[#808080] text-sm leading-6">
              {event?.desc}
            </p>
          </div>
          {/*AMENITIES */}
          <div className="space-y-4">
            <div className="space-y-4">
              <h1 className="text-white text-2xl font-semibold">Amenities</h1>
              <div className="w-[80%] h-[0.3px] bg-gray-600 " />
            </div>
            <div className="space-y-8">
              {event?.amenities &&
                Object.entries(event.amenities).map(([category, list]) => (
                  <Amenities
                    key={category}
                    header={
                      category.charAt(0).toUpperCase() + category.slice(1)
                    } // Capitalize
                    icon={Puzzle}
                    lists={Array.isArray(list) ? list : []}
                  />
                ))}
            </div>
          </div>

          {/*CUSTOMER REVIEW */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-white text-2xl font-semibold">
                Customer Reviews
              </h1>
              <div className="w-[80%] h-[0.3px] bg-gray-600 " />
            </div>

            {/*REVIEW CARD */}
            <div className="space-y-4">
              <div className=" flex flex-col items-center p-6 w-[90%]  h-82 bg-[#2A2C31] rounded-xl gap-6">
                <div className=" flex flex-col items-center space-y-2">
                  <h1 className=" text-white text-2xl font-bold">
                    {event?.rating?.score ?? "-"}
                  </h1>
                  <p className="w-full text-[#808080] text-sm ">
                    Based on 120 Reviews{" "}
                  </p>

                  <span className="flex gap-1 text-orange-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </span>
                </div>

                {/*PROGRESS BAR */}
                <div className="w-full space-y-4">
                  {progress?.map((p, idx) => (
                    <div
                      className="w-full flex justify-center items-center space-x-8"
                      key={idx}
                    >
                      <div className=" w-[80%] h-2 bg-[#202020] rounded-md overflow-hidden ">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p}%` }}
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                          }}
                          className="h-full bg-[#FF9D46] rounded-md"
                        />
                      </div>
                      <p className="flex-1 text-white text-md  font-semibold ">
                        {p}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/*RATING OPTIONS */}

              <div className="  space-x-8 w-[90%] h-12 pl-4 bg-[#2A2C31] rounded-md gap-6">
                <div className="w-full h-full flex">
                  <Listbox value={selected} onChange={setSelected}>
                    <div className="relative w-full">
                      {/* Button */}
                      <Listbox.Button
                        className="
                            relative w-full h-full cursor-pointer
                            rounded-md 
                            bg-transparent text-white px-3 text-md
                            flex items-center justify-between outline-none
                          "
                      >
                        <span>
                          {selected ? selected.value : options[0]?.value}
                        </span>
                        <ChevronDown className="mr-6 text-center w-6 h-6" />
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
                                ${
                                  active
                                    ? "bg-orange-500 text-white"
                                    : "text-gray-200"
                                }
                                `
                            }
                          >
                            {({ selected }) => (
                              <div className="flex items-center justify-between w-full">
                                <span className="flex">
                                  {" "}
                                  {[...Array(option.id)].map((_, i) => (
                                    <Star key={i} size={14} />
                                  ))}
                                </span>
                                <span className="mr-8">
                                  {" "}
                                  {selected && option?.value}
                                </span>
                              </div>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>

              {/*REVIEW INPUT */}
              <div className="w-[90%] h-42 bg-[#2A2C31] flex  rounded-xl p-3  ">
                <div>
                  <textarea
                    className="w-full h-full bg-transparent text-white placeholder:text-[#808080] resize-none outline-none"
                    placeholder="Your review"
                  />
                </div>

                <div className="flex justify-end items-end space-x-5">
                  <ImageUp className="text-white w-6 h-6" />
                  <ImageUp className="text-white w-6 h-6" />
                  <ImageUp className="text-white w-6 h-6" />
                </div>
              </div>
              <button
                className="flex mt-8 items-center justify-between w-[150px] px-4 py-3  mt-5
             bg-[#FF7800] text-md text-white font-semibold rounded-xl 
             transition-transform duration-200 cursor-pointer 
             lg:hover:scale-95 active:scale-90"
              >
                <span>Post review</span>
                <ArrowBigRight className="w-4 h-4" />
              </button>

              {/*OTHERS COMMENT SECTION */}
              <div className="w-full mt-8 space-y-6 bg-[#222529] p-4 rounded-md">
                {event?.comments?.length === 0 && (
                  <p className="text-gray-400 text-center">No comments yet.</p>
                )}

                {/* Flatten all comments */}
                {event?.comments
                  ?.flatMap((commentDoc) =>
                    (commentDoc.comment || []).map((c) => ({
                      ...c,
                      rating: commentDoc.rating,
                      createdAt: commentDoc.createdAt,
                    })),
                  )
                  .map((comment, idx) => (
                    <div
                      key={comment._id || idx}
                      className="flex items-start gap-3"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={
                            comment.userId?.avatarUrl || "/defaultAvater.jpg"
                          }
                          alt={comment.userId?.fullName || "User"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Comment content */}
                      <div className="flex-1">
                        {/* Name + rating inline */}
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white text-base">
                            {comment.userId?.fullName || "User Name"}
                          </h3>

                          {/* Rating next to name */}
                          {comment.rating && (
                            <span className="inline-block px-2 py-0.5 text-sm font-bold text-white bg-yellow-500 rounded">
                              {comment.rating}
                            </span>
                          )}
                        </div>

                        {/* Date under the name */}
                        <p className="text-sm text-gray-400 mt-1">
                          {moment(comment.createdAt).fromNow()}
                        </p>

                        {/* Comment text */}
                        <p className="text-gray-300 text-base mt-2">
                          {comment.text || "—"}
                        </p>

                        {/* Like/Dislike */}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <button
                            onClick={() => handleLikeToggle(comment._id)}
                            className={`flex items-center gap-1 ${
                              liked[comment._id]
                                ? "text-orange-400"
                                : "hover:text-orange-400"
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>{likeCount[comment._id] || 0}</span>
                          </button>

                          <button
                            onClick={() => handleDislikeToggle(comment._id)}
                            className={`flex items-center gap-1 ${
                              disliked[comment._id]
                                ? "text-red-500"
                                : "hover:text-red-500"
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span>{dislikeCount[comment._id] || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-center">
                <button
                  className="flex items-center justify-center w-[150px] px- py-2  mt-5
             bg-[#FF9A41] text-md text-white font-semibold rounded-md 
             transition-transform duration-200 lg:cursor-pointer 
             lg:hover:scale-95 active:scale-90"
                >
                  <span>Load More</span>
                </button>
              </div>

              {/*EVENT POLICES  */}

              <div className="space-y-6 mt-12">
                <div className="space-y-4">
                  <h1 className="text-white text-2xl font-semibold">
                    Event Policies
                  </h1>
                  <div className="w-[80%] h-[0.3px] bg-gray-600 " />
                </div>
                <EventPolices
                  header={"Refund & Cancellation Policy"}
                  des={
                    "Attendees must cancel at least 24–48 hours before the event to receive a refund. No refunds will be issued for late cancellations or no-shows."
                  }
                />

                <EventPolices
                  header={"Code of Conduct Policy"}
                  des={
                    " All participants must behave respectfully toward staff and other attendees. Harassment, discrimination, or disruptive behavior will result in removal from the event."
                  }
                />

                <EventPolices
                  header={"Entry & Ticket Policy"}
                  des={
                    "Guests must present a valid ticket or digital confirmation at the entrance. Tickets cannot be transferred or resold without authorization."
                  }
                />

                <EventPolices
                  header={"Safety & Security Policy"}
                  des={
                    "Bags may be inspected at entry. Dangerous or prohibited items will not be allowed. Follow all instructions from security personnel during emergencies."
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventInfo;
