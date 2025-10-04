import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useService } from "../../Context/ServiceContext";
import AddService from "./AddService";
import EditService from "./EditService";
import {EllipisMenue } from "./AddServiceMenue";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const Services = () => {
    const{ellipis, setEllipis,addservice,header,setHeader,setAddservice, edit}=useService();
    const handleEllipis=(index)=>{
      setEllipis(prev=>prev === index ? null: index)
    }

    const handleAddservice=()=>setAddservice(true)
    const [activeEllips,setActiveEllips]=useState(null)  
    const fetchEvents=async()=>{
      const res= await fetch('http://localhost:5000/api/events')
       return res.json()
    }

    const {data:events,isLoading ,error}=useQuery({
      queryFn:fetchEvents,
      queryKey:['event']
    })

  return (
      <div className="  w-full h-full ">            
    {/*Main content */}
        {
         addservice ? 
            <>
              <AddService/>
            </>
               : 
          <>
           <div className=" bg- h-400px bg-[#202020]">
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
                      <h3 className=" text-[#168FF4] text-md">Add Service</h3>
                      </button>   
                     </div>
                   {/*Event Posted */}
             <div className="w-78 bg-[#343434]  rounded-lg">
               
                   {events?.map((e,index)=>(
                      <>
                       <div key={index} className="flex items-center justify-between px-3 border-b h-16">
                        <div  className="flex items-centehandletoggler space-x-4">
                    {/* Image box */}
                    <div className="w-12 h-12 bg-gray-400 flex justify-center items-center rounded">
                        <img className="w-full h-full object-cover" src={e.picture ? e?.picture :'/defaultAvater.jpg'} alt="" />
                    </div>
                    <div>
                        <h4 className="text-white text-sm">{e?.name}</h4>
                        <p className="text-gray-400 text-sm">${e?.price}</p>
                    </div>
                    </div>
                    <button onClick={()=>handleEllipis(index)} className={`cursor-pointer rounded-sm hover:bg-gray-500 duration-300
                                        ${ellipis==index &&'bg-gray-500 duration-300'}`}>
                    <FontAwesomeIcon className="text-lg text-[#168FF4]" icon={faEllipsis} />
                    </button>
                    {ellipis == index && <>
                    <div className="absolute z-10 left-95 top-54 transition ease-in-out shadow-xl">
                        <EllipisMenue/>
                      </div>
                    </>}  
                    </div>          
                      </>
                   ))}       
                
                </div>
                {/*header name */}
                  <div className="w-78 h-16 bg-[#343434] rounded-lg">
                     <h3 className="text-gray-300 pl-4 pt-2 text-sm">Header title</h3>
                     <input value={header} onChange={(e)=>setHeader(e.target.value)}className="w-full text-white outline-none pl-4 pt-1" type="text" />
                 </div>
             </div>
              </div>
               </>
             }
          
          
          </div>
                  </>
            }

      </div>
 
  );
};

export default Services;
