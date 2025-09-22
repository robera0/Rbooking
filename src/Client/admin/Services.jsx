import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useService } from "../../Context/ServiceContext";
import AddService from "./AddService";
import EditService from "./EditService";
import {EllipisMenue } from "./AddServiceMenue";

const Services = () => {
    const{ellipis, setEllipis,addservice,setAddservice, edit}=useService();
    const handleEllipis=()=>setEllipis(prev=>!prev)
    const handleAddservice=()=>setAddservice(true)
  return (
    <div className="">
      <div className=" flex w-full h-full fixed">            
    {/*Main content */}
        {
         addservice ? 
            <>
              <AddService/>
            </>
               : 
          <>
           <div className="w-[22%] h-400px bg-[#202020]">
             {edit ? 
             <div className="flex justify-center items-center ">
              <EditService/>
             </div> :
               <>
                   <div>
                   <h1 className="text-xl text-white pt-8 font-semi-bold text-center ">Service</h1>
              <div className="w-full h-full flex flex-col flex-wrap space-y-8 items-center mt-8">
                 <div className="w-70 h-12 bg-[#343434] rounded-lg">
                    <button onClick={handleAddservice} className="flex space-x-2  justify-center items-center w-full h-full hover:bg-gray-700 duration-300 rounded-md cursor-pointer">
                      <FontAwesomeIcon className="text-lg text-[#168FF4]" icon={faPlus} />
                      <h3 className=" text-[#168FF4] text-md">Add Service</h3></button>   
                     </div>
                   {/*Event Posted */}
             <div className="w-78 bg-[#343434] rounded-lg">
                {/* Row 1 */}
                <div className="flex items-center justify-between px-3 border-b h-16">
                    <div className="flex items-centehandletoggler space-x-4">
                    {/* Image box */}
                    <div className="w-12 h-12 bg-gray-400 flex justify-center items-center rounded">
                        <img src="Event-Booking-1.jpg" alt="" />
                    </div>
                    <div>
                        <h4 className="text-white">Birthday Party Booking</h4>
                        <p className="text-gray-400 text-sm">$250</p>
                    </div>
                    </div>
                    <button onClick={handleEllipis} className={`cursor-pointer rounded-sm hover:bg-gray-500 duration-300
                                        ${ellipis&&'bg-gray-500 duration-300'}`}>
                    <FontAwesomeIcon className="text-lg text-[#168FF4]" icon={faEllipsis} />
                    </button>
                    {ellipis && <>
                    <div className="absolute z-10 left-95 top-54 transition ease-in-out shadow-xl">
                        <EllipisMenue/>
                      </div>
                    </>}            
                </div>
                  
                {/* Row 2 */}
                <div className="flex items-center justify-between px-3 border-b h-16">
                    <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-400 flex justify-center items-center rounded">
                        <img src="Event-Booking-1.jpg" alt="" />
                    </div>
                    <div>
                        <h4 className="text-white">Corporate Event Booking</h4>
                        <p className="text-gray-400 text-sm">$450</p>
                    </div>
                    </div>
                    <button onClick={handleEllipis} className="cursor-pointer rounded-sm hover:bg-gray-500 duration-300">
                    <FontAwesomeIcon className="text-lg text-[#168FF4]" icon={faEllipsis} />
                    </button>
                </div>
                {/* Row 3 */}
                <div className="flex items-center justify-between px-3 border-b h-16">
                    <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-400 flex justify-center items-center rounded">
                        <img src="Event-Booking-1.jpg" alt="" />
                    </div>
                    <div>
                        <h4 className="text-white">Wedding Reception Setup</h4>
                        <p className="text-gray-400 text-sm">$1250</p>
                    </div>
                    </div>
                    <button onClick={handleEllipis} className="cursor-pointer rounded-sm hover:bg-gray-500 duration-300">
                    <FontAwesomeIcon className="text-lg text-[#168FF4]" icon={faEllipsis} />
                    </button>
                </div>
                </div>
                {/*header name */}
                  <div className="w-78 h-16 bg-[#343434] rounded-lg">
                     <h3 className="text-gray-300 pl-4 pt-2 text-sm">Header title</h3>
                     <input className="w-full text-white outline-none pl-4 pt-1" type="text" />
                 </div>
             </div>
              </div>
               </>
             }
          
          
          </div>
                  </>
            }

      </div>
 
    </div>
  );
};

export default Services;
