import {
  Cards,
  TransactionTable,
} from "./Cards";
import {
  CalendarDays,
  Receipt,
  Funnel,
  CloudUpload,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";

const Payment = () => {
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
          num="150,000 ETB"
          topicons={<Receipt strokeWidth={2.5} className="w-6 h-6 text-[#FF7A00]" />}
          percent_change="+ 12%"
          daily_diff="Past 30 Days"
          bg="bg-[#FF7A00]/10"
        />
        <Cards
          header="Platform Commission"
          num="15,000 ETB"
          topicons={<Receipt strokeWidth={2.5} className="w-6 h-6 text-[#5EC750]" />}
          percent_change="+ 4.3%"
          daily_diff="Past 30 Days"
          bg="bg-[#5EC750]/10"
        />
        <Cards
          header="Avg. Commission"
          num="5,000 ETB"
          topicons={<Receipt strokeWidth={2.5} className="w-6 h-6 text-purple-500" />}
          percent_change="+ 2.1%"
          daily_diff="Past 30 Days"
          bg="bg-purple-500/10"
        />
      </div>

      {/* Main Table Interface */}
      <div className="bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-6 shadow-xl">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Transaction <span className="text-[#FF7A00]">History</span></h2>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter */}
            <button className="h-12 px-6 flex justify-center items-center bg-[#121417] border border-white/[0.06] hover:border-[#FF7A00]/50 rounded-full gap-3 transition-colors group">
              <Funnel className="text-gray-500 group-hover:text-[#FF7A00] w-4 h-4 transition-colors" />
              <select className="bg-transparent text-white font-bold text-xs uppercase tracking-widest outline-none cursor-pointer">
                <option className="bg-[#1C1F22]" value="">All Statuses</option>
                <option className="bg-[#1C1F22]" value="success">Success</option>
                <option className="bg-[#1C1F22]" value="failed">Failed</option>
              </select>
            </button>

            {/* Date Range */}
            <div className="h-12 px-4 flex items-center bg-[#121417] border border-white/[0.06] rounded-full gap-3 text-white">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-gray-500 w-4 h-4" />
                <input type="date" className="bg-transparent text-xs font-bold outline-none text-white w-[110px]" />
              </div>
              <span className="text-gray-600 font-bold text-xs uppercase">To</span>
              <div className="flex items-center gap-2">
                <CalendarDays className="text-gray-500 w-4 h-4" />
                <input type="date" className="bg-transparent text-xs font-bold outline-none text-white w-[110px]" />
              </div>
            </div>

            {/* Export */}
            <button className="h-12 px-6 flex justify-center items-center bg-[#FF7A00] text-black hover:bg-white rounded-full gap-2 transition-all active:scale-95 shadow-lg group">
              <h1 className="font-black text-xs uppercase tracking-widest">Export</h1>
              <CloudUpload strokeWidth={3} className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Table Render */}
        <div className="w-full overflow-x-auto rounded-tl-xl rounded-tr-xl border border-white/[0.08]">
          <TransactionTable />
        </div>

        {/* Pagination Footer */}
        <div className="w-full mt-6 flex flex-wrap justify-between items-center gap-4 border-t border-white/[0.04] pt-6">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest pl-4">
            Showing <span className="text-white">10</span> from <span className="text-[#FF7A00]">160</span> entries
          </p>
          
          <div className="flex items-center gap-2">
            <button className="h-10 px-4 flex justify-center items-center text-[10px] font-black uppercase tracking-widest text-[#FF7A00] bg-[#FF7A00]/10 hover:bg-[#FF7A00] hover:text-black transition duration-300 rounded-xl gap-2 active:scale-95">
              <ChevronsLeft strokeWidth={2.5} className="w-4 h-4" /> Prev
            </button>

            <div className="flex bg-[#121417] border border-white/[0.06] rounded-xl h-10 p-1">
              {[1, 2, 3].map((page) => (
                <button 
                  key={page}
                  className={`w-10 h-full flex justify-center items-center text-xs font-black rounded-lg transition-colors ${page === 1 ? 'bg-[#FF7A00] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}
                >
                  {page}
                </button>
              ))}
              <div className="w-10 h-full flex justify-center items-center text-gray-500 font-bold">...</div>
            </div>

            <button className="h-10 px-4 flex justify-center items-center text-[10px] font-black uppercase tracking-widest text-[#FF7A00] bg-[#FF7A00]/10 hover:bg-[#FF7A00] hover:text-black transition duration-300 rounded-xl gap-2 active:scale-95">
              Next <ChevronsRight strokeWidth={2.5} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
