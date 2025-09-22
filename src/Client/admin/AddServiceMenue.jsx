import { useService } from "../../Context/ServiceContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import {  faPen, faCaretDown,faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const EllipisMenue = ()=>{
   const{ setEdit }=useService()
    return(
        <>
     {/*edit bar */}
      <div className=" flex  flex-col flex-wrap w-36 h-36 pt-2 text-white font-light space-y-2 bg-[#323232] rounded-sm ">
           {/*Edite */}
         <button onClick={()=>setEdit(true)} className={`flex items-center justify-between cursor-pointer hover:bg-gray-500 duration-300 `}>
              <p className="test-sm pl-2 ">Edit</p>
                <FontAwesomeIcon className="text-sm mr-3 text-white" icon={faPen} />
         </button>
             {/*Duplicate */}
            <button className="flex items-center justify-between cursor-pointer hover:bg-gray-500 duration-300 ">
             <p className="test-sm pl-2 ">Duplicate</p>
               <FontAwesomeIcon className="text-sm mr-3 text-white" icon={faCopy} />
           </button>
         {/*Hide */}
          <button className="flex items-center justify-between cursor-pointer hover:bg-gray-500 duration-300  ">
              <p className="test-sm pl-2 ">Hide</p>
              <FontAwesomeIcon className="text-sm mr-3 text-white" icon={faEyeSlash} />
           </button>
            {/*Delete */}
            <button className=" group flex items-center justify-between cursor-pointer hover:bg-red-400 duration-300  ">
             <p className="test-sm pl-2 ">delete</p>
             <FontAwesomeIcon className="text-sm flex mr-3  items-center text-red-500 group-hover:text-red-800" icon={faTrash} />
          </button>
     </div>
        </>
    )
}

const Duration = ({ selected, setSelected, close }) => { 
  // 5m, 10m, ... 55m
  const minutes = Array.from({ length: 11 }, (_, i) => (i + 1) * 5);
  // 1h, 2h
  const hours = [1, 2]; 
  const time = [
    ...minutes.map(m => `${m} minutes`),
    ...hours.map(h => `${h}h`)
  ];
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
 // photo upload
  const Photo = () => { 
     const{ setPhotoUrl } = useService();
     const handlePhotoUrl = () => setPhotoUrl(prev =>!prev);
  return (

      <div className=" h-[36px] w-40   justify-center items-center text-white rounded-md space-y-1"> 
          <button  className="flex pl-2 pt-2 justify-between w-full h-full cursor-pointer hover:bg-[#545151] duration-300">
           <input type="file" id="fileUpload" class="file-input" />
            <label for="fileUpload" class="file-label">Upload File</label>
             <FontAwesomeIcon className="text-md pr-3" icon={faUpload} />
        </button>
        <button onClick={handlePhotoUrl} className="flex pl-2 pt-1 justify-between w-full h-full  cursor-pointer hover:bg-[#545151] duration-300">
           Upload URL
             <FontAwesomeIcon className="text-md pr-3 flex  justify-center items-center"  icon={faLink} />
        </button>                  
     </div>
  );
};
//  phot from URL
const URL=()=>{
    const{ setPhotoUrl } = useService();
  return (
     <div className="">
    <div className="flex pt-3 w-90 h-40 bg-[#343434] flex-col text-white rounded-md space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4">
         <button 
          onClick={()=>setPhotoUrl(false)}
          className="text-[#168FF4] font-bold w-14 h-8 cursor-pointer"
        >
          Cancel
        </button>
        <h3 className="text-md font-bold">Upload from URL</h3>
        <button  
          className="text-[#168FF4] font-bold w-14 h-8 cursor-pointer"
        >
          Add
        </button>
      </div>
         <div className="flex justify-center items-center ">
           <button className=" w-50 h-10 bg-[#484646] text-white rounded-md cursor-pointer">Enter Image URL here...</button>
         </div>
      </div>
    </div>
  );
};

// price 

const Price=()=>{

  const{currency, setCurrency,setPrice } = useService();
    const[active,setActive]=useState(false)
  return (
     <div className="">
    <div className="flex pt-3 w-86 h-64 bg-[#343434] flex-col text-white rounded-md space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4">

        <h3 className="text-md font-bold">Price</h3>
        <button  
         onClick={()=>setPrice(false)}
          className="text-[#168FF4] font-bold w-14 h-8 cursor-pointer"
        >
          Done
        </button>
      </div>
       <div className="pt-3">
         <div className="flex  w-70  ml-6  h-10  border-inherit bg-[#484646] items-center ">
           <button onClick={()=>setActive(prev=>!prev)} className={`w-18 h-full border-r border-black text-white  cursor-pointer
            ${active&& 'bg-[#168FF4]'}`}>Fixed</button>
            <button onClick={()=>setActive(prev=>!prev)} className={`w-18 h-full border-r border-black text-white  cursor-pointer
            ${active&& 'bg-[#168FF4]'}`}>From</button>
           <button onClick={()=>setActive(prev=>!prev)} className={`w-18 h-full border-r border-black text-white  cursor-pointer
            ${active&& 'bg-[#168FF4]'}`}>Free</button>
           <button onClick={()=>setActive(prev=>!prev)} className={`w-18 h-full border-r border-black text-white  cursor-pointer
            ${active&& 'bg-[#168FF4]'}`}>Hidden</button>
         </div>
       </div>

       <div> 
         
        <div className="flex h-16 w-full justify-between mr-4 border-b border-black">
            <h1 className="text-lg w-20 pl-3 text-white flex justify-center items-center font-light">
              Price
            </h1>
            <button className="text-[#168FF4] font-bold ] mr-8 cursor-pointer">
              100
            </button>
            </div>

          <div className=" relative flex h-full w-full justify-between mr-4">
            <h1 className="text-md w-20 pl-3 text-white flex justify-center items-center font-light">
              Currency
            </h1>
            <button onClick={()=>setCurrency(prev=>!prev)} className="text-[#168FF4] font-bold ] mr-3 cursor-pointer">
               USD
                <FontAwesomeIcon
                className={`text-sm text-[#168FF4] font-bold ml-2
                ${currency && "rotate-90 scale-120 translate-x-2 z-10"}
                transition ease-in-out duration-300 `} icon={faCaretDown}/>
            </button>
             {
              currency && (
                    <div className=" absolute z-10 left-90 top-8  flex pt-3 w-50 h-full bg-[#413F3F] flex-col text-white  ">
                      <div className="flex justify-between border-b border-black mb-2">
                        <button className="cursor-pointer pl-2">
                          <FontAwesomeIcon icon={faSearch}/>
                          </button> 
                          <input 
                          className="w-full outline-none pl-2"
                          placeholder="Search Currency"
                          type="text" /> 
                      </div>    
                 </div>   
                  )}  
         </div>
       </div>
        
      </div>
    </div>
  );
};

export  {EllipisMenue,Duration,Price,URL,Photo}