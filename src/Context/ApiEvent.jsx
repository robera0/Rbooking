import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
    const res = await fetch("http://localhost:5000/api/tickets_home");
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

  // GET TICKETS BY ID

  const fetchTicketBtId = async (ticket_id) => {
    const res = await fetch(`http://localhost:5000/api/${ticket_id}`);
    return res.json();
  };

  const {
    data: ticket_id,
    ticket_idisLoading,
    ticket_idError,
  } = useQuery({
    queryKey: ["tickets_id"],
    queryFn: fetchTicketBtId,
  });
  return (
    <ApiContext.Provider
      value={{
        events,
        isLoading,
        error,
        tickets,
        ticketisLoading,
        ticketError,
        ticket_id,
        ticket_idisLoading,
        ticket_idError,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const eventService = () => useContext(ApiContext);
