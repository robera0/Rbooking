import { eventService } from "@/Context/ApiEvent";
import React from "react";
import styled, { keyframes } from "styled-components";
import { Eye } from "lucide-react";

// Shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -500px 0;
  }
  100% {
    background-position: 500px 0;
  }
`;

const StyledWrapper = styled.div`
  width: 100%;
  height: 28rem; /* same as h-112 */
  display: flex;
  justify-content: center;
  align-items: center;

  .skeleton {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: linear-gradient(
      90deg,
      #c2c2c2 25%,
      /* darker gray */ #d8d8d8 50%,
      /* lighter dim gray */ #c2c2c2 75%
    );
    background-size: 500px 100%;
    animation: ${shimmer} 1.5s infinite linear;
  }
`;

const UserHome = () => {
  const { events, isLoading, error } = eventService();

  const dayOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  const timeSplitter = (time) => {
    const [t, modifier] = time.split(" ");
    let [hour, min] = t.split(":").map(Number);
    if (modifier === "PM" && hour !== 12) hour += 12;
    if (modifier === "AM" && hour === 12) hour = 0;
    return hour * 60 + min;
  };

  const sortEvents = (events) => {
    if (!events) return [];
    return [...events].sort((a, b) => {
      const dayA = dayOrder[a.hour[0].day];
      const dayB = dayOrder[b.hour[0].day];
      if (dayA !== dayB) return dayA - dayB;
      return (
        timeSplitter(a.hour[0].start_time) - timeSplitter(b.hour[0].start_time)
      );
    });
  };

  const sortedEvents = sortEvents(events);
  const firstEvent = sortedEvents[0];

  if (error) return <div>Error loading events</div>;

  return (
    <div className="space-y-10 overflow-x:hidden">
      <StyledWrapper>
        {isLoading || !firstEvent?.picture ? (
          <div className="skeleton" />
        ) : (
          <div
            className="relative fixed h-120"
            style={{
              backgroundImage: `url("${
                firstEvent.picture || "defaultAvater.jpg"
              }")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "100%",
            }}
          >
            <div className="absolute inset-0 bg-black/50"></div>

            {/*BUTTONS */}

            <div className="absolute  z-20 top-60 left-10 space-y-5">
              <h1 className="text-5xl text-center text-white font-bold">
                {firstEvent.name}
              </h1>
              <p className=" text-xl text-white font-bold">
                See the full info{" "}
              </p>

              <button className="ml-4 w-36 h-12 bg-[#FF7800] text-white font-bold cursor-pointer hover:scale-98 rounded-md">
                Find Tickets
              </button>
            </div>
          </div>
        )}
      </StyledWrapper>
      {/*Events  */}

      <div className="font-onest absolute flex flex-wrap w-full h-screen pb-12 pl-4 gap-8 ">
        {sortedEvents?.map((event) => (
          <div
            key={event._id}
            className="w-[48%] bg-[#D9D9D9] rounded-xl pb-4 cursor-pointer group shadow-xl"
          >
            <div className="w-full h-full">
              <div
                style={{
                  backgroundImage: `url("${
                    event.picture || "defaultAvatar.jpg"
                  }")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className="h-92 rounded-t-xl bg-black relative  group overflow-hidden"
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Eye className=" text-white w-15 h-15" />
                </span>
                {/* hover overlay */}
                <div className="absolute inset-0 bg-[#FF7800]/0 group-hover:bg-[#FF7800]/20 transition-all duration-300 rounded-t-md"></div>
              </div>
              <p className="text-xl pl-4">{event.type}</p>
              <h1 className="text-black font-semibold mt-2 pl-4">
                {event.name}
              </h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHome;
