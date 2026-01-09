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
    isLoading: eventLoading,
    error: eventerror,
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
    if (res.status === 401) {
      throw new Error("Login required");
    }
    return res.json();
  };

  const {
    data: tickets,
    isLoading: ticketLoading,
    isError: ticketIsError,
    error: ticketsError,
  } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets,
    retry: false,
  });

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
        eventLoading,
        eventerror,
        tickets,
        ticketLoading,
        ticketsError,
        ticketIsError,
        fetchEventById,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const eventService = () => useContext(ApiContext);
