import { eventService } from "@/Context/ApiEvent";
import React from "react";

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

      const timeA = timeSplitter(a.hour[0].start_time);
      const timeB = timeSplitter(b.hour[0].start_time);

      return timeA - timeB;
    });
  };

  const sortedEvents = sortEvents(events);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading events</div>;

  return (
    <>
      {sortedEvents[0] && (
        <div
          style={{
            backgroundImage: `url(${sortedEvents[0].picture})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="w-full h-100"
        ></div>
      )}
    </>
  );
};

export default UserHome;
