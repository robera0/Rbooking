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
import { useQuery } from "@tanstack/react-query";
import { useService } from "../src/Context/ServiceContext";
import { Loader2 } from "lucide-react";

const Report = () => {
  const { API_URL } = useService();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/analytics/dashboard`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-[#FF7A00] animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-[0.2em]">
          Generating Matrices...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 border-b border-white/[0.04] pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
            Reports & <span className="text-[#FF7A00]">Analytics</span>
          </h1>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        {/*users */}
        <Cards
          header="Total Users"
          num={stats?.users?.total?.toLocaleString() || "0"}
          bg="bg-[#8280FF]/10 border border-[#8280FF]/20"
          topicons={
            <Users strokeWidth={2.5} className="w-6 h-6 text-[#8280FF]" />
          }
          bottomIcon={<TrendingUp className="text-[#5EC750]" size={16} />}
          percent_change={`+${stats?.users?.newLast7Days || 0}`}
          daily_diff="Up from past week"
        />
        {/*Booking */}
        <Cards
          header="Total Booking"
          num={stats?.bookings?.total?.toLocaleString() || "0"}
          bg="bg-[#FDC142]/10 border border-[#FDC142]/20"
          topicons={
            <CalendarCheck
              strokeWidth={2.5}
              className="w-6 h-6 text-[#FDC142]"
            />
          }
          bottomIcon={<TrendingDown className="text-[#F9496F]" size={16} />}
          percent_change=""
          daily_diff="All completed orders"
        />
        {/*Approvals */}
        <Cards
          header="Pending Approvals"
          num={stats?.bookings?.pending?.toLocaleString() || "0"}
          bg="bg-[#FF9871]/10 border border-[#FF9871]/20"
          topicons={
            <History strokeWidth={2.5} className="w-6 h-6 text-[#FF9871]" />
          }
          bottomIcon={<TrendingUp className="text-[#5EC750]" size={16} />}
          percent_change=""
          daily_diff="Waiting clearance"
        />
      </div>

      {/*Graphs */}

      <div className="flex flex-wrap gap-10">
        <div className="w-2/3 h-full pt-6  bg-[#1C1F22] shadow-xl space-y-12 rounded-lg">
          <div className="flex flex-wrap justify-between">
            <h1 className="text-2xl pl-4  font-semibold">Booking Over Time</h1>
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

        <div className="flex-1 space-y-8  pt-6 bg-[#1C1F22]  shadow-xl rounded-xl ">
          <div>
            <h1 className="text-2xl pl-4 font-semibold">Customers</h1>
          </div>
          <div className=" flex justify-center items-center">
            <ArcDesign />
          </div>
          <div className="flex flex-col  justify-center items-center ">
            <div className="flex flex-wrap space-x-12">
              <div className="flex flex-col justify-between space-y-2">
                <h1 className="text-3xl text-center text-white font-bold">
                  10,293
                </h1>
                <div className="flex flex-wrap  items-center  space-x-3  ">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <p className=" text-[#6F6F6F] font-semibold">New Customers</p>
                </div>
              </div>
              <div className="flex flex-col  justify-between space-y-2">
                <h1 className="text-3xl text-center  text-white font-bold">
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
        <div className="w-full h-full pt-6 bg-[#1C1F22] space-y-12 rounded-lg">
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
      </div>
      {/*Revenue */}
      <div className="w-full h-full bg-[#1C1F22]  shadow-xl mb-10 rounded-xl">
        <div className="w-full h-full pt-6 bg-[#1C1F22] rounded-xl">
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
  );
};

export default Report;
