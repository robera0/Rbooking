import { createContext, useContext } from "react";
import { useService } from "@/Context/ServiceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "./api/api.config";
const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [selected, setSelected] = useState([]);
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: async () => {
      const res = await api.get(`/api/auth/admin/events`);
      return res.data?.events || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventIds) => {
      await api.delete(`/api/auth/admin/events/delete`, {
        data: { eventIds },
      });
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
