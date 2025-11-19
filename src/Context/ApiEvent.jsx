import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const fetchEvents = async () => {
    const res = await fetch("http://localhost:5000/api/events");
    return res.json();
  };
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryFn: fetchEvents,
    queryKey: ["event"],
  });

  // GET BUSINESS INFO
  const getBussinesProfile = async () => {
    const res = await fetch("http://localhost:5000/api/profile");
    return res.json();
  };

  const {
    data: businesses,
    BusinessIsLoading,
    BusinessError,
  } = useQuery({
    queryKey: ["business"],
    queryFn: getBussinesProfile,
  });

  return (
    <ApiContext.Provider
      value={{
        events,
        isLoading,
        error,
        businesses,
        BusinessIsLoading,
        BusinessError,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const eventService = () => useContext(ApiContext);
