import { Cards, MarketingTable } from "./Cards";
import {
  MousePointerClick,
  BellRing,
  CalendarClock,
  PencilLine,
  CirclePlus,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
const Marketing = () => {
  const startRef = useRef(null);
  const endRef = useRef(null);
  const navigate = useNavigate();

  return (
    <div>
      <div className="w-[98%] space-y-8">
        <div>
          <h1 className="text-3xl font-semibold"> Marketing & Notification </h1>
        </div>
        <div className="mt-10 flex  flex-wrap gap-10">
          {/*Notification */}
          <Cards
            header="Total Notification"
            num="150"
            topicons={
              <BellRing
                strokeWidth={2}
                className=" w-12 h-12  text-[#A61866]"
              />
            }
            daily_diff="Campaigns created"
          />

          {/* Engagement */}
          <Cards
            header="Engagement Rate "
            num="64 %"
            topicons={
              <MousePointerClick
                strokeWidth={2.5}
                className=" w-12 h-12 text-[#52B141]"
              />
            }
            daily_diff="Click through rate of campaign"
          />
          {/*Scheduled Notification */}
          <Cards
            header="Scheduled Notification "
            num="25"
            topicons={
              <CalendarClock
                strokeWidth={2}
                className=" w-12 h-12  text-[#FC8A16]"
              />
            }
            daily_diff="Awaiting for the time"
          />
          {/*Draft Notification */}
          <Cards
            header="Draft Notification "
            num="5"
            topicons={
              <PencilLine strokeWidth={2} className=" w-11 h-11 text-black" />
            }
            daily_diff="Awaiting Completed"
          />
        </div>
        <div className="flex justify-end mr-6">
          <button
            onClick={() => navigate("/marketing/create_notification")}
            className="w-48 h-12 px-2  py-3 flex justify-center  items-center text-white  bg-[#A61866] rounded-full cursor-pointer  hover:bg-white hover:text-[#A61866] transition-all ease-in duration-300 space-x-3"
          >
            <span className="flex-shrink-0 transform transition-transform duration-200 group-hover:scale-110">
              <CirclePlus className=" w-4 h-4 " />
            </span>

            <h1 className="text-md ">Create Notification</h1>
          </button>
        </div>
        {/*Table of customers */}
        <div className="w-full flex flex-wrap  gap-8">
          <div className="overflow-hidden rounded-t-2xl ">
            <MarketingTable />
          </div>
          <div className="w-full mb-4 flex flex-wrap justify-between">
            <p className="text-gray-500 text-md font-semibold pl-4 ">
              showing 10 from 160 entries
            </p>
            <div className="  flex flex-wrap gap-6">
              <button className=" w-38 h-10 flex justify-center items-center  text-lg text-[#BD5990]  bg-[#E7D6DF] hover:bg-[#A61866]  cursor-pointer hover:text-white transition duration-300 rounded-xl gap-2 ">
                <ChevronsLeft strokeWidth={2} />
                Previous
              </button>

              <div className=" w-62 h-11 flex bg-white rounded-2xl">
                <div
                  className={`w-15 h-full flex justify-center items-center text-white font-bold bg-[#A61866] font-bold rounded-2xl`}
                >
                  <h1 className="text-center">1</h1>
                </div>
                <div
                  className={`w-15 h-full flex justify-center items-center text-[#A61866] font-bold  font-bold rounded-2xl`}
                >
                  <h1 className="text-center">2</h1>
                </div>
                <div
                  className={`w-15 h-full flex justify-center items-center text-[#A61866] font-bold  font-bold rounded-2xl`}
                >
                  <h1 className="text-center">3</h1>
                </div>
                <div
                  className={`w-15 h-full flex justify-center items-center text-[#A61866] font-bold font-bold rounded-2xl`}
                >
                  <h1 className="text-center">4</h1>
                </div>
              </div>
              <button className=" w-24 h-10  flex justify-center items-center  text-lg text-[#BD5990]  bg-[#E7D6DF] rounded-2xl hover:bg-[#A61866] cursor-pointer hover:text-white transition duration-300 gap-2 ">
                Next
                <ChevronsRight strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
