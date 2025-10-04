import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useService } from "../../Context/ServiceContext";
import { useState, useRef } from "react";
import { Calendar } from "lucide-react";

// CancelPopUp 
export const CancelPopUp = ({ onClose, onDiscard }) => {
  return (
<div className=' w-[32%] h-full flex flex-col text-white justify-center items-center bg-[#242424] rounded'>  
    <div>
       <p className="text-center mb-6">
        Are you sure you want to discard all changes?
      </p>
    </div>
  
      <div className="flex mb-4 text-sm space-x-4">
        <button
          onClick={onClose}
          className="w-36 h-8 rounded bg-[#168FF4] cursor-pointer"
        >
          Keep Editing
        </button>
        <button
          onClick={onDiscard}
          className="w-36 h-8 rounded bg-red-500 cursor-pointer"
        >
          Discard Changes
        </button>
      </div>
    </div>
  );
};


// DateSpecific 
export const DateSpecific = () => {
  const [addhr, setAddhr] = useState(false);
  const [date, setDate] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const{ startTime,setStartTime,Endtime,setEndTime,
    startDateSpecefic,setstartDateSpecefic,EndDateSpecefic,setEndDateSpecefic
  }=useService()

  const StartdateInputRef =useRef()
  const EnddateInputRef =useRef()
  
  const handleEndRef=()=>{
    if(EnddateInputRef){
    EnddateInputRef.current.showPicker?.()
    EndDateSpecefic.current.click?.()
  }
}
  const handledateRef = ()=>{
    if(StartdateInputRef){
   StartdateInputRef.current.showPicker?.()
   StartdateInputRef.current.click?.()
  }
}
  return (
    <>
      {/* Button to open panel */}
      <div className="w-[90%] bg-[#343434] flex justify-between h-12">
        <button
          onClick={() => setAddhr((prev) => !prev)}
          className="flex space-x-2 justify-center items-center w-full h-full hover:bg-gray-700 duration-300 rounded cursor-pointer"
        >
          <FontAwesomeIcon
            className="text-lg text-[#168FF4]"
            icon={faPlus}
          />
          <h3 className="text-[#168FF4] text-md">
            Add Date-Specific Hours
          </h3>
        </button>
      </div>

      {/* Panel */}
      {addhr && (
        <div className="relative flex pt-3 w-85 h-full bg-[#343434] flex-col text-white rounded-md space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between w-full px-4">
            <button
              onClick={() => setShowCancel(true)}
              className="text-[#168FF4] font-light w-14 h-8 cursor-pointer"
            >
              Cancel
            </button>
            <h3 className="text-md font-light">Date Specific Hour</h3>
            <button
              onClick={() => setAddhr(false)}
              className="text-[#168FF4] font-light w-14 h-8 cursor-pointer"
            >
              Done
            </button>
          </div>

         
         {/* Start Date */}
        <div className="group w-full h-12 flex items-center justify-between bg-[#343434] border-t border-black hover:bg-[#323232] rounded">
          <label className="pl-4 text-white font-light">
            {startDateSpecefic || "Start Date"}
          </label>

          <div className="pl-4 h-full flex items-center">
            {/* Hidden input */}
            <input
              type="date"
              ref={StartdateInputRef}
              className="hidden"
              value={startDateSpecefic}
              onChange={(e)=> setstartDateSpecefic(e.target.value)}
            />

            {/* Trigger button */}
            <button type="button" onClick={handledateRef} className="cursor-pointer">
              <Calendar className="text-sm mr-4 text-[#168FF4]" />
            </button>
          </div>
        </div>

        {/* End Date */}
        <div className="group w-full h-12 flex items-center justify-between bg-[#343434] border-t border-b border-black hover:bg-[#323232] rounded">
          <label className="pl-4 text-white font-light">
            {EndDateSpecefic || "End Date"}
          </label>

          <div className="pl-4 h-full flex items-center">
            {/* Hidden input */}
            <input
              ref={EnddateInputRef}
              type="date"
              value={EndDateSpecefic}
              onChange={(e) => setEndDateSpecefic(e.target.value)}
              className="hidden"
            />

            {/* Trigger button */}
            <button type="button" onClick={handleEndRef} className="cursor-pointer">
              <Calendar className="text-sm mr-4 text-[#168FF4]" />
            </button>
          </div>
        </div>


          {/* Availability */}
          <div className="w-[90%] mt-4">
            <div className="flex flex-cols pl-4 items-center justify-center">
              <button className="w-[50%] h-8 border-r border-black text-white bg-[#168FF4] cursor-pointer">
                Unavailable
              </button>
              <button className="w-[50%] h-8 text-white bg-[#3C3C3C] cursor-pointer">
                Custom Hours
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4 space-y-2">
            <input
              className="w-[90%] ml-4 mt-3 bg-[#3C3C3C] h-12 outline-none px-4"
              placeholder="Description..."
              type="text"
            />
            <p className="text-[#8C8484] text-sm pl-4">
              Ex.: Christmas Holidays, Thanksgiving Day, Renovations etc.
            </p>
          </div>
        </div>
      )}

      {/* Cancel Popup Overlay */}
      {showCancel && (
        <div className="absolute fixed top-80 left-128  h-32 inset-0 z-50 ">
          <CancelPopUp
            onClose={() => setShowCancel(false)}
            onDiscard={() => {
              setShowCancel(false);
              setAddhr(false);
            }}
          />
        </div>
      )}
    </>
  );
};


// AvailableHrs 
export const AvailableHrs = ({ dayName, indx }) => {
  const { timeInfo, hadnleSideInfo } = useService();

  return (
    <div className="relative flex justify-between w-[90%] h-12 bg-[#343434] hover:bg-[#323232] cursor-pointer rounded-lg">
      <h1 className="text-md w-20 pl-4 text-white flex text-justify items-center font-light">
        {dayName}
      </h1>
      <button
        onClick={() => hadnleSideInfo(indx)}
        className="text-[#168FF4] font-light mr-3 cursor-pointer"
      >
        9:00 AM - 9:00 PM
        <FontAwesomeIcon
          icon={faCaretDown}
          className={`ml-2 transition-transform duration-300 ${
            timeInfo === indx
              ? "text-[#168FF4] rotate-90 scale-110 translate-x-2"
              : "text-gray-400"
          }`}
        />
      </button>
    </div>
  );
};
