import { useService } from "../../Context/ServiceContext";
import { useState } from "react";
import {Duration,Price,URL,Photo} from './AddServiceMenue'
import Toggle from "../../components/Toggle";
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const AddService = () => {
  const
   { 
    setAddservice ,description,setDescription ,serviceName,price,
    setServiceName,photoUrl,pricepreview,setPricepreview,toggleOn, setToggleOn,
    age,setage,photoFile, setPhotoFile,header,setHour,setService
  } = useService();
  
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
  

  const cancelAddService = () => setAddservice(false);
  const [duration, setDuration] = useState(false);
  const [photo, setPhoto]=useState(false)
  const [selectedDuration, setSelectedDuration] = useState("5 minutes");
  const handleSericeName=(e)=>setServiceName(e.target.value)
  const handleDescription=(e)=>setDescription(e.target.value)
  const handleDuration = () => setDuration(prev => !prev);
  const handlePhoto = () =>{setPhoto(prev => !prev)
    if(photoUrl){
      setPhoto(false)
    }
  };
   const handlePrice= () => setPricepreview(prev => !prev);
  const handleAge=(e)=>setage(e.target.value)

  const [photoPreviewer,setPhotoPreviewr]=useState(null)

  const handlePhotoPreviewer=(e)=>{
     const file = e.target.files[0];
         if(file){
       setPhotoFile(file);
    const previewUrl =  window.URL.createObjectURL(file);
        setPhotoPreviewr(previewUrl);
             if(previewUrl){
             setPhoto(false)
                   }
                  }

  }

  const handleEvents=()=>{
    const formData = new FormData()

    formData.append('name',serviceName)
    formData.append('description',description)
    formData.append('duration',duration)
    formData.append('price',price)
    formData.append('age',age)
    formData.append('start_time',"")
    formData.append('end_time',"")
    formData.append('header',header)

    if(photo) formData.append('picture',photoFile)
      mutation.mutate(formData)
  }
  return (
    <div className="w-full h-400px bg-[#202020]">
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
          <div className={`relative flex ${photoPreviewer ? 'h-22':'h-16'}  w-full justify-between mr-4`}>
            <h1 className="text-md w-20 pl-3 text-white flex justify-center items-center font-semibold">
              Picture
            </h1>
            { photoPreviewer  ?
              <div className="w-16 h-16  mr-2  mt-4 rounded-md  bg-center bg-cover overflow-hidden">
               <img 
                  src={photoPreviewer} 
                  alt="photo preview" 
                  className="w-full h-full object-cover"
                />
                </div>
                :
              <>
            <button onClick={handlePhoto} className="text-[#168FF4] mr-3 font-light cursor-pointer">
              Add
            </button>
              </>
 
            }
           
             {photo && (
              <div className="absolute h-[86px] bg-[#343434]  z-30 left-90 top-5 rounded-sm  shadow-xl transition ease-in-out ">
                <Photo
                actionFile={handlePhotoPreviewer} />
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
              {price}$
            </button>
             {pricepreview && (
                <div className="absolute h-[86px] bg-[#343434]  z-30 left-90 top-5 rounded-sm  shadow-xl transition ease-in-out ">
                <Price/>
              </div>
              )
            }
          </div>
        </div>

        {/* Age Section */}
        <div className="w-[90%] pt-3 h-32 mt-3 bg-[#343434] space-y-5 rounded-md">
          <Toggle
           name="Age Restriction"
          />
          {toggleOn && (
            <div className="flex justify-start pl-5">
              <select value={age} onChange={handleAge} className="px-3 text-[#168FF4] bg-gray-700 cursor-pointer outline-none">
                <option value="18+">18+</option>
                <option value="21+">21+</option>
                <option value="25+">25+</option>
              </select>
            </div>
          )}
        </div>
         <div  className='flex  justify-center items-center'>
                               <button onClick={()=>{setHour(true)
                                setService(false)
                               }} className=' w-32 h-8 text-center text-white font-semibold bg-[#343434] cursor-pointer rounded'> Next </button>
                     </div>
      </div>
    </div>
  );
};

export default AddService;
