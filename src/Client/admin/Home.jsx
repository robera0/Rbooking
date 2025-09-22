import SideIcons from "./SideIconMenue";
import { faClock, faUser, faBell } from "@fortawesome/free-regular-svg-icons";
import {  faPenNib } from "@fortawesome/free-solid-svg-icons";
import { useService } from "../../Context/ServiceContext";
import Services from "./Services";
import Hour from "./Hour";
import Profile from './Profile'
import Notification from './Notification'
const Home = () => {
     const{service,setService,hour,setHour,notification,setNotification,profile,setProfile}=useService();
     
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
     <div className="">
      <div className=" flex w-full h-full fixed">            
        <div className="flex pt-20 border-r w-[5%] bg-[#202020] flex-col space-y-5">
          {/* Service */}
          <SideIcons
            action={handleService}
            icons={faPenNib}  
            name="Service" />
        {/* Hours */}
          <SideIcons 
            action={handleHour}
            icons={faClock} 
            name="Hours" />
          {/* Profile */}
          <SideIcons 
            action={handleProfile}
            icons={faUser} 
            name="Profile" />
          {/* Notification */}
           <SideIcons
            action={handleNotificatio}
            icons={faBell}
            name="Notification" />
        </div>
         {/*Main content */}
       
           <div className="w-[22%] h-400px bg-[#202020]">
            {service && <>
              <Services/>
            </>}
            {hour && <>
              <Hour/>
            </>}
            {profile && <>
              <Profile/>
            </>}
            {notification && <>
              <Notification/>
            </>}
          </div>
                 
        

      </div>
 
    </div>
  )
}

export default Home