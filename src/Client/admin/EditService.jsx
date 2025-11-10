import { useService } from "../../Context/ServiceContext";
import { useState } from "react";
import {Duration,Price,URL,Photo} from './AddServiceMenue'

const EditService = () => {
     const { 
             description,setDescription ,serviceName,pricepreview,selectedEvent,setPricepreview,
            setServiceName,photoUrl,price, setPrice,setEdit,photoFile, setPhotoFile
          } = useService();
     const [duration, setDuration] = useState(false);
      const[photo, setPhoto]=useState(false)
      const [selectedDuration, setSelectedDuration] = useState("5 minutes");
      const handleSericeName=(e)=>setServiceName(e.target.value)
      const handleDescription=(e)=>setDescription(e.target.value)
      const handleDuration = () => setDuration(prev => !prev);
       const [photoPreviewer,setPhotoPreviewr]=useState(null)

      const handlePhoto = () =>{ setPhoto(prev => !prev)
        console.log('true')

      };
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


  const handlePrice= () => setPricepreview(prev => !prev);
  
  const EditEvents = async () => {

    try{
         const formData = new FormData();
        formData.append('name', serviceName);
        formData.append('description', description);
       if(photoFile) formData.append('picture',photoFile)
        formData.append('duration',  Number(duration)||5)
        formData.append('price', price);

  const res = await fetch(`http://localhost:5000/api/events/${selectedEvent._id}`, {
    method: 'PUT',
    body: formData,
  });

 const data = await res.json();
  console.log(data);
  return data;
    }
    catch(error){
      console.log(error)
    }

};

  return (
     <div className="flex mt-22 justify-center items-center">
         <div className="flex flex-col w-full h-full items-center space-y-4 ">
         <h1 className="text-xl text-white pt-8 font-semi-bold text-center ">Edit Service</h1>
        <div className="w-[90%] flex  flex-cols flex-wrap bg-[#343434] rounded-md overflow-visible">
          <div className="w-full pl-4 pt-4 gap- ">
          <label className="text-lg font-light text-center text-[#645D5D]" htmlFor="">Service Name</label>          
          <textarea
              id="description"
              value={serviceName ||selectedEvent?.name || ""}
              onChange={(e) => {
                handleSericeName(e);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Enter service description..."
              className="border-b border-[#2A2A2A] w-full rounded-md bg-transparent outline-none  text-white placeholder-gray-500 resize-none overflow-hidden"
            ></textarea>
          </div>
         
         <div className="w-full pl-4 pt-4 gap-8 ">
          <label className="text-lg font-light text-center text-[#645D5D]" htmlFor="">Description</label>          
          <textarea
              id="description"
              value={description ||selectedEvent?.description || ""}
              onChange={(e) => {
                handleDescription(e);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Enter description..."
              className="border-b border-[#2A2A2A] w-full rounded-md bg-transparent outline-none  text-white placeholder-gray-500 resize-none overflow-hidden"
            ></textarea>
          </div>

          <div className="relative flex h-16 w-full justify-between mr-4">
            <h1 className="text-md w-20 pl-3 text-white flex justify-center items-center font-semibold">
              Picture
            </h1>
             {/* Image box */}
           <div
           onClick={handlePhoto}
            className="w-12 h-12 mr-2 mt-2 rounded-md bg-gray-400 bg-center bg-cover"
            style={{ backgroundImage: `url(${selectedEvent.photo || photoPreviewer || "/defaultAvater.jpg"})` }}
            ></div>
             {photo && (
              <div className="absolute h-[86px] bg-[#343434] z-50 left-[90px] top-5 rounded-sm  shadow-xl transition ease-in-out ">
                <Photo
                actionFile={handlePhotoPreviewer}
                   />
              </div>
            )}
            {photoUrl && (
                <div className="absolute h-[86px] bg-[#343434]  z-30 left-[90px] top-5 rounded-sm  shadow-xl transition ease-in-out ">
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
                  selected={selectedDuration || selectedEvent?.duration} 
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
              {selectedEvent?.price}$
            </button>
             {pricepreview && (
                <div className="absolute h-[86px] bg-[#343434]  z-30 left-[90px] top-5 rounded-sm  shadow-xl transition ease-in-out ">
                <Price/>
              </div>
              )
            }
          </div>
          
        </div>
         <button onClick={async ()=>{
          setEdit(false)
          await EditEvents()
         }} className=" w-60 mt-10 rounded-md bg-[#168FF4] font-bold mr-5 w-14 h-8 cursor-pointer">
          Done
        </button>
      </div>
    </div>
  )
}

export default EditService