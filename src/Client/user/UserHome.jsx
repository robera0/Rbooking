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
} from "lucide-react";
import { CalendarDemo } from "@/components/ui/calendar";
import { InfoBar } from "../../components/Reusable";
import { RatingStars } from "../../components/Reusable";
import { eventService } from "@/Context/ApiEvent";

const SearchButton = () => (
  <button className="w-12 h-12 lg:h-[55px] sm:w-[55px]  py-3 bg-[#FF7800] flex items-center justify-center text-lg text-white font-semibold rounded-full lg:hover:scale-95 transition-transform duration-200">
    <Search className="w-5 h-5" />
  </button>
);

const UserHome = () => {
  const [dateSlide, setDateSlide] = useState(false);
  const [date, setDate] = useState(null);
  const { events, isLoading, error } = eventService();

  return (
    <div onClick={() => setDateSlide(false)} className="space-y-4">
      <div className="w-full px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-0 mb-16">
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center space-y-6 lg:pl-28">
          <h1 className="text-4xl sm:text-5xl text-white font-semibold leading-snug">
            Find the Top events nearby.
          </h1>

          <p className="w-[90%] sm:w-[70%] lg:w-full text-[#808080] text-md lg:text-lg">
            We bring you not only a stay option, but an experience in your
            budget to enjoy the luxury.
          </p>

          <button className="w-[180px] py-3 bg-[#FF7800] text-lg text-white font-semibold rounded-md transition-transform duration-200 hover:scale-95">
            Discover Events
          </button>
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

      {/* DESKTOP (you can add your own) */}
      <div className="hidden md:flex relative items-center justify-center space-x-4">
        {/* desktop layout */}
      </div>

      <div className="block relative bottom-16 w-[80%] h-auto bg-[#191B1D] mx-auto rounded-xl space-y-4 ">
        <div className="w-full">
          <img className="object-cover rounded-xl" src="/Login.jpg" alt="" />
        </div>

        <div className="w-full flex flex-col pl-4 space-y-2">
          <h2 className="text-white font-bold">up to 60% off</h2>
          <p className="w-[85%] text-[#808080] mb-4 text-md">
            on buying ticket online
          </p>
        </div>
      </div>

      {/*info about the app */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-[85%] h-[440px] rounded-lg">
          <span className="absolute">
            <Star className="absolute -left-4 -top-2 w-12 h-12 text-[#FF7800]" />
          </span>
          <img
            className="h-full rounded-lg object-cover"
            src="/Login.jpg"
            alt=""
          />
        </div>
        <div className="w-[80%] h-auto space-y-4">
          <h1 className="text-white font-bold text-3xl z-[45]">
            The Best Events Start Here!
          </h1>
          <p className="w-[95%] text-[#808080] text-md">
            Book your Spot on any event with us and don't forget to grab an
            awesome event deal to save massive on your stay.
          </p>

          <div className="block text-white h-auto z-[70] space-y-6">
            <InfoBar
              icon={<UsersRound />}
              bg={"bg-[#5EC750]"}
              header={"Quick Search"}
              des={"Fast event lookup made simple."}
            />
            <InfoBar
              icon={<Timer className="w-7 h-7" />}
              bg={"bg-red-500"}
              header={"Quick Services"}
              des={"Supposing so be resolving Events  perfectly."}
            />
            <InfoBar
              icon={<Shield className="text-[#FD7E14]" />}
              bg={"bg-[#392E27]"}
              header={"High Security"}
              des={"Arranging rapturous did believe him all had supported.."}
            />
            <InfoBar
              icon={<UsersRound className="text-[#17A2B8]" />}
              bg={"bg-[#213238]"}
              header={"24 hour Alert"}
              des={"Fast Notification as soon as event s posted"}
            />
          </div>
        </div>
        {/*FEATURE EVENTS */}
        <div className="w-full h-full flex  flex-col mt-4 items-center z-[80] space-y-8 ">
          <h1 className="text-white  font-bold text-3xl z-[45]">
            Feature Events
          </h1>
          {error && message.error}
          <div className="block h-auto flex flex-col mb-12 items-center justify-center gap-6 space-y-24">
            {Array.isArray(events?.events) &&
              events.events.map((e, idx) => (
                <Link to={`/events/${e._id}`} className="event-card">
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center w-full  "
                  >
                    <div className="relative w-[80%] h-72 rounded-xl  space-y-2">
                      <img
                        src={
                          e?.pictures?.[0] || e?.pictures?.[1] || "/Login.jpg"
                        }
                        alt={e?.name || "event image"}
                        className="h-full w-full object-cover rounded-xl"
                      />
                      <div className="absolute bottom-3 left-4 flex bg-[#FF7800] text-white px-4 py-1 rounded-xl space-x-2">
                        <Map />
                        <span>{e?.locale}</span>
                      </div>
                      <div className="flex justify-between pl-2 mt-2">
                        <div className="space-y-2">
                          <h1 className="text-lg text-white font-semibold">
                            {e?.name}
                          </h1>
                          <p className="text-[#FF7800]">
                            <span className="font-bold">
                              {`${e?.priceRanges?.[0]?.min} ${e?.priceRanges?.[0]?.currency}`}
                            </span>{" "}
                            / Starting at
                          </p>
                        </div>
                        <div className="flex justify-center items-center space-x-2">
                          <h1 className="text-white text-xl font-bold">
                            {e?.rating?.score}
                          </h1>
                          <Star className="text-[#FF7800]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
        {/*COMMENT REVIEW */} {/* this going to be a sliding div */}
        <div className="relative w-[90%] h-[240px] mt-8  mb-72 flex flex-col items-center rounded-lg ">
          <div className="w-[85%] space-y-4">
            <div className="absolute left-4 top-12 h-9 w-9 flex justify-center items-center bg-[#FF7800] rounded-lg">
              <SmilePlus className="  w-5 h-5 text-white" />
            </div>
            <div className="w-full">
              <img
                className="h-full rounded-lg items-center object-cover"
                src="/review.JPG"
                alt=""
              />
            </div>

            <div className="flex  flex-col space-y-2">
              <span>
                <Quote
                  fill="white"
                  strokeWidth={3}
                  className="w-8 w-8 rotate-180 text-white"
                />
              </span>
              <div className="pl-8 mt-3 space-y-3">
                <div></div>
                <h2 className="text-white whitespace-normal  font-semibold ">
                  The event was amazing! The performances were great and
                  everything was well organized.
                </h2>
                <div className="space-y-1">
                  <RatingStars />
                  <h2 className="text-lg text-white font-semibold">
                    Robera Ararsa
                  </h2>
                </div>
              </div>

              <span className="flex justify-end mr-6">
                <Quote
                  fill="white"
                  strokeWidth={3}
                  className="w-8 w-8 text-white"
                />
              </span>

              <h2 className="text-lg text-white font-semibold">Event Name</h2>
            </div>
          </div>
        </div>
        {/*RELIABILITY*/}
        <div className="w-full h-82 bg-[#2A2C31] pl-4 pt-4 space-y-6 text-white">
          {/* Card 1 */}
          <div className="w-2/3 h-32 bg-[#222529] rounded-md flex items-center space-x-4 p-4">
            <Activity className="w-12 h-12 text-white" />

            <div>
              <h1 className="font-semibold">24x7 Help</h1>
              <p className="text-sm text-gray-300">
                If we fall short of your expectation in any way, let us know
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="w-2/3 h-32 bg-[#222529] rounded-md flex items-center space-x-4 p-4">
            <HandCoins className="w-12 h-12 text-white" />

            <div>
              <h1 className="font-semibold">Payment Trust</h1>
              <p className="text-sm text-gray-300">
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
