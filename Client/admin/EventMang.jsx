import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EventTable } from "./Cards";

const EventMang = () => {
  const navigate = useNavigate();

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
          className="mt-4 md:mt-0 px-6 py-3 bg-[#FF7A00] text-black hover:bg-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={3} />
          Create Event
        </button>
      </div>

      <div className="w-full bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-6 shadow-xl overflow-hidden overflow-x-auto">
        <EventTable />
      </div>
    </div>
  );
};

export default EventMang;
