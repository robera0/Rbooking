import { House, Drum, Box, Trophy } from "lucide-react";

import { useNavigate } from "react-router-dom";

const Main = ({ childern }) => {
  const navigate = useNavigate();
  const MenuBar = ({ name, icon, action }) => {
    return (
      <button
        onClick={action}
        className="group flex w-42 items-center space-x-2 px-4 py-2 rounded-md  hover:bg-white duration-300"
      >
        {icon}

        <span className="text-white group-hover:text-[#FF7800] font-semibold">
          {name}
        </span>
      </button>
    );
  };

  return (
    <>
      <div className="relative flex space-x-4">
        {/*LEFT SIDE (MENU ) */}
        <div className=" absolute flex flex-col justify-center items-center  h-130 w-130 -left-52 -top-22  pl-20 bg-[#FF7800] space-y-4 rounded-full ">
          <div className="w-full h-12 ">
            <h1 className="ml-36 pb-26 font-irish font-semibold text-white text-3xl">
              Time Event
            </h1>
          </div>

          <div className=" pl-4 space-y-3">
            <MenuBar
              name="home"
              icon={
                <House className="text-white  group-hover:text-[#FF7800]" />
              }
              action={() => navigate("/event_home")}
            />
            <MenuBar
              name="concert"
              icon={<Drum className="text-white  group-hover:text-[#FF7800]" />}
              action={() => navigate("/event_concerts")}
            />

            <MenuBar
              name="Exhibition"
              icon={<Box className="text-white  group-hover:text-[#FF7800]" />}
              action={() => navigate("/event_exhibition")}
            />

            <MenuBar
              name="Sports"
              icon={
                <Trophy className="text-white  group-hover:text-[#FF7800]" />
              }
              action={() => navigate("//event_sports")}
            />
          </div>
        </div>
        {/*RIGHT SIDE (DATE PICKER) */}
        <div className="flex-1 h-108 flex justify-center items-center space-x-8 ">
          {/**DATE */}
          <div className="w-80 bg-[#D9D9D9] h-22  rounded-lg"></div>
          {/*SEARCH */}
          <div className="w-120 bg-[#D9D9D9] h-22  rounded-lg"></div>
        </div>
      </div>

      <div>{childern}</div>
    </>
  );
};

export default Main;
