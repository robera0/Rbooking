import {AvailableHrs}  from './HourMenue'
import {DateSpecific} from './HourMenue'
import { useState } from "react";
import { useService } from "../../Context/ServiceContext";
import Toggle from '../../components/Toggle'
import { Check,ChevronRight,Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {Duration} from './AddServiceMenue'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const MaxDuration = ({ selected, setSelected, close }) => { 
const days = Array.from({ length: 14 }, (_, i) => `${i + 1} day${i + 1 > 1 ? "s" : ""}`);

// Months: 1 to 2
const months = Array.from({ length: 2 }, (_, i) => `${i + 1} month${i + 1 > 0 ? "s" : ""}`);

// Final array
const time = [...days, ...months];

  return (
    <div className="flex pt-3 w-60 bg-[#343434] flex-col text-white rounded-md space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4">
        <h3 className="text-md font-bold">Duration</h3>
        <button 
          onClick={close} 
          className="text-[#168FF4] font-bold w-14 h-8 cursor-pointer"
        >
          Done
        </button>
      </div>

      <div className="w-full h-[0.5px] bg-gray-400"></div>

      {/* List of durations */}
      <div className="flex flex-col px-5 pt-2 space-y-3 max-h-64 overflow-y-auto">
        {time.map((t, index) => (
          <label 
            key={index} 
            className="flex items-center space-x-3 cursor-pointer"
          >
            <input
              type="radio"
              name="duration"
              value={t}
              checked={selected === t}
              onChange={() => setSelected(t)}
              className="cursor-pointer"
            />
            <span>{t}</span>
          </label>
        ))}
      </div>

      {/* Custom button */}
      <button className="cursor-pointer mt-3 mb-4 px-4 bg-[#168FF4] text-white rounded-md self-center">
        Custom
      </button>
    </div>
  );
};
const TimeInput=({action})=>{
  return (
    <input
      type="time"
      onChange={action}
    />
  );
}
const Hour = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [sidetime,setSideTime] = useState(false) // for the side time
    const{timeInfo,setTimeInfo, toggleOn, startTime, setStartTime,Endtime, setEndTime,setService, setAddservice ,description,setDescription ,serviceName,price,
    setServiceName,photoUrl,pricepreview,setPricepreview, setToggleOn,
    age,setage,photoFile, setPhotoFile,header,setHour,setrefetchActive,duration, setDuration}=useService()
    const [deletehr,setdeletehr]=useState(false)
    const[dateSpecefic,setDateSpecefic]=useState(false)
    const[minhr,setminhr]=useState(false)
    const[maxbooking,setmaxBokking]=useState(false)
    const [selectedDuration, setSelectedDuration] = useState("5 minutes");
    const [selectedMonth, setSelectedMax] = useState("5 minutes");
      
    //add events
  const addEvents=(eventData)=>{
    const res= axios.post('http://localhost:5000/api/events',eventData)
    return res.data
  }
const queryClient = useQueryClient()  
    const mutation = useMutation({
      mutationFn:addEvents,
      onSuccess:()=>{
        queryClient.invalidateQueries(['events'])
         setAddservice(false)
      }
    })


      const handleEvents=()=>{
    const formData = new FormData()

    formData.append('name',serviceName)
    formData.append('description',description)
    formData.append('duration', Number(duration)||5)
    formData.append('price',price)
    formData.append('age',age)
    formData.append('start_time',startTime)
    formData.append('end_time',Endtime)
    formData.append("header", header || "Default Header");

    if(photoFile) formData.append('picture',photoFile)
      mutation.mutate(formData)
     setrefetchActive(true)
     if(mutation.isSuccess){
         refetch()
     }
    setHour(false)
    setService(true)

  }  
   
  return (
      <div className=' scroll-hidden h-screen  overflow-auto '>
       <div className='  space-y-8 '>
         <h1 className="text-xl text-white pt-8 font-semi-bold text-center ">Available Hours</h1>
           <div className="w-full h-full flex flex-col flex-wrap space-y-2 items-center mt-6">
            {days.map((day,index)=>(
                 <> 
                   <AvailableHrs
                   key={index}
                   dayName={day}
                   indx={index}
                   />
                    {/*sideTime info */}
    {timeInfo==index && <>
      <div>
         <div className='absolute top-16  left-124 pl-4 w-[20%] h-72 bg-[#202020] flex flex-col justify-around rounded-lg'>
           <div className=" w-[90%] flex h-12 bg-[#343434] hover:bg-[#323232] cursor-pointer rounded-sm">
              <Toggle
                name="Avialable"
                />
           </div>
           { toggleOn &&
               <>
                <div className=' w-[90%] h-24  bg-[#343434] rounded'>
                  <div className="  flex justify-between pl-4 h-12  border-b  hover:bg-[#323232]">
                    {sidetime ? <>
                         <div className=" flex space-x-4  bg-[#343434] transition ease-in-out shadow-xl">
                          <TimeInput
                          action={(e) => setStartTime(e.target.value)}
                          time={startTime}
                          />
                          <TimeInput
                          action={(e) => setEndTime(e.target.value)}
                          time={Endtime}
                          />
                         </div>
                    </> :
                      <>
                      <button onClick={()=>setSideTime(prev=>!prev)} className="text-[#168FF4] font-light ] mr-3 cursor-pointer">
                     {startTime}-{Endtime}
                    </button>
                      </>
                    
                    }
                 <div className="flex  w-12 h-12  justify-center  mr-2">
                     {sidetime ? 
                     <>
                      <button onClick={()=>setSideTime(false)} className='flex  justify-center items-center cursor-pointer'>
                          <Check className="w-5  h-5 text-sm flex  text-[#168FF4] group-hover:text-red-800"/>
                      </button>
                     </> : 
                     <>
                      <button className='flex justify-center items-center cursor-pointer' onClick={()=>setdeletehr(true)}>
                          <Trash2 className="w-5 h-5 text-sm flex  text-red-500 group-hover:text-red-800"/>
                      </button>
                     </>
                  }
                      
                 </div>   
               </div>
                  <div className=" flex justify-between h-12  ">
                     <button className="flex space-x-2 justify-center items-center w-full  h-full hover:bg-gray-700 duration-300 rounded cursor-pointer">
                      <FontAwesomeIcon className="text-lg text-[#168FF4]" icon={faPlus} />
                      <h3 className=" text-[#168FF4] text-md">Add Working Hours</h3>
                      </button> 
                  </div>
               </div>
               </>
           }

               {/*button */}
                     <div  className='flex  justify-center items-center'>
                               <button onClick={()=>setTimeInfo(null)} className=' w-32 h-8 text-center text-white font-semibold bg-[#343434] cursor-pointer rounded'> Done </button>
                     </div>
             </div>
       </div>      
    </>
    }
  </>
 ))} 
   
  </div>
  
     <div className=' w-full space-y-6'>
      {/*data specific hours */}
          <div  className='space-y-4 pl-4'>
              <div className='group w-[90%] h-12  flex items-center  justify-between bg-[#343434]  hover:bg-[#323232] rounded'>
                <label className='pl-4 text-white font-light' htmlFor="button">Date-Specefic Hours</label>
             <button onClick={()=>setDateSpecefic(prev=>!prev)} className={` ${dateSpecefic && 'rotate-90'} pl-4 h-full text-white font-light cursor-pointer outline-none transition ease-in-out duration-300  `}>
              <ChevronRight className={`text-sm mr-3 text-[#168FF4]`}/>
            </button>
           </div>

          {
            dateSpecefic && <>       
              <DateSpecific/>
              </>
          }
          </div>

    {/*min advanced booking */}
     <div  className='relative pl-4'>
          <div className='group w-[90%] h-12 flex items-center  justify-between bg-[#343434]  hover:bg-[#323232] rounded'>
             <label className='pl-4 text-white font-light' htmlFor="button">Min Advanced Booking </label>
            <button onClick={()=>setminhr(prev=>!prev)} className={` ${minhr && 'rotate-360'} pl-4 h-full text-white font-light cursor-pointer outline-none transition ease-in-out duration-300  `}>
                <ChevronRight className="text-sm mr-3 text-[#168FF4]"/>
            </button>  
              </div>
                <p className='text-[#8C8484]'>set how far advanced appointment must be booked eg , at least 1hour before</p>
        {
          minhr && 
           <div className="absolute fixed top-90 left-122  h-32 inset-0 z-50 ">
          <Duration
            selected={selectedDuration} 
            setSelected={setSelectedDuration} 
          close={() => setminhr(false)} 
               />
          </div>
        }
       
       </div>
       
    {/*max advanced booking */}
       <div  className='relative pl-4'>
          <div className='group w-[90%] h-12 flex items-center  justify-between bg-[#343434]  hover:bg-[#323232] rounded'>
             <label className='pl-4 text-white font-light' htmlFor="button">Max Advanced Booking  </label>
            <button onClick={()=>setmaxBokking(prev=>!prev)} className={` ${maxbooking && 'rotate-360'} pl-4 h-full text-white font-light cursor-pointer outline-none transition ease-in-out duration-300  `}>
                <ChevronRight className="text-sm mr-3 text-[#168FF4]"/>
            </button>  
              </div>
                 <p className='text-[#8C8484]'>define how far into the future booking can be made such as up to 2 months in advance</p>
        {
          maxbooking && 
           <div className="absolute fixed top-90 left-122  h-32 inset-0 z-50 ">
          <MaxDuration
            selected={selectedMonth} 
            setSelected={setSelectedMax} 
           close={() => setminhr(false)} 
               />
          </div>
        }
       
       </div>
          <div  className='flex mb-12 justify-center items-center'>
                <button onClick={handleEvents} className=' w-56 h-12 text-center text-white font-semibold bg-[#343434] cursor-pointer rounded'> Done </button>
             </div>
        </div>
   </div>
</div>
  )
}

export default Hour