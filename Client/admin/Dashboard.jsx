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
import RevenueChart from "./RevenueGraph";
import { useQuery } from "@tanstack/react-query";
import { useService } from "../src/Context/ServiceContext";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { API_URL } = useService();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/analytics/dashboard`);
      if (!res.ok) throw new Error("Failed to load dashboard stats");
      const json = await res.json();
      return json.data;
    }
  });

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-[#FF7A00] animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-[0.2em]">Syncing Analytics...</p>
      </div>
    );
  }
  return (
    <div className="w-full max-w-full space-y-8">
      {/* Header */}
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none">
          Admin <span className="text-[#FF7A00]">Dashboard</span>
        </h1>
        <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
      </div>

      <div className="flex flex-wrap flex-col md:flex-row gap-6">
        <Cards
          header="Total Users"
          num={stats?.users?.total?.toLocaleString() || "0"}
          bg="bg-[#E5E4FF]/10"
          topicons={<Users strokeWidth={2.5} className="w-6 h-6 text-[#8280FF]" />}
          bottomIcon={<TrendingUp className="text-[#5EC750]" size={16} />}
          percent_change={`+${stats?.users?.newLast7Days || 0}`}
          daily_diff="New this week"
        />
        <Cards
          header="Total Bookings"
          num={stats?.bookings?.total?.toLocaleString() || "0"}
          bg="bg-[#FFF3D6]/10"
          topicons={<CalendarCheck strokeWidth={2.5} className="w-6 h-6 text-[#FDC142]" />}
          bottomIcon={<TrendingUp className="text-[#5EC750]" size={16} />}
          percent_change={`${stats?.bookings?.pending || 0} Pending`}
          daily_diff=""
        />
        <Cards
          header="Active Events"
          num={stats?.events?.total?.toLocaleString() || "0"}
          bg="bg-[#D9F7E8]/10"
          topicons={<History strokeWidth={2.5} className="w-6 h-6 text-[#0DBAA0]" />}
          bottomIcon={<TrendingUp className="text-[#5EC750]" size={16} />}
          percent_change="Live"
          daily_diff="Platform wide"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column (Revenue) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6 lg:gap-8">
          <div className="w-full bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-6 md:p-8 shadow-xl flex flex-col min-h-[300px]">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h1 className="text-xl font-bold text-white uppercase tracking-tight">Revenue Breakdown</h1>
              </div>
              <div>
                <button className="px-6 py-3 bg-[#FF7A00] text-black hover:bg-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg active:scale-95">
                  View Report
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-end justify-center pb-4 text-gray-500 italic font-medium">
              [Revenue Breakdown Chart UI]
            </div>
          </div>

          <div className="w-full bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-6 md:p-8 shadow-xl flex flex-col min-h-[400px]">
            <div className="flex flex-wrap justify-between mb-8 items-center">
              <h1 className="text-xl text-white font-bold uppercase tracking-tight">Revenue History</h1>
              <select
                className="bg-white/[0.02] border border-white/[0.08] text-[10px] md:text-xs px-5 py-2.5 font-bold text-white uppercase tracking-widest rounded-full outline-none focus:border-[#FF7A00]/50 transition-colors"
                name=""
                id=""
              >
                <option className="bg-[#1C1F22] text-white" value="2024">
                  Year: 2024
                </option>
              </select>
            </div>
            {/* graph content */}
            <div className="flex-1 w-full relative min-h-[300px]">
              <RevenueChart />
            </div>
          </div>
        </div>

        {/* Right Column (Customers) */}
        <div className="flex-1 space-y-8 bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-6 md:p-8 shadow-xl flex flex-col min-h-[400px]">
          <div>
            <h1 className="text-xl text-white font-bold uppercase tracking-tight">Customers</h1>
          </div>
          <div className="flex justify-center items-center flex-1 min-h-[250px]">
            <ArcDesign />
          </div>
          <div className="flex flex-col justify-center items-center pb-4 pt-6 border-t border-white/[0.06]">
            <div className="flex w-full justify-around px-2">
              <div className="flex flex-col items-center space-y-3">
                <h1 className="text-3xl md:text-4xl text-center text-white font-black tracking-tighter">
                  {stats?.users?.newLast7Days?.toLocaleString() || "0"}
                </h1>
                <div className="flex items-center space-x-2 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] shadow-[0_0_10px_rgba(255,122,0,0.5)]"></div>
                  <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] leading-none mt-0.5">
                    New Current
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <h1 className="text-3xl md:text-4xl text-center text-white font-black tracking-tighter">
                  {(stats?.users?.total - (stats?.users?.newLast7Days || 0)).toLocaleString() || "0"}
                </h1>
                <div className="flex items-center space-x-2 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                  <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] leading-none mt-0.5">
                    Established
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
