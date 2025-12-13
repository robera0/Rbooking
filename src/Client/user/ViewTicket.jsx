import React from "react";

const ViewTicket = () => {
  return (
    <div className="pl-4 pb-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl text-white font-semibold ">Ticket Details</h1>
        <p className="w-[85%] text-[#808080] text-md">
          View and manage all your purchased tickets
        </p>
      </div>
      {/*Ticket Card */}
      <div className="rounded-2xl w-93 bg-[#24282d] p-4 shadow-lg border border-green-500/50">
        <div>
          <h1 className="text-2xl text-white font-semibold ">Event Name</h1>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Dec 20, 2025 · 6 PM</p>
            <p className="text-sm text-gray-400">
              Addis Ababa · Millennium Hall
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTicket;
