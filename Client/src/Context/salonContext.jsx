import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { getSalons } from "../../admin/api/admin.api";
const SalonContext = createContext(null);

export const SalonProvider = ({ children }) => {
  const [page, setPage] = useState(1);
  const [salonDetail, setSalonDetail] = useState(null);
  const {
    data: salons,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: getSalons,
    queryKey: ["salons"],
  });

  const PAGE_SIZE = 6;
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const current_page = salons?.slice(start, end);
  const total_pages = Math.ceil(salons?.length / PAGE_SIZE);
  const getDetailSalon = (salonId) => {
    const salon = salons?.find((salon) => salon?._id === salonId);
    setSalonDetail(salon);
  };

  return (
    <SalonContext.Provider
      value={{
        page,
        setPage,
        current_page,
        total_pages,
        salons,
        isLoading,
        isError,
        error,
        getDetailSalon,
        salonDetail,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalonContext = () => {
  const context = useContext(SalonContext);

  if (!context) {
    throw new Error("useSalonContext must be used within SalonProvider");
  }

  return context;
};
