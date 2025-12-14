import React from "react";

const ViewTicket = () => {
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
          <div className="space-y-1">
            <h1 className="text-2xl text-white font-semibold">Event Name</h1>
            <p className="text-sm text-gray-400">Dec 20, 2025 · 6 PM</p>
            <p className="text-sm text-gray-400">
              Addis Ababa · Millennium Hall
            </p>
          </div>

          {/* Ticket Info */}
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Ticket ID: 4828</p>
            <p className="text-sm text-gray-400">Seat: Main field</p>
            <p className="text-sm text-gray-400">Order #: 49229292</p>
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
