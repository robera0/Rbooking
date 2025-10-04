import { createContext, useContext, useState } from "react";

const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
  const [ellipis, setEllipis] = useState(null);
  const [addservice,setAddservice]=useState(false)
  const [description,setDescription]=useState("")
  const [serviceName,setServiceName]=useState("")
  const [photoUrl, setPhotoUrl] = useState(false);
  const [photoFile, setPhotoFile] = useState(false);
  const [price, setPrice] = useState(100);
  const[header,setHeader]=useState('')
  const[pricepreview,setPricepreview]=useState(false)
  const [currency, setCurrency] = useState(false);
  const [edit, setEdit] = useState(false);
  const [service,setService]=useState(true)
  const [hour,setHour]=useState(false)
  const [notification,setNotification]=useState(false)
  const [profile,setProfile]=useState(false)
  const[Time,setTime]=useState(false)
  const [activeIndex, setActiveIndex] = useState(null); 
  const [toggleOn, setToggleOn] = useState(false);
  const[timeInfo,setTimeInfo]=useState(null)
  const [startTime, setStartTime] = useState("9:00 AM");
  const [Endtime, setEndTime] = useState("9:00 PM");
  const[age,setage]=useState('')
  const[businessname,setBusinessname]=useState('')
  const[businessDescription,setBusinessDescription]=useState('')
  const[cover,setCover]=useState('')
  const[logo,setlogo]=useState('')
  const[info_type,setInfo_type]=useState('')
  const[phone,setphone]=useState('')
  const[instagram,setInstagram]=useState('')
  const[location,setlocation]=useState('')
  const[email,setEmail]=useState('')
  const[website,setWebsite]=useState('')
  const[startDateSpecefic,setstartDateSpecefic]=useState('')
 const[EndDateSpecefic,setEndDateSpecefic]=useState('')
  const [duration, setDuration] = useState(false);
const [refetchActive,setrefetchActive]=useState(false)


  const hadnleSideInfo=(indx) => {
  setTimeInfo(prev => prev === indx ? null : indx);
}

 
  return (
<ServiceContext.Provider value={{
  service,setService,hour,setHour,notification,setNotification,profile,setProfile,
  ellipis,setEllipis,Time,setTime,addservice,setAddservice,description,setDescription,
  serviceName,setServiceName,photoUrl,setPhotoUrl,price,setPrice,currency,setCurrency,header,setHeader,
  edit,setEdit,activeIndex,setActiveIndex,hadnleSideInfo,toggleOn,setToggleOn,timeInfo,setTimeInfo,
  startTime,setStartTime,Endtime,setEndTime,duration, setDuration,age,setage,businessname,setBusinessname,businessDescription,setBusinessDescription,
  cover,setCover,logo,setlogo,info_type,setInfo_type,phone,setphone,instagram,setInstagram,location,setlocation,
  email,setEmail,website,setWebsite,pricepreview,setPricepreview,photoFile, setPhotoFile,startDateSpecefic,setstartDateSpecefic,EndDateSpecefic,setEndDateSpecefic,
  refetchActive,setrefetchActive
}}>
  {children}
</ServiceContext.Provider>

  );
};
export const useService = () => {
  return useContext(ServiceContext);
};
