import { createContext, useContext } from "react";
import { useService } from "@/Context/ServiceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const DashboardContext = createContext();

export const DashboardApi = ({ children }) => {
  const { API_URL } = useService();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/analytics/dashboard`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load dashboard stats");
      const json = await res.json();
      return json.data;
    },
  });

  return (
    <DashboardContext.Provider
      value={{
        stats,
        isLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const dashboardService = () => useContext(DashboardContext);
