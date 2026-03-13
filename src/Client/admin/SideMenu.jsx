import { NavLink } from "react-router-dom";

const SideMenu = ({ name, icon, path }) => {
  return (
    <div className="flex text-sm justify-center">
      <NavLink
        to={path}
        className={({ isActive }) =>
          ` group flex w-72 h-12 px-3 py-3 space-x-4  items-center
          transition-colors duration-200 rounded-md
          ${
            isActive
              ? "bg-[#F2E9E3] text-[#F99C30] font-bold"
              : "bg-inherit text-[#273240] hover:bg-[#F2E9E3] hover:text-orange-400"
          }
        `
        }
      >
        <div
          className={({
            isActive,
          }) => `flex-shrink-0  transform transition-transform duration-200 group-hover:scale-110
          
           ${isActive ? "text-[#273240]" : "text-[#A6ABC8]"}
          `}
        >
          {icon}
        </div>

        <h1 className="text-md">{name}</h1>
      </NavLink>
    </div>
  );
};

export default SideMenu;
