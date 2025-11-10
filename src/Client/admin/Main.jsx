import { motion, AnimatePresence } from "framer-motion";
import { Phone,Clock ,MapPin,Mail, InstagramIcon,ChevronDown,RotateCcw} from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { useState,useRef } from "react";
import  Loader from '../../components/Loader'
import { useService } from "../../Context/ServiceContext";
import Profile from "./Profile";
const Main = () => {
const {refetchActive,setrefetchActive,header,profileView}=useService()
  const [loadingRefetch, setLoadingRefetch] = useState(false);
const getEvents=async()=>{
  
const res= await fetch('http://localhost:5000/api/events')
       return res.json()
  }
  const{data:events ,isLoading,error,refetch} =useQuery({
        queryFn:getEvents,
        queryKey:['event']
  })

const getBussinesProfile=async()=>{
  
const res= await fetch('http://localhost:5000/api/profile')
       return res.json()
  }
  const{data:businesses,BusinessisLoading,Busineserror,Busines_refetch} =useQuery({
        queryFn:getBussinesProfile,
        queryKey:['business']
  })
const formatDuration =(minutes)=> {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  return `${hours}h ${remainingMinutes}m`;
}
 const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  };

  return (
    <div className='w-full  flex '>
      {loadingRefetch ? 
      <Loader/> :
       <>
        <div className="w-[60%] pt-12  h-screen">
       <div className='w-full h-12 flex justify-between border-b border-gray-300'>
       <h1 className='text-xl font-bold'>{header ? header : 'Secure Your Event now'}</h1>
        <button onClick={()=>refetch()} className="cursor-pointer">
           <RotateCcw/>
        </button> 
       </div>
     {isLoading && <div>Loading events...</div>}

    {error && <div>Error: {error.message}</div>}
     <AnimatePresence>
    {events?.map((event,index)=>(
         <motion.div  
             key={index}
             variants={itemVariants}
             initial="hidden"
             animate="visible"
             exit="exit"
            transition={{ duration: 0.3, delay: index * 0.05 }}
  className="flex items-center justify-between px-3 border-b border-gray-300 h-32"
>
  {/* Left side */}
  <div className="flex items-center space-x-4 ">
    {/* Image box */}
    <div className="w-16 h-16 flex-shrink-0 rounded-xl  bg-gray-100">
      <img 
        className="w-full h-full object-cover"  
        src={event.picture ? event?.picture:'/defaultAvater.jpg'} 
        alt={event.name}
      />
    </div>

    {/* Texts */}
    <div className="pt-2 space-y-1 overflow-hidden">
      <div>
        <h4 className="text-black text-lg font-bold  w-[300px]">
          {event.name}
        </h4>
        <p className="text-md -mt-1 font-light text-gray-600 line-clamp-2 w-[550px]">
          {event.description}
        </p>
      </div>
      
      <div className="flex gap-1 text-sm">
        <p className="font-bold">${event.price}</p>
        <p className="text-gray-400">· {formatDuration(event.duration)}</p>
      </div>
    </div>
    
  </div>
  
</motion.div>
  ))}
  </AnimatePresence>
   </div>
   {/*business info box */}

   {profileView ?
       <AnimatePresence exitBeforeEnter>
           <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
                className=" w-full h-full"
              >
                     <div className="flex-1 flex pt-12  justify-center h-screen">
        {/*background Image */}
      <div className='w-[80%] h-180 rounded-2xl shadow-2xl'>
               {businesses?.map((business, index) => (
                <div className=" space-y-12" key={index}>
                  {/* Header Image */}
                  <div 
                style={{
                        backgroundImage: `url(${business.cover || 'gray-200'})`,
                      }}
                  className="relative bg-center bg-cover border border-gray-200 rounded-xl h-32 w-full">

                    <div className="absolute top-24 left-12 w-22 h-22  bg-center bg-cover overflow-hidden outline outline-2 outline-white rounded-full">
                         <img 
                        src={business.logo} 
                        alt="photo preview" 
                        className="w-full h-full object-cover"
                />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="pl-8 pt-8">
                    <h1 className="text-lg font-bold">{business.name}</h1>
                    <p className="text-sm w-[95%] text-gray-700">
                      {business.description}
                    </p>
                    <button className="text-sm text-gray-400 cursor-pointer">
                      Read More
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="pl-4 space-y-6 text-sm">
                    {/* Phone */}
                    {business.info.map((info,index)=>(
                       <>
                        <div className="flex">
                      <div className="w-12 flex text-[#FF7800] justify-center items-center">
                        {info.info_type=='phone' && <>
                        <Phone className="w-5 h-5" />
                        </>}

                         {info.info_type=='instagram' && <>
                        <InstagramIcon className="w-5 h-5" />
                        </>}
                         {info.info_type=='address' && <>
                        <MapPin className="w-5 h-5" />
                        </>}
                         {info.info_type=='email' && <>
                         <Mail className="w-5 h-5" />
                        </>}
                        
                      </div>
                      <p>{info.value}</p>
                    </div>
                       </>
                    ))}
                    {/* Opening Hours */}
                    <div className="flex">
                      <div className="w-12 flex text-[#FF7800] justify-center items-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex gap-2 items-center">
                        <p>Closed</p>
                        <ChevronDown className="w-4 h-4 cursor-pointer" />
                        <p className="text-gray-400 text-sm">
                          Opens on Monday at 9:00 AM
                        </p>
                      </div>
                    </div>
                  </div>
                </div> 
              ))}
      </div>
   </div>
              </motion.div>
         </AnimatePresence>
         :
                <>
                 {null}
                </>
   }

       </>
      }
     
    </div>
  )
}

export default Main