import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  // GET EVENTS
  const fetchEvents = async () => {
    const res = await fetch("http://localhost:5000/api");
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

  console.log(events);

  // GET BUSINESS INFO
  /*
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
*/
  return (
    <ApiContext.Provider
      value={{
        events,
        isLoading,
        error,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const eventService = () => useContext(ApiContext);
