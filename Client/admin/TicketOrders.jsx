import { Funnel, CalendarDays } from "lucide-react";
import { TicketTable, SearchInput, CustomSelect } from "./Cards";
import SalesSummary from "./SalesSummary";
import { useTransactions, useAdminEvents } from "./api/sales.api";
import { useMemo, useState } from "react";

const TicketOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [eventId, setEventId] = useState("");

  const { data: events } = useAdminEvents();
  const { data, isLoading } = useTransactions(eventId);

  const eventOptions = useMemo(
    () => [
      { label: "All Events", value: "" },
      ...(events || []).map((event) => ({
        label: event?.name || "Untitled event",
        value: event?._id,
      })),
    ],
    [events],
  );

  return (
    <div className="w-full max-w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 border-b border-white/[0.04] pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-5xl uppercase tracking-tighter leading-none">
            Ticket <span className="text-[#FF7A00]">Orders</span>
          </h1>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
        </div>
      </div>

      <SalesSummary summary={data?.summary} isLoading={isLoading} />

      <div className="w-full bg-[#1C1F22] border border-white/[0.04] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-xl flex flex-col min-h-[400px]">
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
            icon={CalendarDays}
            options={eventOptions}
            value={eventId}
            onChange={setEventId}
            placeholder="All Events"
          />

          <CustomSelect
            icon={Funnel}
            options={[
              { label: "All Status", value: "" },
              { label: "Paid", value: "paid" },
              { label: "Pending", value: "pending" },
              { label: "Refunded", value: "refunded" },
            ]}
            value={filterType}
            onChange={setFilterType}
            placeholder="All Status"
          />
        </div>

        <div className="w-full overflow-x-auto flex-1">
          <TicketTable
            key={eventId}
            transactions={data?.transactions}
            isLoading={isLoading}
            search={searchTerm}
            filter={filterType}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketOrders;
