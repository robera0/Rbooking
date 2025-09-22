import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useService } from "../../Context/ServiceContext";
import { faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import {Duration,Price,URL,Photo} from './AddServiceMenue'

const AddService = () => {
  const
   { 
    setAddservice ,description,setDescription ,serviceName,
    setServiceName,photoUrl,price, setPrice
  } = useService();
  const cancelAddService = () => setAddservice(false);
  const [toggleOn, setToggleOn] = useState(false);
  const [duration, setDuration] = useState(false);
  const [photo, setPhoto]=useState(false)
  const [selectedDuration, setSelectedDuration] = useState("5 minutes");
  const handleSericeName=(e)=>setServiceName(e.target.value)
  const handleDescription=(e)=>setDescription(e.target.value)
  const handleToggle = () => setToggleOn(prev => !prev);
  const handleDuration = () => setDuration(prev => !prev);
  const handlePhoto = () =>{setPhoto(prev => !prev)
    if(photoUrl){
      setPhoto(false)
    }
  };
   const handlePrice= () => setPrice(prev => !prev);
 
  return (
    <div className="w-[22%] h-400px bg-[#202020]">
      <div className="flex justify-between flex-wrap space-y-8 pt-8">
        <button
          onClick={cancelAddService}
          className="w-14 h-8 ml-4 text-[#168FF4] font-light cursor-pointer"
        >
          Cancel
        </button>
        <h3 className="text-xl text-white font-semibold text-center">
          Add Service
        </h3>
        <button className="text-[#3B3A3A] font-bold mr-5 w-14 h-8 cursor-pointer">
          Done
        </button>
      </div>

      {/* Basic info */}
      <div className="flex flex-col w-full h-full items-center space-y-4 ">
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
            <button onClick={handlePhoto} className="text-[#168FF4] mr-3 font-light cursor-pointer">
              Add
            </button>
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
        <div className="relative w-[90%] h-32 mt-3 bg-[#343434] rounded-md">
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

        {/* Age Section */}
        <div className="w-[90%] pt-3 h-32 mt-3 bg-[#343434] space-y-5 rounded-md">
          <div className="flex justify-between">
            <h3 className="text-md w-20 pl-3 text-white flex justify-center items-center font-semibold">
              Age
            </h3>
            <button
              className="mr-4 cursor-pointer w-10"
              onClick={handleToggle}
            >
              <FontAwesomeIcon
                className="text-3xl text-[#168FF4] transition ease-in-out duration-300"
                icon={toggleOn ? faToggleOn : faToggleOff}
              />
            </button>
          </div>
          {toggleOn && (
            <div className="flex justify-start pl-5">
              <select className="px-3 text-[#168FF4] bg-gray-700 cursor-pointer outline-none">
                <option value="18+">18+</option>
                <option value="21+">21+</option>
                <option value="25+">25+</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddService;
