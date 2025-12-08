import { Scissors, Menu, Bell, CircleUser, House, Ticket } from "lucide-react";
import { MenuBar } from "../../components/Reusable";
const Main = ({ children }) => {
  return (
    <div className="h-auto">
      <div className="relative flex h-screen overflow-hidden bg-[#222529] flex-col ">
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
            <button className="relative flex justify-center items-center w-8 h-8 bg-[#3F454B] rounded-sm">
              {/*PING */}
              <div className="absolute top-0 left-6 w-2 h-2 rounded-full  animate-ping bg-red-400"></div>
              <span>
                <Bell className="w-4 h-4" />
              </span>
            </button>
            {/*profile */}
            <button className="relative flex justify-center items-center w-8 h-8 bg-[#3F454B] rounded-sm">
              <div className=" w-4 h-4 rounded-full absolute ping-red-400"></div>
              <span>
                <CircleUser className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 scroll-hidden pt-6 pb-24">
          {children}
        </div>
        {/*Footer */}

        {/*menu Bar */}
        <div className="fixed bottom-0 left-0 flex w-full justify-around bg-[#191B1D] py-4  mt-2 z-100 rounded-t-3xl">
          <MenuBar icon={<House />} header="Home" />
          <MenuBar icon={<Ticket />} header="Ticket" />
          <MenuBar icon={<CircleUser />} header="Account" />
        </div>
      </div>
    </div>
  );
};

export default Main;
