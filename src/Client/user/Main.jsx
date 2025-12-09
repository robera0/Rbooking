import {
  Scissors,
  Menu,
  Bell,
  CircleUser,
  House,
  Ticket,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Facebook,
} from "lucide-react";
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
          {/*Footer */}
          <div className="  w-full h-92 pt-8 pl-4 bg-[#0B0A12]">
            <div className=" space-y-8">
              <div className="space-y-2">
                <div className="flex flex-cols space-x-2">
                  <Scissors className="text-[#B3B3B3] mt-2 w-8 h-8" />
                  <h1 className="font-irish text-xl w-12 text-white font bold">
                    Kuretegn Event
                  </h1>
                </div>

                <p className=" pl-8 w-[95%] text-[#B3B3B3]">
                  Flawed plans, but full support everyone believed in him!
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-cols pl-4 mt-4 space-x-3">
                  <Phone className=" text-white  mt-2 w-5 h-5" />
                  <h1 className="text-lg w-12 text-[#B3B3B3] font bold">
                    +25181234567
                  </h1>
                </div>
                <div className="flex flex-cols items-center   pl-4 space-x-3">
                  <Mail className=" text-white  mt-2 w-5 h-5" />
                  <h1 className="text-lg w-12 text-[#B3B3B3] font bold">
                    kuretugnevent@gmail.con
                  </h1>
                </div>
              </div>

              {/*SOCIAL MEDIA */}
              <div className="flex flex-col mt-8  mr-12  items-end text-white  space-y-3">
                <h1 className="text-lg ">Follow Us on</h1>
                <div className="flex items-center   pl-4 space-x-3">
                  <Instagram />
                  <Facebook />
                  <Twitter />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*menu Bar */}
        <div className="fixed bottom-0 left-0 flex w-full justify-around bg-[#191B1D] py-4  z-100 rounded-t-3xl">
          <MenuBar icon={<House />} header="Home" path={"/event_home"} />
          <MenuBar icon={<Ticket />} header="Ticket" path={"/tickets_home"} />
          <MenuBar icon={<CircleUser />} header="Account" path={"/account"} />
        </div>
      </div>
    </div>
  );
};

export default Main;
