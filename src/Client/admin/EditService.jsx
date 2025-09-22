import { useService } from "../../Context/ServiceContext";
import { useState } from "react";
import {Duration,Price,URL,Photo} from './AddServiceMenue'
const EditService = () => {
     const { 
            setAddservice ,description,setDescription ,serviceName,
            setServiceName,photoUrl,price, setPrice,setEdit
          } = useService();
     const [duration, setDuration] = useState(false);
      const[photo, setPhoto]=useState(false)
      const [selectedDuration, setSelectedDuration] = useState("5 minutes");
      const handleSericeName=(e)=>setServiceName(e.target.value)
      const handleDescription=(e)=>setDescription(e.target.value)
      const handleDuration = () => setDuration(prev => !prev);
      const handlePhoto = () =>{setPhoto(prev => !prev)
        if(photoUrl){
          setPhoto(false)
        }
      };
       const handlePrice= () => setPrice(prev => !prev);
  return (
     <div className="flex justify-center items-center">
         <div className="flex flex-col w-full h-full items-center space-y-4 ">
              <h1 className="text-xl text-white pt-8 font-semi-bold text-center ">Edit Service</h1>
        <div className="w-[90%] bg-[#343434] rounded-md">
          <input
           onChange={handleSericeName}
            placeholder="Service Name"
            className="border border-[#2A2A2A] w-full h-16 border-b outline-none pl-4 text-white"
            type="text"
          />
          <input
            onChange={handleDescription}
            placeholder="Description"
            className="border border-[#2A2A2A] w-full h-16 border-b outline-none pl-4 text-white"
            type="text"
          />
          <div className="relative flex h-16 w-full justify-between mr-4">
            <h1 className="text-md w-20 pl-3 text-white flex justify-center items-center font-semibold">
              Picture
            </h1>
             {/* Image box */}
           <div
            className="w-12 h-12 mr-2 mt-2 rounded-md bg-gray-400 bg-center bg-cover"
            style={{ backgroundImage: "url('Event-Booking-1.jpg')" }}
            ></div>
             {photo && (
              <div className="absolute h-[86px] bg-[#343434]  z-30 left-90 top-5 rounded-sm  shadow-xl transition ease-in-out ">
                <Photo/>
              </div>
            )}
            {photoUrl && (
                <div className="absolute h-[86px] bg-[#343434]  z-30 left-90 top-5 rounded-sm  shadow-xl transition ease-in-out ">
                <URL/>
              </div>
              )
            }
          </div>
        </div>

        {/* Duration of the Event */}
        <div className="relative w-[90%] h-30 mt-3 bg-[#343434] rounded-md">
          <div className="flex border border-[#2A2A2A] h-16 w-full justify-between mr-4">
            <h1 className="text-md w-20 pl-3 text-white flex justify-center items-center font-semibold">
              Duration
            </h1>
            {duration && (
              <div className="absolute z-10 left-20 top-15 transition ease-in-out shadow-xl">
                <Duration 
                  selected={selectedDuration} 
                  setSelected={setSelectedDuration} 
                  close={() => setDuration(false)} 
                />
              </div>
            )}
            <button
              onClick={handleDuration}
              className="text-[#168FF4] mr-3 font-light cursor-pointer"
            >
              {selectedDuration}
            </button>
          </div>

          <div className="flex h-16 w-full justify-between mr-4">
            <h1 className="text-md w-20 pl-3 text-white flex justify-center items-center font-semibold">
              Price
            </h1>
            <button onClick={handlePrice} className="text-[#168FF4] mr-3 font-light cursor-pointer">
              100$
            </button>
             {price && (
                <div className="absolute h-[86px] bg-[#343434]  z-30 left-90 top-5 rounded-sm  shadow-xl transition ease-in-out ">
                <Price/>
              </div>
              )
            }
          </div>
          
        </div>
         <button onClick={()=>setEdit(false)} className=" w-60 mt-10 rounded-md bg-[#168FF4] font-bold mr-5 w-14 h-8 cursor-pointer">
          Done
        </button>
      </div>
    </div>
  )
}

export default EditService