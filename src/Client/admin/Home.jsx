import SideIcons from "./SideIconMenue";
import { faClock, faUser, faBell } from "@fortawesome/free-regular-svg-icons";
import {  faPenNib } from "@fortawesome/free-solid-svg-icons";
import { useService } from "../../Context/ServiceContext";
import Services from "./Services";
import Hour from "./Hour";
import Profile from './Profile'
import Notification from './Notification'
import Main from "./Main";
const Home = () => {
const{
     service,setService,hour,setHour,notification,
      setNotification,profile,setProfile
    }=useService();
     
     const handleService=()=>{
            setService(true)
             setHour(false)
            setProfile(false) 
            setNotification(false)
     }
      const handleHour=()=>{
            setHour(true)
            setProfile(false)
            setService(false)
            setNotification(false)
     }
      const handleProfile=()=>{
         setProfile(true)
            setService(false)
            setNotification(false)
            setHour(false)
     }
      const handleNotificatio=()=>{
           setNotification(true)
            setHour(false)
             setService(false)
            setProfile(false)
     }

  return (
    <div className="flex w-full  h-screen">
  {/* Left Section */}
  <div className="flex h-full w-[30%]">
    {/* Sidebar */}
    <div className="flex pt-20 border-r w-[20%]  bg-[#202020] flex-col space-y-5">
      <SideIcons action={handleService} icons={faPenNib} name="Service" />
      <SideIcons action={handleHour} icons={faClock} name="Hours" />
      <SideIcons action={handleProfile} icons={faUser} name="Profile" />
      <SideIcons action={handleNotificatio} icons={faBell} name="Notification" />
    </div>

    {/* Main content (inside left section) */}
    <div className="w-[70%] h-full bg-[#202020]">
      {service && <Services />}
      {hour && <Hour />}
      {profile && <Profile />}
      {notification && <Notification />}
    </div>
  </div>

  {/* Right Section */}
  <div className="flex-1 h-full ">
    <Main/>
  </div>
</div>

    
  )
}

export default Home