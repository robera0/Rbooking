import {
  Cards,
  TransactionTable,
  CustomSelect,
  SearchInput,
} from "./Cards";
import {
  CalendarDays,
  Receipt,
  Funnel,
  CloudUpload,
  ChevronsRight,
  ChevronsLeft,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useService } from "../src/Context/ServiceContext";
import api from "../src/Context/api/api.config";

const Payment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { API_URL } = useService();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const res = await api.get(`/api/auth/admin/analytics/dashboard`);
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={48} className="text-[#FF7A00] animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-[0.2em]">Locating Ledgers...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 border-b border-white/[0.04] pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            Payments & <span className="text-[#FF7A00]">Commission</span>
          </h1>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
        </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Cards
          header="Total Earnings"
          num={`${stats?.revenue?.totalEarnings?.toLocaleString() || "0"} ETB`}
          topicons={<Receipt strokeWidth={2.5} className="w-6 h-6 text-[#FF7A00]" />}
          percent_change={`+ ${stats?.revenue?.recentEarnings?.toLocaleString() || "0"} ETB`}
          daily_diff="Past 30 Days"
          bg="bg-[#FF7A00]/10"
        />
        <Cards
          header="Platform Commission"
          num={`${stats?.revenue?.platformCommission?.toLocaleString() || "0"} ETB`}
          topicons={<Receipt strokeWidth={2.5} className="w-6 h-6 text-[#5EC750]" />}
          percent_change={`+ ${stats?.revenue?.recentCommission?.toLocaleString() || "0"} ETB`}
          daily_diff="Past 30 Days"
          bg="bg-[#5EC750]/10"
        />
        <Cards
          header="Avg. Daily Commission"
          num={`${(stats?.revenue?.recentCommission / 30 || 0).toFixed(2).toLocaleString()} ETB`}
          topicons={<Receipt strokeWidth={2.5} className="w-6 h-6 text-purple-500" />}
          percent_change={`${(stats?.revenue?.commissionRate * 100) || 0}%`}
          daily_diff="Current Rate"
          bg="bg-purple-500/10"
        />
      </div>

      {/* Main Table Interface */}
      <div className="bg-[#1C1F22] border border-white/[0.04] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-xl flex flex-col min-h-[500px]">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Transaction <span className="text-[#FF7A00]">History</span></h2>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="min-w-[240px]">
              <SearchInput 
                h="h-12"
                placeholder="Search Reference or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <CustomSelect 
              icon={Funnel}
              options={[
                { label: "All Statuses", value: "" },
                { label: "Success", value: "success" },
                { label: "Failed", value: "failed" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by Status"
            />

            {/* Export */}
            <button className="h-12 px-6 flex justify-center items-center bg-[#FF7A00] text-black hover:bg-white rounded-full gap-2 transition-all active:scale-95 shadow-lg group">
              <h1 className="font-black text-xs uppercase tracking-widest">Export</h1>
              <CloudUpload strokeWidth={3} className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8 bg-[#121417]/50 p-2 rounded-2xl border border-white/[0.04] w-full sm:w-fit">
           <div className="h-10 px-4 flex items-center bg-[#121417] border border-white/[0.06] rounded-xl gap-3 text-white">
              <CalendarDays className="text-gray-500 w-4 h-4" />
              <input type="date" className="bg-transparent text-[10px] font-black uppercase outline-none text-white w-[120px] cursor-pointer" />
            </div>
            <span className="text-gray-600 font-bold text-[10px] uppercase tracking-widest">TO</span>
            <div className="h-10 px-4 flex items-center bg-[#121417] border border-white/[0.06] rounded-xl gap-3 text-white">
              <CalendarDays className="text-gray-500 w-4 h-4" />
              <input type="date" className="bg-transparent text-[10px] font-black uppercase outline-none text-white w-[120px] cursor-pointer" />
            </div>
        </div>

        {/* Table Render */}
        <div className="w-full overflow-x-auto flex-1">
          <TransactionTable search={searchTerm} filter={statusFilter} />
        </div>

        {/* Pagination Footer */}
        <div className="w-full mt-6 flex flex-wrap justify-between items-center gap-4 border-t border-white/[0.04] pt-6">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
            Showing filtered analytics results
          </p>
          
          <div className="flex items-center gap-2">
            <button className="h-10 px-4 flex justify-center items-center text-[10px] font-black uppercase tracking-widest text-[#FF7A00] bg-[#FF7A00]/10 hover:bg-[#FF7A00] hover:text-black transition duration-300 rounded-xl gap-2 active:scale-95">
              <ChevronsLeft strokeWidth={2.5} className="w-4 h-4" />
            </button>

            <div className="flex bg-[#121417] border border-white/[0.06] rounded-xl h-10 p-1">
                <button className={`w-8 h-full flex justify-center items-center text-xs font-black rounded-lg bg-[#FF7A00] text-black shadow-md`}>1</button>
            </div>

            <button className="h-10 px-4 flex justify-center items-center text-[10px] font-black uppercase tracking-widest text-[#FF7A00] bg-[#FF7A00]/10 hover:bg-[#FF7A00] hover:text-black transition duration-300 rounded-xl gap-2 active:scale-95">
              <ChevronsRight strokeWidth={2.5} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
