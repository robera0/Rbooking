import { createContext, useContext } from "react";
import { useService } from "@/Context/ServiceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [selected, setSelected] = useState([]);
  const { API_URL } = useService();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/auth/admin/events`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.events || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventIds) => {
      const res = await fetch(`${API_URL}/api/auth/admin/events/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventIds }),
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      toast.success("Event Deleted  Successfully!", {
        duration: 3000,
        style: {
          background: "#1C1F22",
          color: "#fff",
          border: "1px solid #FF7A00",
        },
      });
      setSelected([]);
    },
  });

  return (
    <EventContext.Provider
      value={{
        events,
        isLoading,
        selected,
        setSelected,

        deleteMutation,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useAdminEventService = () => useContext(EventContext);
