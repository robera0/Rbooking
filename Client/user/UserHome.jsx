import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Search,
  User,
  Star,
  UsersRound,
  Timer,
  Shield,
  Bell,
  Map,
  Angry,
  Annoyed,
  Frown,
  Laugh,
  Meh,
  Smile,
  SmilePlus,
  Quote,
  Activity,
  HandCoins,
  MapIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CalendarDemo } from "@/components/ui/calendar";
import { InfoBar } from "../src/components/Reusable";
import { RatingStars } from "../src/components/Reusable";
import { eventService } from "@/Context/ApiEvent";
import { useService } from "@/Context/ServiceContext";
import { useNavigate } from "react-router-dom";

const SearchButton = () => {
  const navigate = useNavigate();
  return (
    <>
      <button
        onClick={() => navigate("/event")}
        className="w-12 h-12 lg:h-[55px] sm:w-[55px]  py-3 bg-[#FF7800] flex items-center justify-center text-lg text-white font-semibold rounded-full lg:hover:scale-95 transition-transform duration-200"
      >
        <Search className="w-5 h-5" />
      </button>
    </>
  );
};

const UserHome = () => {
  const [dateSlide, setDateSlide] = useState(false);
  const { events, isLoading, error } = eventService();
  const { type, setType, date, setDate, artist, setArtist } = useService();

  return (
    <div onClick={() => setDateSlide(false)} className="space-y-4">
      <div className="w-full px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-0 mb-16">
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center space-y-6 lg:pl-28">
          <h1 className="text-3xl sm:text-5xl text-white font-semibold leading-snug">
            Find the Top events nearby.
          </h1>

          <p className="w-[90%] sm:w-[70%] lg:w-full text-[#808080] text-md lg:text-lg">
            We bring you not only a stay option, but an experience in your
            budget to enjoy the luxury.
          </p>
          <Link to={`/event`}>
            <button
              onClick={() => {
                setType("");
              }}
              className="w-[180px] py-3 bg-[#FF7800] text-lg text-white font-semibold rounded-md transition-transform duration-200 hover:scale-95"
            >
              Discover Events
            </button>
          </Link>
        </div>

        {/* RIGHT IMAGE SECTION */}
        <div className="w-full lg:w-[55%] relative flex justify-center items-center">
          {/* Floating circle images (Desktop only) */}
          <div className="hidden lg:block absolute left-34 top-10 space-y-12">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                src="/1763661369611.webp"
                alt="Event"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-22 h-22 rounded-full overflow-hidden">
              <img
                src="/Login.jpg"
                alt="Event"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Main Image */}
          <div className="w-[95%] sm:w-[70%] lg:w-[60%] h-[400px] lg:h-[690px] rounded-md overflow-hidden">
            <img
              src="/1763661369611.webp"
              alt="Event"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/*MOBILE VIEW*/}
      <div className="block  relative  lg:bottom-52  w-full lg:w-[76%] bottom-[120px] z-10 flex sm:flex-col items-center space-y-4 lg:px-22 px-12 py-4 ">
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
                {!date ? (
                  <>
                    <span>Dates</span>
                    <span>All Dates</span>
                  </>
                ) : (
                  <span className="text-[#FF7800] font-semibold">
                    {date.toLocaleDateString()}
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
              selected={date}
              onSelect={setDate}
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
              onChange={(e) => setType(e.target.value)}
              value={type}
              className="flex-1 outline-none placeholder:text-white text-white font-light"
            />
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-[80%] lg:w-[75%] h-[4rem] bg-[#6C6D6E] rounded-lg shadow-md flex items-center px-4">
            <User strokeWidth={1} className="text-white w-6 h-6 mr-3" />
            <input
              type="text"
              placeholder="Artist, Event or Venue"
              onChange={(e) => setArtist(e.target.value)}
              className="flex-1 outline-none placeholder:text-white text-white font-light"
            />
          </div>

          {/* MAIN SEARCH BUTTON */}
          <div className="md:hidden lg:flex items-center lg:mb-8  md:ml-12 ml-6">
            <SearchButton />
          </div>
        </div>
      </div>

      {/* DESKTOP (you can add your own) */}
      <div className="w-full  flex flex-col gap-6 lg:gap-40 lg:flex-row lg:flex-wrap lg:justify-center">
        {Array(3)
          .fill(null)
          .map((_, idx) => (
            <div
              key={idx}
              className="relative bottom-16 w-[80%] lg:w-[23%] lg:h-[150px] h-full lg:flex lg:justify-center items-center  bg-[#191B1D] lg:rounded-4xl rounded-xl space-y-6 mx-auto lg:mx-0 lg:gap-4 "
            >
              <div className="w-full h-full lg:mt-5">
                <img
                  className="w-full h-full object-cover  rounded-tl-xl  rounded-tr-xl lg:rounded-tl-4xl lg:rounded-bl-4xl"
                  src="/Login.jpg"
                  alt=""
                />
              </div>

              <div className="w-full flex flex-col pl-4 space-y-2">
                <h2 className="text-white font-bold">up to 60% off</h2>
                <p className="w-[85%] text-[#808080] mb-4 text-md">
                  on buying ticket online
                </p>
              </div>
            </div>
          ))}
      </div>

      {/*info about the app */}
      <div className="w-full flex flex-col space-y-12">
        {/* IMAGE + INFO SECTION */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:space-x-6 w-full justify-center">
          {/* IMAGE */}
          <div className="relative w-[85%] lg:w-[32%] h-[440px] lg:h-[660px] rounded-lg">
            <span className="absolute z-10">
              <Star
                strokeWidth={1}
                className="hidden lg:block absolute  lg:-left-8  lg:-top-6 lg:w-22 lg:h-22 w-12 h-12 text-[#FF7800]"
              />
            </span>

            <span className="absolute z-10">
              <Star
                strokeWidth={2}
                className="lg:hidden  absolute -left-4 -top-2 lg:w-22 lg:h-22 w-12 h-12 text-[#FF7800]"
              />
            </span>

            <img
              className="w-full h-full rounded-lg object-cover"
              src="/Login.jpg"
              alt="event preview"
            />
          </div>

          {/* INFO */}
          <div className="w-[85%] lg:w-[45%] space-y-4">
            <h1 className="text-white font-bold lg:text-5xl text-3xl">
              The Best Events Start Here!
            </h1>

            <p className="w-[95%] text-[#808080] text-md">
              Book your Spot on any event with us and don't forget to grab an
              awesome event deal to save massive on your stay.
            </p>

            <div className="text-white  space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
              <InfoBar
                icon={<UsersRound className="lg:w-10 lg:h-10" />}
                bg="bg-[#5EC750]"
                header="Quick Search"
                des="Fast event lookup made simple."
              />
              <InfoBar
                icon={<Timer className="w-7 h-7 lg:w-10 lg:h-10" />}
                bg="bg-red-500"
                header="Quick Services"
                des="Supposing so be resolving Events perfectly."
              />
              <InfoBar
                icon={<Shield className="text-[#FD7E14] lg:w-10 lg:h-10" />}
                bg="bg-[#392E27]"
                header="High Security"
                des="Arranging rapturous did believe him all had supported."
              />
              <InfoBar
                icon={<UsersRound className="text-[#17A2B8] lg:w-10 lg:h-10" />}
                bg="bg-[#213238]"
                header="24 hour Alert"
                des="Fast Notification as soon as event is posted"
              />
            </div>
          </div>
        </div>
        {/* FEATURE EVENTS */}
        <div className="w-full flex flex-col mt-4 lg:mt-33 items-center space-y-8 lg:space-y-12">
          <h1 className="text-white font-bold text-3xl lg:text-6xl">
            Featured Events
          </h1>

          {error && message?.error}

          <div className="w-full flex flex-col lg:flex-row items-center gap-y-14 lg:pl-3  sm:gap-y-12 lg:gap-y-6  lg:gap-x-2    mb-12">
            {Array.isArray(events?.events) &&
              events.events.map((e, idx) => (
                <Link
                  key={idx}
                  to={`/events/${e?._id}/tickets/${e.tickets[0]?._id}`}
                  className="w-full p-2 flex justify-center  rounded-md"
                >
                  <div className="w-[80%] lg:w-[85%] space-y-3">
                    {/* Image Section */}
                    <div className="relative shadow-xs shadow-[#FF7800] h-80 w-full sm:h-96 lg:h-[500px] rounded-xl overflow-hidden">
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

                    {/* Details Section */}
                    <div className="flex justify-between px-2">
                      <div className="space-y-1">
                        <h1 className="text-lg lg:text-xl text-white font-semibold">
                          {e?.name}
                        </h1>

                        {/* Show ticket price if available */}
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

                      <div className="flex items-center space-x-2">
                        <h1 className="text-white text-xl font-bold">
                          {e?.rating?.score || "0.0"}
                        </h1>
                        <Star className="text-[#FF7800]" size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
        {/*COMMENT REVIEW */} {/* this going to be a sliding div */}
        <div className=" w-full flex justify-center mt-16 sm:mt-12 lg:mt-8 mb-64 sm:mb-48 lg:mb-32">
          <div className="relative w-[80%] h-62 lg:h-[430px] sm:w-[85%] lg:w-[70%] rounded-lg">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
              <div className="relative w-full lg:w-1/2 h-[180px] sm:h-[160px] lg:h-[460px] rounded-xl overflow-hidden">
                <div className="absolute -left-2 -top-2 h-9 w-9 flex justify-center items-center bg-[#FF7800] rounded-lg z-10">
                  <SmilePlus className="w-5 h-5 text-white" />
                </div>

                <img
                  src="/review.JPG"
                  alt="review"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="w-full lg:w-1/2 flex flex-col space-y-4">
                <Quote
                  fill="white"
                  strokeWidth={3}
                  className="w-7 h-7 rotate-180 text-white"
                />

                <div className="pl-6 space-y-4">
                  <h2 className="text-white text-sm sm:text-base lg:text-3xl font-semibold leading-relaxed">
                    The event was amazing! The performances were great and
                    everything was well organized.
                  </h2>

                  <div className="space-y-1">
                    <RatingStars />
                    <h2 className="text-base sm:text-lg text-white font-semibold">
                      Robera Ararsa
                    </h2>
                  </div>
                </div>

                <div className="flex justify-end pr-6">
                  <Quote
                    fill="white"
                    strokeWidth={3}
                    className="w-7 h-7 text-white"
                  />
                </div>

                <h2 className="text-sm sm:text-lg text-white font-semibold">
                  Event Name
                </h2>
              </div>
            </div>

            <button className="hidden lg:flex absolute left-[-200px] top-1/2 -translate-y-1/2 h-20 w-20 justify-center items-center bg-[#FF7800] rounded-full">
              <ChevronLeft className="text-white w-5 h-5" />
            </button>

            <button className="hidden lg:flex absolute right-[-200px] top-1/2 -translate-y-1/2 h-20 w-20 justify-center items-center bg-[#FF7800] rounded-full">
              <ChevronRight className="text-white w-5 h-5" />
            </button>
          </div>
        </div>
        {/*RELIABILITY*/}
        <div className="w-full h-82 bg-[#2A2C31] p-4 text-white flex flex-col justify-center lg:items-center lg:flex-row lg:justify-around gap-6">
          {/* Card 1 */}
          <div className="w-2/3 lg:w-[28%] lg:h-42 h-32 bg-[#222529] rounded-md flex items-center space-x-4 p-4">
            <Activity className="w-12 h-12  lg:w-16 lg:h-16 text-white" />
            <div className="lg:space-y-4">
              <h1 className="font-semibold lg:text-xl">24x7 Help</h1>
              <p className="text-sm lg:text-lg text-gray-300">
                If we fall short of your expectation in any way, let us know
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="w-2/3 lg:w-[28%] h-42 bg-[#222529] rounded-md flex items-center space-x-4 p-4">
            <HandCoins className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
            <div className="lg:space-y-4">
              <h1 className="font-semibold lg:text-xl">Payment Trust</h1>
              <p className="text-sm lg:text-lg text-gray-300">
                All refunds come with no questions asked guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
