import {
  Users,
  TrendingUp,
  UserPlus,
  CalendarCheck,
  History,
  TrendingDown,
  Dot,
} from "lucide-react";
import { Cards } from "./Cards";
import GridDemo from "./Graphs";
import ArcDesign from "./Guage";
import RevenueChart from "./RevenueGraph";
import { CustomLabels } from "./Graphs";
const Report = () => {
  return (
    <div className="">
      <div className="w-[97%]  space-y-12">
        <div>
          <h1 className="text-3xl font-semibold"> Report & Analytics </h1>
        </div>

        <div className="mt-10 flex  flex-wrap gap-10">
          {/*users */}
          <Cards
            header="Total User"
            num="40,689"
            bg="bg-[#E5E4FF]"
            topicons={
              <Users
                strokeWidth={2}
                className=" w-9 h-9 fill-[#8280FF] text-[#8280FF]"
              />
            }
            bottomIcon={<TrendingUp className="text-[#0DBAA0] " />}
            percent_change="8.5%"
            daily_diff="Up from yesterday"
          />
          {/*Registration */}
          <Cards
            header="New Registration"
            num="10,293"
            bg="bg-[#FFF3D6]"
            topicons={
              <UserPlus
                strokeWidth={2}
                className=" w-9 h-9 fill-[#FDC142] text-[#FDC142]"
              />
            }
            bottomIcon={<TrendingUp className="text-[#0DBAA0] " />}
            percent_change="1.3%"
            daily_diff="Up from past Week"
          />
          {/*Booking */}
          <Cards
            header="Total Booking"
            num="89,000"
            bg="bg-[#D9F7E8]"
            topicons={
              <CalendarCheck
                strokeWidth={2}
                className=" w-9 h-9 fill-#56CA00 text-[#57CA01]"
              />
            }
            bottomIcon={<TrendingDown className="text-[#F9496F] " />}
            percent_change="4.35%"
            daily_diff="Down from yesterday"
          />
          {/*Approvals */}
          <Cards
            header="Pending Approvals"
            num="2040"
            bg="bg-[#FFDED1]"
            topicons={
              <History strokeWidth={2} className=" w-9 h-9  text-[#FF9871]" />
            }
            bottomIcon={<TrendingUp className="text-[#0DBAA0] " />}
            percent_change="1.8%"
            daily_diff="Up from yesterday"
          />
        </div>

        {/*Graphs */}

        <div className="flex flex-wrap gap-10">
          <div className="w-2/3 h-full pt-6 bg-white shadow-xl space-y-12 rounded-lg">
            <div className="flex flex-wrap justify-between">
              <h1 className="text-2xl pl-4  font-semibold">
                Booking Over Time
              </h1>
              <select
                className="w-32 px-4 mr-8 border text-sm border-gray-400 font-bold text-gray-400 rounded outline-none"
                name=""
                id=""
              >
                <option className="" value=" 2024">
                  {" "}
                  Year: 2024
                </option>
              </select>
            </div>
            {/*graph content */}
            <GridDemo />
          </div>

          <div className="flex-1 space-y-8  pt-6 bg-white  shadow-xl rounded-xl ">
            <div>
              <h1 className="text-2xl pl-4 font-semibold">Customers</h1>
            </div>
            <div className=" flex justify-center items-center">
              <ArcDesign />
            </div>
            <div className="flex flex-col  justify-center items-center ">
              <div className="flex flex-wrap space-x-12">
                <div className="flex flex-col justify-between space-y-2">
                  <h1 className="text-3xl text-center text-black font-bold">
                    10,293
                  </h1>
                  <div className="flex flex-wrap  items-center  space-x-3  ">
                    <div className="w-3 h-3 rounded-full bg-[#A61866]"></div>
                    <p className=" text-[#6F6F6F] font-semibold">
                      New Customers
                    </p>
                  </div>
                </div>
                <div className="flex flex-col  justify-between space-y-2">
                  <h1 className="text-3xl text-center  text-black font-bold">
                    30,373
                  </h1>
                  <div className="flex flex-wrap  items-center space-x-3  ">
                    <div className="w-3 h-3 flex rounded-full bg-[#EADCE4]"></div>
                    <p className=" text-[#6F6F6F] font-semibold">Repeated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*booking and users */}
        <div className="flex justify-between ">
          <div className="w-[600px] h-full pt-6 bg-white space-y-12 rounded-lg">
            <div className="flex flex-wrap justify-between items-center">
              <h1 className="text-2xl pl-4 font-semibold">Booking</h1>

              <select
                className="w-32 px-4 mr-8 py-2 border text-sm border-gray-400 font-bold text-gray-500 rounded outline-none"
                defaultValue="2024"
              >
                <option value="2024">Year: 2024</option>
                <option value="2025">Year: 2025</option>
              </select>
            </div>

            {/* Graph content */}
            <div className="w-full px-4">
              <CustomLabels /> {/* Replace with your chart component */}
            </div>
          </div>
          {/*User graph */}
          <div className="w-[600px] h-full pt-6 bg-white space-y-12 rounded-lg">
            <div className="flex flex-wrap justify-between items-center">
              <h1 className="text-2xl pl-4 font-semibold">User</h1>

              <select
                className="w-32 px-4 mr-8 py-2 border text-sm border-gray-400 font-bold text-gray-500 rounded outline-none"
                defaultValue="2024"
              >
                <option value="2024">Year: 2024</option>
                <option value="2025">Year: 2025</option>
              </select>
            </div>

            {/* Graph content */}
            <div className="w-full px-4">
              <CustomLabels /> {/* Replace with your chart component */}
            </div>
          </div>
        </div>
        {/*Revenue */}
        <div className="w-full h-full bg-white  shadow-xl mb-10 rounded-xl">
          <div className="w-full h-full pt-6 bg-white rounded-xl">
            <div className="flex flex-wrap justify-between">
              <h1 className="text-2xl pl-4  font-semibold">Revenue</h1>
              <select
                className="w-32 px-4 mr-8 border text-sm border-gray-400 font-bold text-gray-400 rounded outline-none"
                name=""
                id=""
              >
                <option className="" value=" 2024">
                  {" "}
                  Year: 2024
                </option>
              </select>
            </div>
            {/*graph content */}
            <div className="">
              <RevenueChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
