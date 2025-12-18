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
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import { motion } from "framer-motion";
import { Amenities } from "../../components/Reusable";
import { useState } from "react";
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

  return (
    <div className=" space-y-8 mb-12">
      {/*EDIT BUTTON */}
      <div className="flex justify-center  ">
        <button className="flex text-white  font-semibold bg-[#FF7800] px-10 py-3 rounded-md space-x-2 lg:cursor-pointer">
          <SquarePen />
          <span>Edit Search</span>
        </button>
      </div>
      {/*HEADER */}
      <div className="flex flex-col pl-6  space-y-4  ">
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-3">
            <h1 className="text-white text-2xl font-semibold">Event Name</h1>
            <div className=" flex  space-x-2  items-center px-2 py-1 bg-[#3F454B] text-white rounded-md">
              <ClockFading className="text-white flex text-center w-5 h-5" />
              <span>Starts at 11 PM LT</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <MapPin className="text-white flex text-center w-5 h-5" />
            <span>
              <p className="w-[%] text-[#808080] text-sm">
                5855 W Century Blvd, Los Angeles - 90045
              </p>
            </span>
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
              src="/Login.jpg"
              alt="Login"
              className="w-full h-[350px] object-cover"
            />
          </div>

          <div className="w-[90%] rounded-2xl overflow-hidden">
            <img
              src="/1763661369611.webp"
              alt="Login"
              className="w-full h-[200px] object-cover"
            />
          </div>

          <div className="w-[90%] rounded-2xl overflow-hidden">
            <img
              src="/1308183.jpeg"
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
              <h1 className="text-xl text-white font-bold">300 BIRR</h1>
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

              <h3 className=" text-white text-center font-bold">4.5</h3>

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
              Demesne far-hearted suppose venture excited see had has. Dependent
              on so extremely delivered by. Yet no jokes worse her why. Bed one
              supposing breakfast day fulfilled off depending questions.
              Delivered dejection necessary objection do Mr prevailed. Mr
              feeling does chiefly cordial in do. Water timed folly right aware
              if oh truth. Large above be to means. Dashwood does provide
              stronger is.
            </p>
          </div>
          {/*AMENITIES */}
          <div className="space-y-4">
            <div className="space-y-4">
              <h1 className="text-white text-2xl font-semibold">Amenities</h1>
              <div className="w-[80%] h-[0.3px] bg-gray-600 " />
            </div>
            <div className="space-y-8">
              <Amenities
                header="Activities"
                icon={Puzzle}
                lists={["Free Wi-Fi", "Swimming Pool", "Parking"]}
              />

              <Amenities
                header="Payment Method"
                icon={CreditCard}
                lists={["Telebirr", " MPESA", "CBE", "Apolo", "Awash Pro"]}
              />

              <Amenities
                header="Safety and Security"
                icon={Shield}
                lists={["Doctor on call", "Ambulance "]}
              />
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
                  <h1 className=" text-white text-2xl font-bold">4.5</h1>
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

              <div className="w-full mt-12  space-y-8">
                <div className="pt-4 space-y-4">
                  <div className="flex justify-between gap-4">
                    <div className="w-12 h-12 flex items-center justify-center  overflow-hidden rounded-full">
                      <img
                        className="w-full h-full object-cover"
                        src="/defaultAvater.jpg"
                        alt=""
                      />
                    </div>

                    <div className="flex-1">
                      <h1 className="font-bold text-white">Christian Brooks</h1>
                      <p className="text-sm text-gray-400">2 days ago</p>
                    </div>

                    <div className="flex items-center justify-center mr-12  w-10 h-10 text-white font-bold  bg-[#F7C32E] rounded-md">
                      <h1 className="">4.5</h1>
                    </div>
                  </div>

                  <div>
                    <p className="w-[90%] text-[#808080]">
                      The Salon is thorough.compassionate and truly cares about
                      the patients.i highly recommend this salon!{" "}
                    </p>
                  </div>

                  {/*like and unlike icons */}
                  <div className="flex gap-6">
                    <button
                      onClick={() => setLikeBtn((c) => c + 1)}
                      className="flex space-x-2 text-gray-400 hover:text-[#FF9A41] items-center justify-center transition"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-semibold">{likeBtn}</span>
                    </button>

                    <button
                      onClick={() => setDisLikeBtn((c) => c + 1)}
                      className="flex space-x-2 text-gray-400 hover:text-red-500 items-center justify-center transition"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      <span className="font-semibold">{dislikeBtn}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex justify-between gap-4">
                    <div className="w-12 h-12 flex items-center justify-center  overflow-hidden rounded-full">
                      <img
                        className="w-full h-full object-cover"
                        src="/defaultAvater.jpg"
                        alt=""
                      />
                    </div>

                    <div className="flex-1">
                      <h1 className="font-bold text-white">Christian Brooks</h1>
                      <p className="text-sm text-gray-400">2 days ago</p>
                    </div>

                    <div className="flex items-center justify-center mr-12  w-10 h-10 text-white font-bold  bg-[#F7C32E] rounded-md">
                      <h1 className="">4.5</h1>
                    </div>
                  </div>

                  <div>
                    <p className="w-[90%] text-[#808080]">
                      Handsome met debating sir dwelling age material. As style
                      lived he worse dried. Offered related so visitors we
                      private removed. Moderate do subjects to distance.
                    </p>
                  </div>

                  {/*like and unlike icons */}
                  <div className="flex gap-6">
                    <button
                      onClick={() => setLikeBtn((c) => c + 1)}
                      className="flex space-x-2 text-gray-400 hover:text-[#FF9A41] items-center justify-center transition"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-semibold">{likeBtn}</span>
                    </button>

                    <button
                      onClick={() => setDisLikeBtn((c) => c + 1)}
                      className="flex space-x-2 text-gray-400 hover:text-red-500 items-center justify-center transition"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      <span className="font-semibold">{dislikeBtn}</span>
                    </button>
                  </div>
                </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventInfo;
