import { NavLink } from "react-router-dom";

const SideMenu = ({ name, icon, path, isDanger }) => {
  return (
    <div className="w-full">
      <NavLink
        to={path}
        className={({ isActive }) =>
          `group flex w-full h-12 md:h-14 px-4 space-x-4 items-center transition-all duration-300 rounded-[1.2rem]
          ${
            isActive
              ? "bg-[#FF7A00] text-black shadow-xl shadow-[#FF7A00]/20"
              : isDanger 
                ? "bg-transparent text-gray-400 hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/20" 
                : "bg-transparent text-gray-400 hover:bg-white/[0.04] hover:text-white border border-transparent hover:border-white/[0.04]"
          }
        `
        }
      >
        <div
          className={({ isActive }) => 
            `flex-shrink-0 transition-transform duration-300 group-hover:scale-110
            ${isActive ? "text-black" : isDanger ? "text-red-400 group-hover:text-red-500" : "text-gray-500 group-hover:text-[#FF7A00]"}
          `}
        >
          {icon}
        </div>

        <h1 className={`text-xs md:text-sm font-bold tracking-wide ${isDanger ? 'uppercase text-[10px] tracking-[0.1em]' : ''}`}>{name}</h1>
      </NavLink>
    </div>
  );
};

export default SideMenu;
