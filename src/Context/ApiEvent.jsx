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
    try {
      const res = await fetch("http://localhost:5000/api/auth/tickets_home", {
        method: "GET",
        credentials: "include",
      });
      if (res.status === 401) {
        throw new Error("Login required");
      }
      return res.json();
    } catch (error) {
      throw new Error(error);
    }
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
  const fetchTicketById = async (ticketId) => {
    const res = await fetch(
      `http://localhost:5000/api/ "/tickets_home/${ticketId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    return res.json();
  };
  const {
    data: ticketsinfo,
    isLoading: ticketsinfoLoading,
    isError: ticketsinfoIsError,
    error: ticketsinfoError,
  } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTicketById,
    retry: false,
  });

  const fetchEventById = async (event_id) => {
    const res = await fetch(`http://localhost:5000/api/events/${event_id}`, {
      method: "GET",
      credentials: "include",
    });
    return res.json();
  };

  // GET WISHLIST
  const fetchWishlist = async (req, res) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/wishlist", {
        method: "GET",
        credentials: "include",
      });
      if (res.status === 401) {
        throw new Error("Login required");
      }

      return res.json();
    } catch (error) {
      throw new Error(error);
    }
  };
  const {
    data: wishlist,
    isLoading: wishlistLoading,
    isError: wishlistIsError,
    error: wishlistError,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    retry: false,
  });

  // GET USERPROFILE
  const fetchUser = async (req, res) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/user_profile", {
        method: "GET",
        credentials: "include",
      });
      if (res.status === 401) {
        throw new Error("Login required");
      }

      return res.json();
    } catch (error) {
      throw new Error(error);
    }
  };
  const {
    data: userProfile,
    isLoading: userIsLoading,
    isError: userIsError,
    error: userError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUser,
    retry: false,
  });

  console.log("user is ", userProfile);
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
        ticketsinfo,
        ticketsinfoError,
        ticketsinfoLoading,
        ticketsinfoIsError,
        wishlist,
        wishlistError,
        wishlistLoading,
        wishlistIsError,
        userProfile,
        userIsLoading,
        userIsError,
        userError,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const eventService = () => useContext(ApiContext);
