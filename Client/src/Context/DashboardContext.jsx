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

export const useDashboard = () => useContext(DashboardContext);
