import React from "react";
import { Menu, CircleCheckBig } from "lucide-react";
import { useService } from "@/Context/ServiceContext";
import { motion } from "framer-motion";
const Account = () => {
  const { setIsAccountActive } = useService();
  const progress = 80;
  return (
    <div className="mb-12 flex flex-col items-center space-y-8">
      {/*MENU BUTTON */}
      <div className="flex justify-center  ">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsAccountActive(true);
          }}
          className="flex text-white  font-semibold bg-[#FF7800] px-26 py-3 rounded-xl space-x-2 lg:cursor-pointer"
        >
          <Menu />
          <span>Menu</span>
        </button>
      </div>

      {/*PROGRESS SECTION */}

      <div className="w-[92%]  h-auto  bg-[#2A2C31]  rounded-md pl-6 pt-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <h1 className="text-lg text-white font-semibold">
              complete your profile
            </h1>
            <h1 className="text-lg text-white font-semibold mr-8">
              {progress}%
            </h1>
          </div>
          {/*PROGRESS BAR */}
          <div className="w-[95%] h-2 bg-[#202020] rounded-md overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
              className="h-full bg-[#62FE8A] rounded-md"
            />
          </div>

          <p className="w-full text-[#808080] text-sm">
            Get the best out of booking by adding the remaining details!
          </p>
        </div>

        {/*VARIFICATION  */}
        <div className="flex flex-wrap  w-[95%] h-20 bg-[#191B1D] px-3 mb-8 rounded-md gap-x-6 gap-y-2">
          {/* EMAIL */}
          <div className="flex items-center space-x-2">
            <CircleCheckBig className="w-4 h-4 text-[#14AE5C]" />
            <h1 className="text-sm text-white font-semibold">Verified Email</h1>
          </div>

          {/* MOBILE NUMBER */}
          <div className="flex items-center space-x-2">
            <CircleCheckBig className="w-4 h-4 text-[#14AE5C]" />
            <h1 className="text-sm text-white font-semibold">
              Verified Mobile Number
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
