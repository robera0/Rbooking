import React, { useRef, useState } from "react";
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Search,
  User,
} from "lucide-react";
import { CalendarDemo } from "@/components/ui/calendar";

const UserHome = () => {
  const [dateSlide, setDateSlide] = useState(false);
  const [date, setDate] = useState(null);
  const dateref = useRef(null);

  return (
    <div
      ref={dateref}
      onClick={() => setDateSlide(false)}
      className="space-y-12"
    >
      <div className="flex flex-col w-full h-62 gap-6 pl-6">
        <span className="pt-4 w-[70%] h-auto">
          <h1 className="text-4xl leading-normal text-white font-semibold">
            Find the Top events nearby.
          </h1>
        </span>

        <span>
          <p className="w-[85%] text-[#808080] text-md">
            We bring you not only a stay option, but an experience in your
            budget to enjoy the luxury.
          </p>
        </span>

        <button className="w-46 h-18 bg-[#FF7800] text-lg text-white font-semibold cursor-pointer lg:hover:scale-95 rounded-xl transition-transform duration-200">
          Discover Events
        </button>
      </div>

      {/* IMAGE */}
      <div className=" mt-10 h-auto w-full flex justify-center items-center">
        <div className="w-[95%] rounded-md overflow-hidden">
          <img
            src="/Login.jpg"
            alt="Login"
            className="w-full h-92 object-cover"
          />
        </div>
      </div>

      {/*MOBILE VIEW*/}
      <div className="block md:hidden relative bottom-32 z-10 flex flex-col items-center space-y-4 w-full px-4 py-6 mt-4">
        <div className="relative flex flex-col justify-center items-center w-full pt-6 text-white text-md font-light bg-[#191B1D] rounded-xl space-y-6">
          {/* Calendar Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDateSlide(!dateSlide);
            }}
            className="w-[80%] flex justify-between items-center px-4 py-3 bg-[#6C6D6E] rounded-lg shadow-md"
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
            className={`absolute left-16 top-0 w-62 bg-[#D9D9D9] rounded-lg overflow-hidden z-50 transition-[max-height] duration-500 ease-in-out ${
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
          <div className="relative w-[80%] h-[4rem] bg-[#6C6D6E] rounded-lg shadow-md flex items-center px-4">
            <User strokeWidth={1} className="text-white w-6 h-6 mr-3" />
            <input
              type="text"
              placeholder="Location"
              className="flex-1 outline-none placeholder:text-white text-white font-light"
            />
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-[80%] h-[4rem] bg-[#6C6D6E] rounded-lg shadow-md flex items-center px-4">
            <User strokeWidth={1} className="text-white w-6 h-6 mr-3" />
            <input
              type="text"
              placeholder="Artist, Event or Venue"
              className="flex-1 outline-none placeholder:text-white text-white font-light"
            />
          </div>

          {/* MAIN SEARCH BUTTON */}
          <div className="absolute top-70">
            <button className="block md:hidden p-4 bg-[#FF7800] rounded-full text-white">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* DISCOUNT SECTION (NOW VISIBLE) */}
      <div className="block relative w-[80%] h-40 bg-black mx-auto rounded-xl">
        <p className="text-white p-6">🔥 Discount Events Section</p>
      </div>

      {/* DESKTOP (you can add your own) */}
      <div className="hidden md:flex relative items-center justify-center space-x-4">
        {/* desktop layout */}
      </div>
    </div>
  );
};

export default UserHome;
