import React from "react";
import { eventService } from "@/Context/ApiEvent";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Map } from "lucide-react";
const Events = () => {
  const { events, isLoading, error } = eventService();
  const [dateSlide, setDateSlide] = useState(false);
  const [date, setDate] = useState(null);

  console.log("events type", events);
  return (
    <div>
      <div className="w-full flex flex-col mt-4 lg:mt-33 items-center space-y-8 lg:space-y-12">
        <h1 className="text-white font-bold text-3xl lg:text-6xl">
          {events?.events?.type}
        </h1>

        {error && message?.error}

        <div className="w-full flex flex-col lg:flex-row items-center gap-y-14 lg:pl-3  sm:gap-y-12 lg:gap-y-6  lg:gap-x-2   mb-12">
          {Array.isArray(events?.events) &&
            events?.events?.map((e, idx) => (
              <Link
                key={idx}
                to={`/events/${e?._id}/tickets/${e.tickets[0]?._id}`}
                className="w-full flex justify-center"
              >
                <div className="w-[80%] lg:w-[85%] space-y-3">
                  {/* Image Section */}
                  <div className="relative h-80 sm:h-96 lg:h-[500px] rounded-xl overflow-hidden">
                    <img
                      src={e?.pictures?.[0] || e?.pictures?.[1] || "/Login.jpg"}
                      alt={e?.name || "event image"}
                      className="w-full h-full object-cover rounded-xl"
                    />

                    {/* Location badge */}
                    <div className="absolute bottom-3 left-4 flex items-center bg-[#FF7800] text-white px-4 py-1 rounded-xl space-x-2">
                      <Map size={16} />
                      <span className="text-sm">{e?.locale || "Unknown"}</span>
                    </div>

                    {/* SOLD OUT badge for events with no tickets */}
                    {e.tickets?.length === 0 && (
                      <div className="absolute top-3 right-4 bg-red-600 text-white text-sm px-4 py-1 rounded-lg font-semibold">
                        SOLD OUT
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="flex justify-between px-2">
                    <div className="space-y-1">
                      <h1 className="text-lg lg:text-xl text-white font-semibold">
                        {e?.name}
                      </h1>

                      {/* Show ticket price if available */}
                      {e.tickets?.length > 0 ? (
                        <p className="text-[#FF7800] text-sm lg:text-md">
                          <span className="font-bold">
                            ${e.tickets[0].price}
                          </span>{" "}
                          / per ticket
                        </p>
                      ) : (
                        <p className="text-red-500 text-xs lg:text-md font-semibold">
                          No tickets available
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <h1 className="text-white text-xl font-bold">
                        {e?.rating?.score || "0.0"}
                      </h1>
                      <Star className="text-[#FF7800]" size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
