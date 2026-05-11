import { Funnel } from "lucide-react";
import { TicketTable, SearchInput, CustomSelect } from "./Cards";
import { useState } from "react";

const TicketOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  return (
    <div className="w-full max-w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 border-b border-white/[0.04] pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            Ticket <span className="text-[#FF7A00]">Orders</span>
          </h1>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
        </div>
      </div>

      <div className="w-full bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-6 shadow-xl flex flex-col min-h-[400px]">
        {/* Filters Wrapper */}
        <div className="w-full flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              w="w-full"
              h="h-12"
              top="top-1/2 -translate-y-1/2"
              left="left-4"
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <CustomSelect 
             icon={Funnel}
             options={[
               { label: "All Status", value: "" },
               { label: "Paid", value: "paid" },
               { label: "Pending", value: "pending" }
             ]}
             value={filterType}
             onChange={setFilterType}
             placeholder="All Status"
          />
        </div>

        <div className="w-full overflow-x-auto flex-1">
          <TicketTable search={searchTerm} filter={filterType} />
        </div>
      </div>
    </div>
  );
};

export default TicketOrders;
