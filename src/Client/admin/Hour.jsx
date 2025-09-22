import AvailableHrs from './HourMenue'
import { useState } from "react";
import { useService } from "../../Context/ServiceContext";
import Toggle from '../../components/Toggle'
import { Ellipsis } from 'lucide-react';

const Hour = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [sidetime,setSideTime] = useState(false) // for the side time
      const{timeInfo,hadnleSideInfo}=useService()
      
    
  return (
       <div>
         <h1 className="text-xl text-white pt-8 font-semi-bold text-center ">Available Hours</h1>
           <div className=" w-full h-full flex flex-col flex-wrap space-y-2 items-center mt-8">
            {days.map((day,index)=>(
                 <>
                   <AvailableHrs
                   key={index}
                   dayName={day}
                   index={index}
                   />
                    {/*sideTime info */}
    {timeInfo && <>
            <div className='absolute top-16  left-116 pl-4 w-[20%] h-62 bg-[#202020] flex flex-col justify-around rounded-lg'>
           <div className=" w-[90%] flex h-12 bg-[#343434] hover:bg-[#323232] cursor-pointer rounded-sm">
              <Toggle
                name="Avialable"
                />
           </div>
              <div className=" flex justify-between w-[90%] pl-4 h-12 bg-[#343434] hover:bg-[#323232] rounded-lg">
                <button onClick={()=>setSideTime(prev=>!prev)} className="text-[#168FF4] font-light ] mr-3 cursor-pointer">
                   9:00 AM-9:00PM
                </button>
                <div className="flex justify-center items-center mr-4">
                    <Ellipsis className="text-white  cursor-pointer"/>
                </div>   
              </div>
                 
             </div>
    </>
    }
     
                 </>

            ))} 
            </div>
          
        </div>
  )
}

export default Hour