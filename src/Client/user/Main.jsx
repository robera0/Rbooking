import {
  House,
  Drum,
  Box,
  Trophy,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Search,
  Sunset,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { CalendarDemo } from "../../components/ui/calendar";
import { useNavigate, useLocation } from "react-router-dom";

// Menu button component
const MenuBar = ({ name, icon, path }) => {
  const navigate = useNavigate();
  const isActive = location.pathname === path;

  return (
    <button
      onClick={() => navigate(path)}
      className={`group flex w-42 items-center space-x-2 px-4 py-2 rounded-md duration-300
        ${
          isActive
            ? "bg-white text-[#FF7800]"
            : "text-white hover:bg-white hover:text-[#FF7800]"
        }
      `}
    >
      <span
        className={`${
          isActive ? "text-[#FF7800]" : "text-white group-hover:text-[#FF7800]"
        }`}
      >
        {icon}
      </span>

      <span
        className={`font-semibold
          ${
            isActive
              ? "text-[#FF7800]"
              : "text-white group-hover:text-[#FF7800]"
          }
        `}
      >
        {name}
      </span>
    </button>
  );
};

const Main = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState("");
  const [dateSlide, setDateSlide] = useState(false);

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  };

  return (
    <div className="space-y-5">
      <div className="relative flex space-x-4">
        {/* LEFT SIDE (MENU) */}
        <div className="absolute flex flex-col justify-center items-center h-120 w-130 -left-52 -top-16 pl-20 pt-8 bg-[#FF7800] space-y-4 rounded-full">
          <div className="w-full h-12">
            <h1 className="ml-36 pb-26 font-irish font-semibold text-white text-3xl">
              Time Event
            </h1>
          </div>

          <div className="pl-4 space-y-3">
            <MenuBar
              name="Home"
              icon={<House />}
              path="/event_home"
              navigate={navigate}
              location={location}
            />
            <MenuBar
              name="Fest"
              icon={<Sunset />}
              path="/event_fest"
              navigate={navigate}
              location={location}
            />
            <MenuBar
              name="Concert"
              icon={<Drum />}
              path="/event_concerts"
              navigate={navigate}
              location={location}
            />
            <MenuBar
              name="Exhibition"
              icon={<Box />}
              path="/event_exhibition"
              navigate={navigate}
              location={location}
            />
            <MenuBar
              name="Sports"
              icon={<Trophy />}
              path="/event_sports"
              navigate={navigate}
              location={location}
            />
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div
          style={{
            backgroundImage: `url("${"datebackground.jpg"}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="flex-1 h-104 flex justify-center items-center  space-x-4 "
        >
          {/* Calendar + Search container */}
          <div className="relative flex items-center justify-center space-x-4">
            {/* Calendar button + dropdown */}
            <div className="relative w-80 ">
              <button
                onClick={() => setDateSlide(!dateSlide)}
                className="w-full flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow-md"
              >
                <div className="flex items-center h-14 space-x-4">
                  <CalendarIcon strokeWidth={2} className="text-[#FF7800]" />
                  <div className="flex-col">
                    {!date ? (
                      <>
                        <div>
                          <span className="text-[#FF7800] font-semibold">
                            Dates
                          </span>
                        </div>
                        <div>
                          <span className="text-[#FF7800] font-semibold">
                            All Dates
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-[#FF7800] font-semibold">
                            {date.toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {dateSlide ? (
                  <ChevronUp className="text-black transition-transform duration-300" />
                ) : (
                  <ChevronDown className="text-black transition-transform duration-300" />
                )}
              </button>

              {/* Calendar dropdown (absolute) */}
              <div
                className={`absolute left-0 top-full mt-5 w-full bg-[#D9D9D9] rounded-lg overflow-hidden  z-50 
                transition-[max-height] duration-500 ease-in-out
                ${dateSlide ? "max-h-[500px]" : "max-h-0"}`}
              >
                <CalendarDemo
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  buttonVariant="ghost"
                  className="pl-4 w-full bg-white rounded-xl shadow-lg text-black"
                  classNames={{
                    day: "h-10 w-10 flex items-center justify-center rounded-lg hover:bg-orange-200",
                    month_caption:
                      "text-lg text-center font-semibold text-orange-500",
                    nav_button: "text-orange-500 hover:text-orange-700",
                  }}
                />
              </div>
            </div>
            {/* Search box */}
            <div className="w-120 bg-white h-18 rounded-lg">
              <div className=" w-full h-full bg-white rounded-lg shadow-md flex items-center px-4 ">
                <Search
                  strokeWidth={2}
                  className="text-[#FF7800] w-6 h-6 mr-3"
                />
                <input
                  type="text"
                  placeholder="Artist, Event or Venue"
                  className="flex-1 outline-none text-[#FF7800] placeholder-[#FF7800] font-semibold bg-transparent"
                />
                <button className="ml-4 w-26 h-10 bg-[#FF7800] text-white cursor-pointer hover:scale-98 rounded-xl">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="w-full h-full "
        >
          {children}{" "}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Main;
