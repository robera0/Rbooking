import { createContext, useContext } from "react";
import { useService } from "@/Context/ServiceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api/api.config";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  

  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      const res = await api.get(`/api/auth/admin/analytics/dashboard`);
      return res.data?.data;
    },
  });

  const { data: revenueHistory, isLoading: isRevenueLoading } = useQuery({
    queryKey: ["adminRevenueHistory"],
    queryFn: async () => {
      const res = await api.get(`/api/auth/admin/analytics/revenue`);
      return res.data?.history || [];
    },
  });

  return (
    <DashboardContext.Provider
      value={{
        stats,
        isLoading,
        revenueHistory,
        isRevenueLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
