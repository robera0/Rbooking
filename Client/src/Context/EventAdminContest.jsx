import { createContext, useContext } from "react";
import { useService } from "@/Context/ServiceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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
  console.log(events);

  const deleteMutation = useMutation({
    mutationFn: async (eventIds) => {
      const res = await fetch(`${API_URL}/api/admin/events/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventIds }),
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
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
