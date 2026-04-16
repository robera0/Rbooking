import { TicketTable } from "./Cards";

const TicketOrders = () => {
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

      <div className="w-full bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-6 shadow-xl overflow-hidden overflow-x-auto">
         <TicketTable />
      </div>
    </div>
  );
};

export default TicketOrders;
