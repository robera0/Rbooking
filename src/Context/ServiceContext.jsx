import { createContext, useContext, useState } from "react";

const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
  const [ellipis, setEllipis] = useState(false);
  const [addservice,setAddservice]=useState(false)
  const [description,setDescription]=useState("")
  const [serviceName,setServiceName]=useState("")
  const [photoUrl, setPhotoUrl] = useState(false);
  const [price, setPrice] = useState(false);
  const [currency, setCurrency] = useState(false);
  const [edit, setEdit] = useState(false);
  const [service,setService]=useState(true)
  const [hour,setHour]=useState(false)
  const [notification,setNotification]=useState(false)
  const [profile,setProfile]=useState(false)
  const[Time,setTime]=useState(false)
   const [activeIndex, setActiveIndex] = useState(null); 
 const [toggleOn, setToggleOn] = useState(false);

  return (
    <ServiceContext.Provider value={
      {service,setService,hour,setHour,notification,setNotification,profile,setProfile,
       ellipis, setEllipis ,Time,setTime,addservice,setAddservice,description,setDescription ,
    serviceName,setServiceName,photoUrl, setPhotoUrl,price, setPrice ,currency, setCurrency,
    edit, setEdit,activeIndex, setActiveIndex,toggleOn, setToggleOn
    }}>
      {children}
    </ServiceContext.Provider>
  );
};
export const useService = () => {
  return useContext(ServiceContext);
};
