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

const Dashboard = () => {
  return (
    <div className="">
      <div className="w-[97%]  space-y-4">
        <div>
          <h1 className="text-2xl font-medium"> Dashboard </h1>
        </div>

        <div className="flex  flex-wrap gap-10">{/*users */}</div>

        {/*Revenue  */}
        <div className="flex flex-wrap gap-10">
          <div className="w-2/3 h-full pt-6 bg-white rounded-xl">
            <div className="flex flex-wrap justify-between">
              <div>
                <h1 className="text-lg pl-4 ">Revenue</h1>
              </div>

              <div>
                <button className=" w-32 p-2 bg-[#fdb469] text-sm text-white rounded-sm">
                  View Report
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8  pt-6 bg-white rounded-xl ">
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

        {/*Revenue */}
        <div className="w-full h-full bg-white rounded-xl">
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

export default Dashboard;
