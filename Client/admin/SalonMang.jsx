import { Cards, SearchInput, SalonTable } from "./Cards";
import { motion } from "framer-motion";
import {
  Store,
  BadgeCheck,
  History,
  Ban,
  CirclePlus,
  Funnel,
  CloudUpload,
  CalendarDays,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSalonContext } from "@/Context/salonContext";
const SalonMang = () => {
  const startRef = useRef(null);
  const endRef = useRef(null);
  const navigate = useNavigate();
  const { page, setPage, salons, current_page, total_pages } =
    useSalonContext();
  return (
    <div>
      <div className="w-[97%] space-y-8">
        <div>
          <h1 className="text-3xl font-semibold"> Salon Management </h1>
        </div>
        <div className="mt-10 flex  flex-wrap gap-10">
          {/*users */}
          <Cards
            header="Total Salons"
            num={salons?.length}
            topicons={
              <Store strokeWidth={2} className=" w-12 h-12  text-[#D38BB3]" />
            }
            daily_diff="Register on Platform"
          />

          {/*Verified Users */}
          <Cards
            header="Verified Salons "
            num="10"
            topicons={
              <BadgeCheck
                strokeWidth={1}
                className=" w-22 h-22 text-white fill-[#A8D8A0]"
              />
            }
            daily_diff="Ready for booking"
          />
          {/*Active Users */}
          <Cards
            header="Pending Approvals "
            num="3"
            topicons={
              <History strokeWidth={2} className=" w-12 h-12  text-[#FDCC9B]" />
            }
            daily_diff="Awaiting Review"
          />
          {/*Deleted Users */}
          <Cards
            header="Rejected "
            num="3"
            topicons={
              <Ban strokeWidth={2} className=" w-12 h-12  text-[#F7A198]" />
            }
            daily_diff="Reject the request"
          />
        </div>
        <div className="flex justify-end mr-4">
          <button
            onClick={() => navigate("/salon/addSalon")}
            className="w-42 h-12 px-2  py-3 flex justify-center text-white font-semibold bg-[#A61866] rounded-full cursor-pointer  hover:bg-white hover:text-[#A61866] transition-all ease-in duration-300 space-x-4"
          >
            <span className="flex-shrink-0 flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
              <CirclePlus className="w-5 h-5" />
            </span>

            <h1 className="text-md ">Add Salon</h1>
          </button>
        </div>
        {/*Table of customers */}
        <div className="w-full flex flex-wrap  gap-8">
          <SearchInput
            w="w-140"
            h="h-14"
            top="top-4"
            left="left-3"
            placeholder="Search user name, email..."
          />
          {/*filter */}
          <button className=" w-42 h-12 flex justify-center items-center  bg-[#F5F6FA] rounded-full gap-2 ">
            <Funnel className="text-gray-500" />
            <select
              className="text-gray-500 w-24 rounded-xl  outline-none"
              name=""
              id=""
            >
              <option value="">Filter By</option>
            </select>
          </button>

          {/*date */}
          <div className="w-92 h-12 px-3 flex items-center bg-[#F5F6FA] rounded-full gap-3">
            {/* Start date */}
            <div className="w-40 h-8 px-2 bg-white rounded-lg flex items-center gap-2">
              <button
                type="button"
                onClick={() => startRef.current?.showPicker()}
                className="text-gray-500 cursor-pointer"
              >
                <CalendarDays size={18} />
              </button>
              <input
                ref={startRef}
                type="date"
                className="no-calendar outline-none w-24 bg-transparent"
              />
            </div>

            <span className="text-gray-600">to</span>

            {/* End date */}
            <div className="w-40 h-8 px-2 bg-white rounded-lg flex items-center gap-2">
              <button
                type="button"
                onClick={() => endRef.current?.showPicker()}
                className="text-gray-500 cursor-pointer"
              >
                <CalendarDays size={18} />
              </button>
              <input
                ref={endRef}
                type="date"
                className="no-calendar outline-none w-24 bg-transparent"
              />
            </div>
          </div>
          {/*Export */}
          <button className=" w-42 h-12 flex justify-center items-center  bg-[#F5F6FA] rounded-full gap-2 cursor-pointer ">
            <h1 className="text-gray-500">Export</h1>
            <CloudUpload className="text-gray-500 " />
          </button>
          <div className="overflow-hidden rounded-t-2xl ">
            <SalonTable />
          </div>
          <div className="w-full mb-4 flex flex-wrap justify-between">
            <p className="text-gray-500 text-lg f  pl-4 ">
              showing 10 from 160 entries
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className=" w-24 h-10 flex justify-center items-center text-lg text-[#BD5990] bg-[#E7D6DF] rounded-2xl hover:bg-[#A61866] cursor-pointer hover:text-white transition duration-300 gap-2 "
                disabled={page === 1}
              >
                Previous
              </button>

              <div className="relative max-w-[60%] min-w-[120px] h-11 flex bg-white rounded-2xl overflow-x-auto">
                <motion.div
                  layout
                  style={{
                    position: "absolute",
                    top: 0,
                    left: (page - 1) * 60,
                    width: 60,
                    height: "100%",
                    backgroundColor: "#A61866",
                    borderRadius: 12,
                    zIndex: 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                {Array.from({ length: total_pages }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-15 h-full flex justify-center items-center ${
                      i + 1 === page ? "text-white" : "text-[#A61866]"
                    } font-bold z-10 cursor-pointer`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              <button
                disabled={page === total_pages}
                className=" w-24 h-10 flex justify-center items-center text-lg text-[#BD5990] bg-[#E7D6DF] rounded-2xl hover:bg-[#A61866] cursor-pointer hover:text-white transition duration-300 gap-2 "
                onClick={() => setPage((p) => Math.min(total_pages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonMang;
