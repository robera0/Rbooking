import {
  Search,
  Bell,
  UserRoundCog,
  ChevronDown,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { SearchInput } from "./Cards";
import { AnimatePresence, motion } from "framer-motion";

// Single dropdown item
export const Dropdown = ({ name, icon }) => {
  return (
    <button className="group w-full h-12 px-2 flex items-center justify-start text-md border-b border-gray-200 space-x-2 cursor-pointer hover:bg-gray-100">
      <div className="text-gray-500 group-hover:text-gray-700">{icon}</div>
      <h1 className="text-md">{name}</h1>
    </button>
  );
};

const Header = () => {
  const [drop, setDrop] = useState(false);

  return (
    <div className="w-full h-18 bg-inherit flex border border-gray-200">
      {/* Right side: search bar */}
      <div className="w-1/2 flex justify-center items-center">
        <SearchInput
          w="w-94"
          h="h-10"
          top="top-2"
          left="left-3"
          placeholder="Search booking, salons..."
        />
      </div>

      {/* Left side: notifications, language, profile */}
      <div className="pl-34 flex-1 flex items-center justify-center space-x-8">
        {/* Language */}
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-400"></div>
          <select className="text-gray-500 w-24 rounded-xl outline-none">
            <option value="english">English</option>
          </select>
        </div>

        {/* Profile */}
        <div className="relative flex flex-col justify-center items-center">
          <button
            onClick={() => setDrop((prev) => !prev)}
            className="relative flex items-center w-52 h-12 justify-between border border-gray-400 rounded-full px- cursor-pointer z-10"
          >
            {/* Profile image */}
            <div
              style={{
                backgroundImage: 'url("/userdefault.webp")',
                backgroundSize: "110%",
                backgroundPosition: "center top",
              }}
              className="w-11 h-11 bg-cover rounded-full bg-gray-200"
            ></div>

            {/* Name */}
            <div className="text-sm text-gray-400 font-semibold">
              <p className="font-bold">Velvet</p>
              <p>Admin</p>
            </div>

            {/* Chevron */}
            <ChevronDown
              strokeWidth={4}
              className="w-4 h-4 mr-2 text-gray-400"
            />
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {drop && (
              <motion.div
                key="dropdown"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute top-full right-0 mt-2 w-52 bg-white space-y-2 shadow-xl rounded-xl overflow-hidden z-50"
              >
                <Dropdown
                  icon={<UserRoundCog strokeWidth={2} />}
                  name="Manage Account"
                />
                <Dropdown
                  icon={<KeyRound strokeWidth={2} />}
                  name="Change Password"
                />
                <Dropdown
                  icon={<RotateCcw strokeWidth={2} />}
                  name="Active Log"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Notification */}
        <div className="relative cursor-pointer">
          <button className="w-full h-full flex items-center justify-center cursor-pointer">
            <Bell
              strokeWidth={3}
              className=" fill-gray-400 w-6 h-6 text-gray-400 "
            />
          </button>
          <div className="absolute w-4 h-4 flex items-center justify-center bottom-4 left-4 bg-[#EF3826] rounded-full shadow-lg shadow-purple-500 ">
            <p className="font-bold text-white text-sm text-center">12</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
