import React from "react";
import { Menu, CircleX } from "lucide-react";
import { AccountSideMenu } from "../../components/Reusable";
const Account = () => {
  return (
    <div className="mb-12">
      {/* SIDE BAR */}

      <div className="w-[80%] ml-12 h-[750px] pt-2 pb-8 bg-[#222529] shadow-2xl space-y-4">
        {/* Close button row */}
        <div className="flex justify-end p-4">
          <CircleX className="w-8 h-8 text-white cursor-pointer" />
        </div>

        <AccountSideMenu />
      </div>

      {/*MENU BUTTON */}
      <div className="flex justify-center  ">
        <button className="flex text-white  font-semibold bg-[#FF7800] px-26 py-3 rounded-xl space-x-2 lg:cursor-pointer">
          <Menu />
          <span>Menu</span>
        </button>
      </div>

      {/*PROGRESS SECTION */}
    </div>
  );
};

export default Account;
