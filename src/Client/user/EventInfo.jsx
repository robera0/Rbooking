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
  CreditCard,
  ImageUp,
  ChevronDown,
  ArrowBigRight,
  ThumbsDown,
  ThumbsUp,
  Search,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Listbox } from "@headlessui/react";
import { motion } from "framer-motion";
import { Amenities } from "../../components/Reusable";
import { EventPolices } from "../../components/Reusable";
import { useLoaderData } from "react-router-dom";
import { useState } from "react";
import { useService } from "@/Context/ServiceContext";
import { eventService } from "@/Context/ApiEvent";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

const EventInfo = () => {
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
  const [likeBtn, setLikeBtn] = useState(15);
  const [dislikeBtn, setDisLikeBtn] = useState(2);
  const { isEditMenuActive, setEditMenuActive } = useService();
  const { fetchEventById } = eventService();
  const { id } = useParams();
  const {
    data: event_id,
    event_idisLoading,
    isError,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEventById(id),
  });

  const date = new Date(event_id?.event_id?.dates?.start?.localDate);
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const [showFullName, setShowFullName] = useState(false);

  return (
    <div className=" space-y-8 mb-12">
      {/*EDIT BUTTON */}
      <div className="flex justify-center  ">
        <button
          onClick={() => setEditMenuActive(true)}
          className="flex text-white  font-semibold bg-[#FF7800] px-10 py-3 rounded-md space-x-2 lg:cursor-pointer"
        >
          <SquarePen />
          <span>Edit Search</span>
        </button>
      </div>
      {/*HEADER */}
      <div className="flex flex-col pl-6  space-y-4  ">
        <div className="flex flex-col space-y-2">
          {/* Event name and date */}
          <div className="flex flex-wrap space-y-2 justify-between items-center">
            <h1
              className="text-white text-lg font-semibold cursor-pointer"
              onClick={() => setShowFullName(!showFullName)}
              title={event_id?.event_id?.name}
            >
              {showFullName
                ? event_id?.event_id?.name
                : event_id?.event_id?.name?.length > 20
                ? `${event_id?.event_id?.name.slice(0, 20)}...`
                : event_id?.event_id?.name}
            </h1>
            <div className="inline-flex items-center mr-3 space-x-2 px-3 py-1 bg-[#3F454B] text-sm text-white rounded-md">
              <ClockFading className="w-5 h-5" />
              <span>{formatted}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-white" />
            <p className="text-[#808080] text-sm truncate max-w-full">
              {event_id?.event_id?.locale}
            </p>
          </div>
        </div>

        <div className="flex justify-end mr-12 space-x-2">
          <div className=" flex  space-x-2  items-center px-2 py-1 bg-[#3F454B] text-white rounded-md">
            <Heart className="text-white flex text-center w-5 h-5" />
          </div>

          <div className=" flex  space-x-2  items-center px-2 py-1 bg-[#3F454B] text-white rounded-md">
            <Share2 className="text-white flex text-center w-5 h-5" />
          </div>
        </div>
        {/*EVENT IMAGES */}

        <div className="space-y-3">
          <div className="w-[90%] rounded-2xl overflow-hidden">
            <img
              src={event_id?.event_id?.pictures?.[0] || "/1308183.jpeg"}
              alt="Login"
              className="w-full h-[350px] object-cover"
            />
          </div>

          <div className="w-[90%] rounded-2xl overflow-hidden">
            <img
              src={event_id?.event_id?.pictures?.[1] || "/1308183.jpeg"}
              alt="Login"
              className="w-full h-[200px] object-cover"
            />
          </div>

          <div className="w-[90%] rounded-2xl overflow-hidden">
            <img
              src={event_id?.event_id?.pictures?.[2] || "/1308183.jpeg"}
              alt="Login"
              className="w-full h-[200px] object-cover"
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

        {/*TICKET */}

        <div className="bg-[#191B1D] w-[90%] h-62 p-5 rounded-xl space-y-2">
          <div className="flex justify-between ">
            <div className="space-y-2">
              <h2 className=" text-[#808080] font-semibold">
                Price of Early Bird
              </h2>
              <h1 className="text-xl text-white font-bold">
                {`${event_id?.event_id?.priceRanges?.[0]?.min} ${event_id?.event_id?.priceRanges?.[0]?.currency}`}
              </h1>
            </div>

            <span className="flex  items-center mr-8">
              {" "}
              <Ticket className="w-12 h-12 text-[#34C759]" />
            </span>
          </div>

          {/*RATING */}
          <div className="space-y-2">
            <div className="flex items-center  space-x-2">
              <span>
                <MoveRight className="text-white w-4" />
              </span>

              <h3 className=" text-white text-center font-bold">
                {event?.rating}
              </h3>

              <span className="flex gap-1 text-orange-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </span>
            </div>

            <div className="flex items-center  space-x-2">
              <span>
                <MoveRight className="text-white w-4" />
              </span>

              <h3 className="text-[#808080] text-center font-bold">
                No Specific Offers
              </h3>
            </div>
            <div className="flex  justify-center  mt-6">
              <button className=" text-white  font-semibold bg-[#FF9A41] px-10 py-3 rounded-2xl space-x-2 lg:cursor-pointer">
                <span>View more Tickets</span>
              </button>
            </div>
          </div>
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
              {event_id?.event_id?.desc}
            </p>
          </div>
          {/*AMENITIES */}
          <div className="space-y-4">
            <div className="space-y-4">
              <h1 className="text-white text-2xl font-semibold">Amenities</h1>
              <div className="w-[80%] h-[0.3px] bg-gray-600 " />
            </div>
            <div className="space-y-8">
              {event_id?.event_id?.amenities &&
                Object.entries(event_id.event_id.amenities).map(
                  ([category, list]) => (
                    <Amenities
                      key={category}
                      header={
                        category.charAt(0).toUpperCase() + category.slice(1)
                      } // Capitalize
                      icon={Puzzle}
                      lists={Array.isArray(list) ? list : []}
                    />
                  )
                )}
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
                    {event_id?.event_id?.rating?.score}
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
                  {progress?.map((p, _) => (
                    <>
                      <div className="w-full flex justify-center items-center space-x-8">
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
                    </>
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

              <div className="w-full mt-12 space-y-8">
                {event_id?.event_id?.comments[0]?.comment?.map((c) => (
                  <div key={c?._id} className="pt-4 space-y-4">
                    <div className="flex justify-between gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-full">
                        <img
                          className="w-full h-full object-cover"
                          src={c?.userId?.avatarUrl || "/defaultAvater.jpg"}
                          alt={c?.userId?.fullName || "User Name"}
                        />
                      </div>

                      {/* Name and Time */}
                      <div className="flex-1">
                        <h1 className="font-bold text-white">
                          {c?.userId?.fullName || "User Name"}
                        </h1>
                        <p className="text-sm text-gray-400">
                          {moment(
                            event_id?.event_id?.comments[0]?.createdAt
                          ).fromNow()}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-center mr-12 w-10 h-10 text-white font-bold bg-[#F7C32E] rounded-md">
                        <h1>
                          {c?.rating || event_id?.event_id?.comments[0]?.rating}
                        </h1>
                      </div>
                    </div>

                    {/* Comment text */}
                    <div>
                      <p className="w-[90%] text-[#808080]">{c?.text}</p>
                    </div>

                    {/* Like/Dislike */}
                    <div className="flex gap-6">
                      <button
                        onClick={() => setLikeBtn((prev) => prev + 1)}
                        className="flex space-x-2 text-gray-400 hover:text-[#FF9A41] items-center justify-center transition"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-semibold">{likeBtn}</span>
                      </button>

                      <button
                        onClick={() => setDisLikeBtn((prev) => prev + 1)}
                        className="flex space-x-2 text-gray-400 hover:text-red-500 items-center justify-center transition"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        <span className="font-semibold">{dislikeBtn}</span>
                      </button>
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
