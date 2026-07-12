import { Plus, Funnel, Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EventTable, SearchInput, CustomSelect } from "./Cards";
import { useState } from "react";

const EventMang = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  return (
    <div className="w-full max-w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 border-b border-white/[0.04] pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            Event <span className="text-[#FF7A00]">Management</span>
          </h1>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
        </div>
        <button
          onClick={() => navigate("/admin/events/add")}
          className="mt-4 md:mt-0 px-6 py-3 bg-[#FF7A00] text-white hover:bg-white hover:text-[#FF7A00] text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={3} />
          Create Event
        </button>
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
              placeholder="Search event name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <CustomSelect
            icon={Funnel}
            options={[
              { label: "All Types", value: "" },
              { label: "Concert", value: "concert" },
              { label: "Festival", value: "festival" },
              { label: "Generic", value: "generic" },
            ]}
            value={filterType}
            onChange={setFilterType}
            placeholder="All Types"
          />
        </div>

        <div className="w-full overflow-x-auto flex-1">
          <EventTable search={searchTerm} filter={filterType} />
        </div>
      </div>
    </div>
  );
};

export default EventMang;
