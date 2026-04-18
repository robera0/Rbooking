import React from "react";
import { Menu } from "lucide-react";
import { useService } from "@/Context/ServiceContext";
const Account = ({ children }) => {
  const { setIsAccountActive } = useService();

  return (
    <div className="mb-2 flex flex-col items-center space-y-8">
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
      <div className="w-full ">{children}</div>
    </div>
  );
};

export default Account;
