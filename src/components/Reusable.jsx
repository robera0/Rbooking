import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
export const Toggle = ({ name, toggle, toggleOn, action }) => {
  return (
    <div className="flex w-full justify-between">
      <h3 className="text-md w-64 text-left  text-white flex justify-center items-center font-semibold">
        {name}
      </h3>
      <button
        className="mr-4 cursor-pointer w-10"
        onClick={() => {
          if (action) action();
          if (toggle) toggle();
        }}
      >
        <FontAwesomeIcon
          className="text-3xl text-[#168FF4] transition ease-in-out duration-300"
          icon={toggleOn ? faToggleOn : faToggleOff}
        />
      </button>
    </div>
  );
};

export const MenuBar = ({ icon, header }) => {
  return (
    <>
      <button className="flex flex-col  w-full   items-center text-white  space-y-1">
        {icon}
        <span className="text-center">{header}</span>
      </button>
    </>
  );
};

export const InfoBar = ({ icon, header, bg, des }) => {
  return (
    <div className="w-full space-y-2">
      <div
        className={`${bg} h-14 w-14 rounded-full flex items-center justify-center shadow-md`}
      >
        {icon}
      </div>
      <div>
        <h1 className="text-white font-semibold text-lg">{header}</h1>
        <p className="text-[#A1A1A1] text-sm leading-relaxed w-[90%]">{des}</p>
      </div>
    </div>
  );
};
