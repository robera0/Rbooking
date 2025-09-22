import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown , faToggleOn,faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { useService } from "../../Context/ServiceContext";

const AvailableHrs =({dayName ,index})=>{
 
  const{timeInfo,hadnleSideInfo}=useService()
  

  
   return (
     <>
     <div className="  relative flex justify-between w-[90%] h-12 bg-[#343434] hover:bg-[#323232] cursor-pointer rounded-lg">
         <h1 className="text-md w-20 pl-4 text-white flex text-justify items-center font-light">
              {dayName}
            </h1>
            <button onClick={()=>hadnleSideInfo(index)} className="text-[#168FF4] font-light ] mr-3 cursor-pointer">
              9:00 AM-9:00PM
                <FontAwesomeIcon
                className={`text-sm  font-light ml-2
                ${timeInfo==index ? "text-[#168FF4] rotate-90 scale-120 translate-x-2 z-10" :"text-gray-400"}
                transition ease-in-out duration-300 `} icon={faCaretDown}/>
            </button>
                
    </div>
   
       
 </>
   )


}

export default AvailableHrs