import { createContext, useContext } from "react";
import { useService } from "./ServiceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api/api.config";

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
    const res = await api.get(`/api/events?${params.toString()}`);
    return res.data;
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
    const res = await api.get(`/api/featuredEvents`);
    return res.data;
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
    const res = await api.get(`/api/auth/user`);
    return res.data;
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
      const res = await api.get(`/api/auth/tickets_home`);
      return res.data;
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
      const res = await api.get(`/api/auth/notifications`);
      return res.data;
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
      const res = await api.patch(
        `/api/auth/notifications/read`,
        { notId }
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
      const res = await api.get(`/api/events/${commentId}/comments`);
      return res.data;
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
  const sendComment = async ({ text, rating }, eventId) => {
    try {
      const res = await api.post(
        `/api/auth/events/${eventId}/comments`,
        { text, rating }
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
      mutationFn: ({ text, rating, eventId }) => sendComment({ text, rating }, eventId),

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
      const res = await api.post(
        `/api/auth/comments/${commentId}/like`,
        { commentId }
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
    const res = await api.get(`/api/auth/tickets_home/${ticketId}`);
    return res.data;
  };

  const fetchEventById = async (eventid, ticketId) => {
    try {
      const res = await api.get(`/api/events/${eventid}/tickets/${ticketId}`);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch event ticket:", error);
      throw error;
    }
  };
  // GET WISHLIST
  const fetchWishlist = async () => {
    try {
      const res = await api.get(`/api/auth/wishlist`);
      return res.data;
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
      const response = await api.get(`/api/auth/profile`);
      return response.data;
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

  // GET ADMIN SETTINGS
  const fetchAdminSettings = async () => {
    try {
      const response = await api.get(`/api/auth/admin/settings`);
      return response.data; // Now returns { settings, availablePaymentMethods }
    } catch (error) {
      throw new Error(error);
    }
  };

  const {
    data: adminSettingsData,
    isLoading: adminSettingsLoading,
  } = useQuery({
    queryKey: ["adminSettings"],
    queryFn: fetchAdminSettings,
    retry: 1,
    enabled: !!user && user.role === "admin",
  });
  
  const adminSettings = adminSettingsData?.settings;
  const availablePaymentMethods = adminSettingsData?.paymentMethods || [];

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
        adminSettings,
        adminSettingsLoading,
        availablePaymentMethods,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const eventService = () => useContext(ApiContext);
