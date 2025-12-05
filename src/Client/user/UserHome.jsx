import React, { useState } from "react";
import { CalendarIcon, ChevronDown, ChevronUp, Search } from "lucide-react";
import { CalendarDemo } from "@/components/ui/calendar";

const UserHome = () => {
  const [dateSlide, setDateSlide] = useState(false);
  const [date, setDate] = useState(null);

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-6 pl-6">
        <span className="space-y-4 pt-4 w-[70%] h-auto">
          <h1 className="text-4xl  leading-normal break-normal text-white font-semibold">
            Find the Top events nearby.
          </h1>
        </span>
        <span>
          <p className="w-[85%] text-[#808080] text-xl ">
            We bring you not only a stay option, but an experience in your
            budget to enjoy the luxury.
          </p>
        </span>
        <button className=" w-46 h-14 bg-[#FF7800] text-lg text-white font-semibold cursor-pointer lg:hover:scale-95 rounded-xl transition-transform duration-200">
          Discover Events
        </button>
      </div>

      {/*Image */}
      <div className="relative mt-10 w-full flex justify-center items-center">
        <div className="w-[95%] rounded-md overflow-hidden">
          <img
            src="/Login.jpg"
            alt="Login"
            className="w-full h-92 object-cover"
          />
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden absolute bottom-12 flex flex-col items-center space-y-4 w-full px-4 mt-4">
        {/* Calendar Dropdown */}
        <div className="relative flex justify-center w-full h-full bg-[#191B1D] rounded-xl">
          <button
            onClick={() => setDateSlide(!dateSlide)}
            className="w-62 flex justify-between items-center px-4 py-3 bg-white rounded-lg shadow-md"
          >
            <div className="flex items-center space-x-3">
              <CalendarIcon
                strokeWidth={2}
                className="text-[#FF7800] w-6 h-6"
              />
              <div className="flex flex-col">
                {!date ? (
                  <>
                    <span className="text-[#FF7800] font-semibold text-sm">
                      Dates
                    </span>
                    <span className="text-[#FF7800] font-semibold text-sm">
                      All Dates
                    </span>
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

          {/* Calendar Panel */}
          <div
            className={`absolute left-0 top-full w-full bg-[#D9D9D9] rounded-lg overflow-hidden z-50 transition-[max-height] duration-500 ease-in-out ${
              dateSlide ? "max-h-[500px] mt-3" : "max-h-0 mt-0"
            }`}
          >
            <CalendarDemo
              mode="single"
              selected={date}
              onSelect={setDate}
              buttonVariant="ghost"
              className="p-4 w-full bg-white rounded-xl shadow-lg text-black"
              classNames={{
                day: "h-10 w-10 flex items-center justify-center rounded-lg hover:bg-orange-200",
                month_caption:
                  "text-lg text-center font-semibold text-orange-500",
                nav_button: "text-orange-500 hover:text-orange-700",
              }}
            />
          </div>
        </div>

        {/* Mobile Search Box */}
        <div className="relative w-full h-[4rem] bg-white rounded-lg shadow-md flex items-center px-4">
          <Search strokeWidth={2} className="text-[#FF7800] w-6 h-6 mr-3" />
          <input
            type="text"
            placeholder="Artist, Event or Venue"
            className="flex-1 outline-none text-[#FF7800] placeholder-[#FF7800] font-semibold bg-transparent"
          />
          <button className=" hidden ml-3 w-[5.5rem] h-10 bg-[#FF7800] text-white cursor-pointer hover:scale-95 rounded-xl transition-transform duration-200">
            Search
          </button>
        </div>
        {/*search button */}
        <div className="absolute top-32">
          <button className="block md:hidden p-3 bg-[#FF7800] rounded-xl text-white">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Version (original) */}
      <div className="hidden md:flex relative items-center justify-center space-x-4">
        {/* your original desktop code here */}
      </div>
    </div>
  );
};

export default UserHome;
