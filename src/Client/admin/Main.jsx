import { Info } from "./Profile"
import { Phone,Clock ,MapPin,Mail, InstagramIcon,ChevronDown,RotateCcw} from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { useState,useRef } from "react";
import  Loader from '../../components/Loader'
import { useService } from "../../Context/ServiceContext";
const Main = () => {
const {refetchActive,setrefetchActive,header}=useService()
  const [loadingRefetch, setLoadingRefetch] = useState(false);

const getEvents=async()=>{
  
const res= await fetch('http://localhost:5000/api/events')
       return res.json()
  }
  const{data:events ,isLoading,error,refetch} =useQuery({
        queryFn:getEvents,
        queryKey:['event']
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

  return (
    <div className='w-full  flex '>
      {loadingRefetch ? <Loader/> :
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

    { events?.map((event,index)=>(
<div  
  key={index}  
  className="flex items-center justify-between px-3 border-b border-gray-300 h-32"
>
  {/* Left side */}
  <div className="flex items-center space-x-4 overflow-hidden">
    {/* Image box */}
    <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
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
</div>

  ))}
   </div>
   {/*business info box */}
     <div className="flex-1 flex pt-12  justify-center h-screen">
        {/*background Image */}
      <div className='w-[80%] h-180 rounded-2xl shadow-2xl space-y-12'>
          <div className='relative bg-gray-200 rounded-xl h-32 w-full'>
            {/*Logo image */}
          <div className="absolute top-24 left-12 w-22 h-22 bg-gray-200  outline outline-2 outline-white rounded-full"></div>
          </div>
          {/*header */}
          <div className='pl-8 pt-8'>
            <h1 className='text-lg font-bold'>Eventure</h1>
            <p className='text-sm w-[95%]'>Eventure helps you host ecents with zero hassle and 100% wow facts.from birthday to wedding ,our cozy and customizable spaces..</p>
            <button className='text-sm text-gray-400 cursor-pointer'>Read More</button>
          </div>
          {/*personal info */}
             
          <div className='pl-4 space-y-6 text-sm'>
           <div className='flex '>
             {/*icon */}
          <div className='w-12  flex text-[#FF7800] justify-center items-center'>       
           <Phone className="w-5 h-5"/> 
         </div>
          <p>+251935385438</p>
      </div>
          
          <div className='flex gap- '>
             {/*icon */}
          <div className='w-12  flex text-[#FF7800] justify-center items-center'>       
           <InstagramIcon className="w-5 h-5"/> 
         </div>
          <p>@Eventure</p>
      </div>

       <div className='flex gap- '>
             {/*icon */}
          <div className='w-12  flex text-[#FF7800] justify-center items-center'>       
           <MapPin className="w-5 h-5"/> 
         </div>
          <p>1234 Fashion Avenue ,koye feche ,KFC 1000</p>
      </div>
        <div className='flex gap- '>
             {/*icon */}
          <div className='w-12  flex text-[#FF7800] justify-center items-center'>       
           <Mail className="w-5 h-5"/> 
         </div>
          <p>contact@eventure.com</p>
      </div>
       
       <div className='flex gap- '>
             {/*icon */}
          <div className='w-12  flex text-[#FF7800] justify-center items-center'>       
           <Clock className="w-5 h-5"/> 
         </div>
          <div className="flex gap-2">
           <p>Closed</p>
           <div className="flex">
             <button className="cursor-pointer">
              <ChevronDown className="w-4 h-4"/>
             </button> 
           <p className="text-gray-400 text-sm">Opens on Monday at 9:00 AM</p>
           </div>
           
          </div>

          
      </div>
    </div>
      </div>
   </div>
       </>
      }
     
    </div>
  )
}

export default Main