import { Scissors, Menu, Bell, CircleUser } from "lucide-react";

const Main = ({ children }) => {
  return (
    <div>
      <div className="flex h-screen bg-[#222529] flex-col ">
        <div className="flex justify-between lg:hidden text-white mt-2  p-6">
          <div className="flex  space-x-2">
            <Scissors className="text-[#B3B3B3] mt-2 w-8 h-8" />
            <h1 className="font-irish text-xl w-12 text-white font bold">
              Kuretegn Event
            </h1>
          </div>

          <div className="flex justify-center items-center space-x-3">
            {/*menu */}
            <button>
              <span>
                <Menu />
              </span>
            </button>
            {/*notification */}
            <button className="relative flex justify-center items-center w-6 h-6 bg-[#3F454B] rounded-sm">
              <div className="absolute top-0 left-4 w-2 h-2 rounded-full  animate-ping bg-red-400"></div>
              <span>
                <Bell className="w-3 h-3" />
              </span>
            </button>
            {/*profile */}
            <button className="relative flex justify-center items-center w-6 h-6 bg-[#3F454B] rounded-sm">
              <div className=" w-4 h-4 rounded-full absolute ping-red-400"></div>
              <span>
                <CircleUser className="w-3 h-3" />
              </span>
            </button>
          </div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default Main;
