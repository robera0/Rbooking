import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  // GET EVENTS
  const fetchEvents = async () => {
    const res = await fetch("http://localhost:5000/api");
    return res.json();
  };
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryFn: fetchEvents,
    queryKey: ["event"],
  });

  // GET TICKETS

  const fetchTickets = async () => {
    const res = await fetch("http://localhost:5000/api/auth/tickets_home", {
      method: "GET",
      credentials: "include",
    });
    return res.json();
  };

  const {
    data: tickets,
    ticketisLoading,
    ticketError,
  } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets,
  });
  console.log(tickets);

  // GET TICKETS BY ID

  const fetchEventById = async (event_id) => {
    const res = await fetch(`http://localhost:5000/api/events/${event_id}`, {
      method: "GET",
      credentials: "include",
    });
    return res.json();
  };

  return (
    <ApiContext.Provider
      value={{
        events,
        isLoading,
        error,
        tickets,
        ticketisLoading,
        ticketError,
        fetchEventById,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const eventService = () => useContext(ApiContext);
