import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SideIcons = ({ icons, name ,action}) => { 
    
  return (
    <div className="">
      <div className="flex h-[62px] flex-col justify-center items-center text-white rounded-md space-y-1"> 
          <div className="w-full h-full">
             <button onClick={action} className="w-full h-full cursor-pointer hover:bg-[#545151] duration-300">
            <FontAwesomeIcon className="text-xl" icon={icons} />
        <p className="text-sm">{name}</p>
        </button>
          </div>
                         
     </div>
    </div>
  );

};

export default SideIcons