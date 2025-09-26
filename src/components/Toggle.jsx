import { useService } from "../Context/ServiceContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons";
const Toggle = ({name}) => {
    const { toggleOn, setToggleOn} = useService();
     const handleToggle = () => setToggleOn(prev => !prev);
  return (
     <div className="flex w-full justify-between">
        <h3 className="text-md w-64 text-left  text-white flex justify-center items-center font-semibold">
              {name}
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
  )
}

export default Toggle