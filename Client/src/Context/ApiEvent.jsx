import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useService } from "./ServiceContext";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const { type, artist, date, API_URL } = useService();

  // GET EVENTS

  const fetchEvents = async ({ queryKey }) => {
    const [_key, type, artist, date] = queryKey;
    const res = await fetch(
      `${API_URL}/api/events?type=${type?.trim() || ""}&artist=${
        artist?.trim() || ""
      }&date=${date ? new Date(date).toISOString() : ""}`,
    );
    return res.json();
  };
  const {
    data: events,
    isLoading: eventLoading,
    error: eventerror,
    isFetching: isFetching,
  } = useQuery({
    queryFn: fetchEvents,
    queryKey: ["event", type, artist, date],
  });

  // GET LOGGED USERS

  const fetchLoggedInUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/user`, {
        method: "GET",
        credentials: "include",
      });

      return res.json();
    } catch (error) {
      throw new Error(error);
    }
  };

  const { data: user, isError: usererror } = useQuery({
    queryFn: fetchLoggedInUser,
    queryKey: ["user"],

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false, // optional
    select: (data) => data?.user || null,
  });
  // GET TICKETS

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/tickets_home`, {
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
    enabled: !!user,
  });

  //GET NOTIFICATION

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/notifications`, {
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
    data: notifications,
    isLoading: notificationLoading,
    isError: notificationIsError,
    error: notificationError,
  } = useQuery({
    queryKey: ["notification"],
    queryFn: fetchNotifications,
    enabled: !!user,
  });

  // GET TICKETS BY ID
  const fetchTicketById = async (ticketId) => {
    const res = await fetch(`${API_URL}/api/auth/tickets_home/${ticketId}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    return data;
  };
  const fetchEventById = async (eventid, ticketId) => {
    try {
      const res = await fetch(
        `${API_URL}/api/events/${eventid}/tickets/${ticketId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Failed to fetch event ticket:", error);
      throw error;
    }
  };
  // GET WISHLIST
  const fetchWishlist = async (req, res) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/wishlist`, {
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
    enabled: !!user,
    retry: 1,
  });

  // GET USERPROFILE
  const fetchUser = async (req, res) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/user_profile`, {
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
    retry: 1,
    enabled: !!user,
  });

  return (
    <ApiContext.Provider
      value={{
        user,
        usererror,
        events,
        eventLoading,
        eventerror,
        isFetching,
        tickets,
        ticketLoading,
        ticketsError,
        ticketIsError,
        notifications,
        notificationIsError,
        notificationError,
        wishlist,
        wishlistError,
        wishlistLoading,
        wishlistIsError,
        userProfile,
        userIsLoading,
        userIsError,
        userError,
        fetchEventById,
        fetchTicketById,
        fetchLoggedInUser,
        fetchUser,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const eventService = () => useContext(ApiContext);
