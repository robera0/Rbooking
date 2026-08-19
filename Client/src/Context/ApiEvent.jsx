import { createContext, useContext } from "react";
import { useService } from "./ServiceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { fetchWithAuth, axiosWithAuth } from "../lib/fetchWithAuth";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const { type, artist, date, venues, search, API_URL, commentId } =
    useService();

  // GET EVENTS
  const fetchEvents = async ({ queryKey }) => {
    const [_key, type, artist, date, venues, search] = queryKey;
    const params = new URLSearchParams();
    if (type?.trim()) params.append("type", type.trim());
    if (artist?.trim()) params.append("artist", artist.trim());
    if (venues?.trim()) params.append("venues", venues.trim());
    if (date) params.append("date", date);
    if (search?.trim()) params.append("search", search.trim());
    const res = await fetch(`${API_URL}/api/events?${params.toString()}`);
    return res.json();
  };
  const formatDateForAPI = (dateObj) => {
    if (!dateObj) return "";
    if (!(dateObj instanceof Date)) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const safeDate = formatDateForAPI(date);
  const {
    data: events,
    isLoading: eventLoading,
    error: eventerror,
    isFetching: isFetching,
  } = useQuery({
    queryFn: fetchEvents,
    queryKey: ["event", type, artist, safeDate, venues, search],
  });

  // GET FEATURED EVENTS (filtered by date)
  const fetchFeaturedEvents = async () => {
    const res = await fetch(`${API_URL}/api/featuredEvents`);
    return res.json();
  };

  const {
    data: featuredEvents,
    isLoading: featuredEventLoading,
    error: featuredEventError,
  } = useQuery({
    queryFn: fetchFeaturedEvents,
    queryKey: ["featuredEvents"],
  });

  // GET LOGGED USERS
  const fetchLoggedInUser = async () => {
    const res = await fetchWithAuth(`${API_URL}/api/auth/user`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message || `Request failed with status ${res.status}`,
      );
    }

    return data;
  };

  const { data: user, isError: usererror } = useQuery({
    queryFn: fetchLoggedInUser,
    queryKey: ["user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    select: (data) => data?.user || null,
  });

  console.log(user);
  // GET TICKETS

  const fetchTickets = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/auth/tickets_home`, {
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
      const res = await fetchWithAuth(`${API_URL}/api/auth/notifications`, {
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

  // READ NOTIFICATION
  const queryClient = useQueryClient();

  const patchReadNotification = async (notId) => {
    try {
      const res = await axiosWithAuth.patch(
        `${API_URL}/api/auth/notifications/read`,
        { notId },
        { withCredentials: true },
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch event ticket:", error);
      throw new Error(error);
    }
  };

  const { mutate: readNotification } = useMutation({
    mutationFn: patchReadNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
    },
    onError: (error) => {
      console.error(
        "Failed to mark read:",
        error.response?.data || error.message,
      );
    },
  });
  // GET COMMENT
  const get_comment = async ({ queryKey }) => {
    try {
      const [, commentId] = queryKey;
      const res = await fetch(`${API_URL}/api/events/${commentId}/comments`);
      return res.json();
    } catch (error) {
      throw new Error(error);
    }
  };

  const {
    data: comments,
    isLoading: commentsIsLoading,
    isError: commentError,
  } = useQuery({
    queryKey: ["comment", commentId],
    queryFn: get_comment,
    enabled: !!commentId,
    retry: 1,
  });

  //POST COMMENT
  const sendComment = async (comment, eventId) => {
    try {
      const res = await axiosWithAuth.post(
        `${API_URL}/api/auth/events/${eventId}/comments`,
        { text: comment },
        { withCredentials: true },
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch event ticket:", error);
      throw error;
    }
  };

  const useComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ text, eventId }) => sendComment(text, eventId),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["comment"],
        });
      },

      onError: (error) => {
        console.error(
          "Failed to post comment:",
          error.response?.data || error.message,
        );
      },
    });
  };
  //LIKE COMMENT

  const likeComment = async (commentId) => {
    try {
      const res = await axiosWithAuth.post(
        `${API_URL}/api/auth/comments/${commentId}/like`,
        { commentId },
        { withCredentials: true },
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch comment :", error);
      throw error;
    }
  };

  const addLikeComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: sendComment,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["likeComments"],
        });
      },

      onError: (error) => {
        console.error(
          "Failed to like comment:",
          error.response?.data || error.message,
        );
      },
    });
  };
  // GET TICKETS BY ID
  const fetchTicketById = async (ticketId) => {
    const res = await fetchWithAuth(`${API_URL}/api/auth/tickets_home/${ticketId}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    return data;
  };

  const fetchEventById = async (eventid, ticketId) => {
    try {
      const res = await fetchWithAuth(
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
  const fetchWishlist = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/api/auth/wishlist`, {
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
  const fetchUser = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/auth/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (response.status === 401) {
        throw new Error("Login required");
      }

      return response.json();
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
  console.log("the profile is ", userProfile);
  return (
    <ApiContext.Provider
      value={{
        user,
        usererror,
        events,
        eventLoading,
        eventerror,
        isFetching,
        featuredEvents,
        featuredEventLoading,
        featuredEventError,
        tickets,
        ticketLoading,
        ticketsError,
        ticketIsError,
        notifications,
        notificationIsError,
        notificationError,
        readNotification,
        get_comment,
        comments,
        commentsIsLoading,
        commentError,
        useComment,
        likeComment,
        addLikeComment,
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
