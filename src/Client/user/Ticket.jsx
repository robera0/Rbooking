import React from "react";
import { CircleDotDashed, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Ticket } from "lucide-react";
import { eventService } from "../../Context/ApiEvent";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
const TicketHome = () => {
  const navigate = useNavigate();
  const { tickets, ticketLoading, ticketsError, ticketIsError } =
    eventService();
  const [hasAlerted, setHasAlerted] = useState(false);

  if (ticketIsError && !hasAlerted) {
    toast.error(ticketsError.message, {
      duration: 3000,
      position: "top-center",
      className:
        "bg-red-500 text-white font-bold py-3 px-4 rounded-none  text-center shadow-lg",
    });

    setHasAlerted(true);
  }

  if (ticketLoading) return <p className="text-white">Loading tickets...</p>;

  return (
    <div className="flex  flex-col flex-wrap pb-12  items-center space-y-8">
      <Toaster position="top-center" />
      <div className="space-y-2">
        <h1 className="text-2xl text-white font-semibold ">My Tickets</h1>

        <p className="w-[85%] text-[#808080] text-md">
          View and manage all your purchased tickets
        </p>
      </div>
      {!tickets && (
        <p className="w-[85%] text-[#808080] text-xl">
          No Ticket hsa been Purchased
        </p>
      )}

      {/*Ticket Card */}
      {Array.isArray(tickets) &&
        tickets.map((t, idx) => {
          const date = new Date(t?.dates?.start?.localDate);
          const formatted = date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const bgColour = {
            onsale: { border: "border-green-500/50", text: "text-green-500" },
            cancelled: { border: "border-red-500/50", text: "text-red-500" },
            postponed: { border: "border-blue-500/50", text: "text-blue-500" },
            upcoming: {
              border: "border-yellow-500/50",
              text: "text-yellow-500",
            },
          };

          const bg = bgColour[t?.dates?.status?.code];

          return (
            <div
              key={idx}
              className={`rounded-2xl w-93 bg-[#24282d] p-4 shadow-lg border ${bg.border} `}
            >
              <div className="flex gap-4">
                <img
                  src={t?.pictures?.[0] || t?.pictures?.[1] || "/Login.jpg"}
                  alt={t?.name || "event image"}
                  className="h-40 w-24 rounded-xl object-cover"
                />

                <div className="flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-full flex justify-between">
                      <h3 className="text-sm w-[70%] font-semibold text-white">
                        {t?.name}
                      </h3>
                      <Ticket className={`w-10 h-10 ${bg.text}`} />
                    </div>

                    <p className="text-sm text-gray-400">{formatted}</p>
                    <p className="text-sm text-gray-400">{t.locale}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                      Early Bird
                    </span>

                    <button
                      onClick={() => navigate(`/tickets_home/${t?._id}`)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-1 rounded-md"
                    >
                      View Ticket
                    </button>
                  </div>

                  <div>
                    <div
                      className={`flex items-center mt-5 space-x-2 ${bg.text} rounded-full`}
                    >
                      <span>
                        <CircleDotDashed className="w-5 h-5" />
                      </span>
                      <p className="font-semibold">{t?.dates?.status?.code}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      {/*
 <div>
 </div>
      /*REGULAR 

      <div className="rounded-2xl w-93 bg-[#24282d] p-4 shadow-lg border">
        <div className="flex gap-4">
          <img
            src="/Login.jpg"
            className="h-28 w-24 rounded-xl object-cover"
            alt=""
          />

          <div className="flex flex-col justify-between">
            <div className="space-y-1">
              <div className="w-full flex justify-between">
                <h3 className="text-lg font-semibold text-white">Event name</h3>
                <Ticket className="w-8 h-8 text-orange-500" />
              </div>
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
              <div className="flex items-center  mt-5 space-x-2  text-[#FF7800]   rounded-full">
                <span className=" ">
                  <CircleDotDashed className="w-5 h-5" />
                </span>

                <p className="font-semibold">Upcoming</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      /*VIP 

      <div className="rounded-2xl w-93 bg-[#24282d] p-4 shadow-lg border ">
        <div className="flex gap-4">
          <img
            src="/Login.jpg"
            className="h-28 w-24 rounded-xl object-cover"
            alt=""
          />

          <div className="flex flex-col justify-between">
            <div className="space-y-1">
              <div className="w-full flex justify-between">
                <h3 className="text-lg font-semibold text-white">Event name</h3>
                <Ticket className="w-8 h-8 text-blue-500" />
              </div>
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
              <div className="flex items-center  mt-5 space-x-2  text-red-500   rounded-full">
                <span className=" ">
                  <CircleDotDashed className="w-5 h-5" />
                </span>

                <p className="font-semibold">Unavailable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      */}
    </div>
  );
};

export default TicketHome;
