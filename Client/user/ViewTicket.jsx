import React from "react";
import { eventService } from "@/Context/ApiEvent";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
const ViewTicket = () => {
  const { ticketId } = useParams();
  const { fetchTicketById } = eventService();

  const {
    data: ticketsinfo,
    isLoading: ticketsinfoLoading,
    isError: ticketsinfoIsError,
    error: ticketsinfoError,
  } = useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: () => fetchTicketById(ticketId),
    enabled: !!ticketId,
    retry: false,
  });
  const ticket = ticketsinfo?.ticket?.ticketId?.eventId;
  const orderNo = ticketsinfo?.ticket?.orderNo;
  console.log(ticket?.name);
  const date = new Date(ticket?.dates?.start?.localDate);
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = ticket?.dates?.start?.localTime?.slice(0, 5);

  return (
    <div className="pl-4 pb-12 space-y-2">
      <div className="space-y-2">
        <h1 className="text-2xl text-white font-semibold ">Ticket Details</h1>
      </div>
      {/*Ticket Card */}
      <div className="w-[93%] p-4 flex items-center justify-between gap-6">
        {/* LEFT CONTENT */}
        <div className="flex flex-col gap-4 w-[60%]">
          {/* Event Info */}
          <div className="space-y-4">
            <h1 className="text-md text-white font-semibold">{ticket?.name}</h1>
            <p className="text-sm text-gray-400">
              {formatted} , {formattedTime}
            </p>
            <p className="text-sm text-gray-400">{ticketsinfo?.locale}</p>
          </div>

          {/* Ticket Info */}
          <div className="space-y-1">
            <p className="text-sm text-gray-400">
              Ticket ID: {parseInt(ticketId?.slice(-6), 16)}
            </p>
            <p className="text-sm text-gray-400">Order #: {orderNo}</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-center gap-6">
          {/* QR CODE */}
          <div className="p-2 rounded-lg">
            <img src="/qr-code.png" className="h-24 w-24" alt="QR Code" />
          </div>

          {/* DOWNLOAD */}
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-md">
            Download
          </button>
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm ">
          © 2025 Kuretegn Events. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ViewTicket;
