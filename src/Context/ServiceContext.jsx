import { createContext, useContext, useState } from "react";
import axios from "axios";

const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
  const [ellipis, setEllipis] = useState(null);
  const [addservice, setAddservice] = useState(false);
  const [description, setDescription] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [photoUrl, setPhotoUrl] = useState(false);
  const [photoFile, setPhotoFile] = useState(false);
  const [price, setPrice] = useState(100);
  const [header, setHeader] = useState("");
  const [pricepreview, setPricepreview] = useState(false);
  const [currency, setCurrency] = useState(false);
  const [edit, setEdit] = useState(false);
  const [service, setService] = useState(true);
  const [hour, setHour] = useState(false);
  const [notification, setNotification] = useState(false);
  const [profile, setProfile] = useState(false);
  const [Time, setTime] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [timeInfo, setTimeInfo] = useState(null);
  const [startTime, setStartTime] = useState("9:00 AM");
  const [Endtime, setEndTime] = useState("9:00 PM");
  const [age, setage] = useState("");
  const [startDateSpecefic, setstartDateSpecefic] = useState("");
  const [EndDateSpecefic, setEndDateSpecefic] = useState("");
  const [duration, setDuration] = useState(false);
  const [refetchActive, setrefetchActive] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [profileView, setProfielView] = useState(true);
  const [isAccountActive, setIsAccountActive] = useState(false);
  const [isEditMenuActive, setEditMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addFav, setAddFav] = useState(false);
  const toggleWishlist = async ({ event_id, isAdding }) => {
    const url = isAdding
      ? "http://localhost:5000/api/auth/wishlist/add"
      : "http://localhost:5000/api/auth/wishlist/remove";

    return axios.post(url, { events: event_id }, { withCredentials: true });
  };

  return (
    <ServiceContext.Provider
      value={{
        service,
        setService,
        hour,
        setHour,
        notification,
        setNotification,
        profile,
        setProfile,
        ellipis,
        setEllipis,
        Time,
        setTime,
        addservice,
        setAddservice,
        description,
        setDescription,
        serviceName,
        setServiceName,
        photoUrl,
        setPhotoUrl,
        price,
        setPrice,
        currency,
        setCurrency,
        header,
        setHeader,
        edit,
        setEdit,
        activeIndex,
        setActiveIndex,
        timeInfo,
        setTimeInfo,
        startTime,
        setStartTime,
        Endtime,
        setEndTime,
        duration,
        setDuration,
        age,
        setage,
        pricepreview,
        setPricepreview,
        photoFile,
        setPhotoFile,
        startDateSpecefic,
        setstartDateSpecefic,
        EndDateSpecefic,
        setEndDateSpecefic,
        refetchActive,
        setrefetchActive,
        selectedEvent,
        setSelectedEvent,
        profileView,
        setProfielView,
        isAccountActive,
        setIsAccountActive,
        isEditMenuActive,
        setEditMenuActive,
        isLoggedIn,
        setIsLoggedIn,
        addFav,
        setAddFav,
        toggleWishlist,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};
export const useService = () => {
  return useContext(ServiceContext);
};
