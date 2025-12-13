import React from "react";
import { CircleDotDashed } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Ticket = () => {
  const navigate = useNavigate();
  return (
    <div className="pl-4 pb-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl text-white font-semibold ">My Tickets</h1>
        <p className="w-[85%] text-[#808080] text-md">
          View and manage all your purchased tickets
        </p>
      </div>
      {/*Ticket Card */}
      <div className="rounded-2xl w-93 bg-[#24282d] p-4 shadow-lg border border-green-500/50">
        <div className="flex gap-4">
          <img
            src="/Login.jpg"
            className="h-28 w-24 rounded-xl object-cover"
            alt=""
          />

          <div className="flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Event name</h3>
              <p className="text-sm text-gray-400">Dec 20, 2025 · 6 PM</p>
              <p className="text-sm text-gray-400">
                Addis Ababa · Millennium Hall
              </p>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                Early Bird
              </span>

              <button
                onClick={() => navigate("/tickets_home/view_ticket")}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-1 rounded-md"
              >
                View Ticket
              </button>
            </div>

            <div>
              <div className="flex items-center  mt-2 space-x-2  text-green-400   rounded-full">
                <span className=" ">
                  <CircleDotDashed className="w-5 h-5" />
                </span>

                <p className="font-semibold">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*REGULAR */}

      <div className="rounded-2xl w-93 bg-[#24282d] p-4 shadow-lg border border-yellow-500/50">
        <div className="flex gap-4">
          <img
            src="/Login.jpg"
            className="h-28 w-24 rounded-xl object-cover"
            alt=""
          />

          <div className="flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Event name</h3>
              <p className="text-sm text-gray-400">Dec 20, 2025 · 6 PM</p>
              <p className="text-sm text-gray-400">
                Addis Ababa · Millennium Hall
              </p>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
                Regular
              </span>

              <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-1 rounded-md">
                View Ticket
              </button>
            </div>

            <div>
              <div className="flex items-center  mt-2 space-x-2  text-[#FF7800]   rounded-full">
                <span className=" ">
                  <CircleDotDashed className="w-5 h-5" />
                </span>

                <p className="font-semibold">Upcoming</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*VIP */}

      <div className="rounded-2xl w-93 bg-[#24282d] p-4 shadow-lg border border-blue-500/50">
        <div className="flex gap-4">
          <img
            src="/Login.jpg"
            className="h-28 w-24 rounded-xl object-cover"
            alt=""
          />

          <div className="flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Event name</h3>
              <p className="text-sm text-gray-400">Dec 20, 2025 · 6 PM</p>
              <p className="text-sm text-gray-400">
                Addis Ababa · Millennium Hall
              </p>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                VIP
              </span>

              <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-1 rounded-md">
                View Ticket
              </button>
            </div>

            <div>
              <div className="flex items-center  mt-2 space-x-2  text-red-500   rounded-full">
                <span className=" ">
                  <CircleDotDashed className="w-5 h-5" />
                </span>

                <p className="font-semibold">Unavailable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
