import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Listbox } from "@headlessui/react";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import {
  Star,
  CircleUser,
  Ticket,
  LogOut,
  Settings,
  CreditCard,
  Heart,
  ToggleRightIcon,
  CheckCheck,
  ChevronDown,
  Search,
} from "lucide-react";
import { useState } from "react";
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

export const MenuBar = ({ icon, header, path }) => {
  const location = useLocation();
  const isActive = location.pathname.split("/")[1] == path.replace("/", "");
  return (
    <>
      <Link
        to={path}
        className="flex flex-col w-full justify-center items-center text-white space-y-1"
      >
        <span className={`${isActive && "text-[#FF7800]"}`}>{icon}</span>

        <span className={`${isActive && "text-[#FF7800]"} text-center`}>
          {header}
        </span>
      </Link>
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

export const RatingStars = () => {
  return (
    <div className="flex space-x-1 ">
      {Array(5)
        .fill()
        .map((_, idx) => (
          <div className="">
            <span>
              <Star fill="#FF7800" className="text-[#FF7800]" />
            </span>
          </div>
        ))}
    </div>
  );
};

export const AccountMenu = ({ icon, header, path, action }) => {
  const location = useLocation();
  const isActive = location.pathname == path;
  return (
    <>
      <Link
        onClick={action}
        to={path}
        className={`flex px-4 py-2 w-[90%]  text-lg  ml-4 items-center  text-white space-x-3 rounded-md
          
          ${isActive && "bg-[#FF9D46]/20 "}`}
      >
        <span className={`${isActive && "font-semibold  text-[#FF8D28]"}`}>
          {icon}
        </span>

        <span
          className={`${
            isActive && "font-semibold  text-[#FF8D28]"
          } text-center`}
        >
          {header}
        </span>
      </Link>
    </>
  );
};

export const AccountSideMenu = () => {
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <div className=" flex  justify-center  ">
      <div className="w-[85%] bg-[#2A2C31]  rounded-md">
        <div className="flex justify-center h-52 pt-8">
          <div className="w-full flex flex-col items-center space-y-2">
            <div>
              <img
                src="/Login.jpg"
                alt="Profile"
                className="w-24 h-24 object-cover rounded-full"
              />
            </div>

            <div className="w-full flex flex-col items-center text-center">
              <h3 className="text-lg font-semibold text-white">
                Robera Ararsa
              </h3>
              <p className="text-sm text-gray-400">hello@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="w-full h-[0.3px] bg-gray-600"></div>
        <div className="lg:hidden w-[85%] h-[450px] pt-8 space-y-4    ">
          <AccountMenu
            icon={<CircleUser />}
            header="My Profile"
            path={"/account"}
          />
          <AccountMenu
            icon={<Ticket />}
            header="My Ticket"
            path={"/tickets_home"}
          />
          <AccountMenu
            icon={<CreditCard />}
            header="Payment Detail"
            path={"/account/payment_detail"}
          />
          <AccountMenu
            icon={<Heart />}
            header="Wishlist"
            path={"/account/favorites"}
          />{" "}
          <AccountMenu
            icon={<Settings />}
            header="Setting"
            path={"/account/setting"}
          />{" "}
          <AccountMenu
            action={handleLogout}
            icon={<LogOut className="text-red-600" />}
            header="Sign Out"
            path={"/"}
          />
        </div>
      </div>
    </div>
  );
};

export const NotificationMenu = ({ info }) => {
  return (
    <>
      <div className="w-full flex items-center justify-between gap-4 py-2">
        <p className="text-md text-gray-400 leading-snug flex-1">{info}</p>

        <button
          type="button"
          className="flex items-center justify-center shrink-0 mr-4"
        >
          <ToggleRightIcon className="w-8 h-8 text-orange-500" />
        </button>
      </div>
    </>
  );
};

export const Amenities = ({ header, icon: Icon, lists }) => {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center text-white space-x-2">
          <span>
            <Icon className="flex w-5 h-5" />
          </span>
          <h1 className=" text-lg font-semibold">{header}</h1>
        </div>

        {/*LISTS */}

        {lists.map((list, _) => (
          <>
            <div className="flex items-center text-white space-x-2">
              <span>
                <CheckCheck className="flex text-[#14AE5C] w-5 h-5" />
              </span>
              <h1 className=" text-lg font-light">{list}</h1>
            </div>
          </>
        ))}
      </div>
    </>
  );
};

export const EventPolices = ({ header, des }) => {
  return (
    <div className="flex items-start gap-3 ">
      <CheckCheck className="w-5 h-5 text-[#14AE5C] mt-1 shrink-0" />

      <div className="space-y-1">
        <h2 className="text-white text-lg font-semibold">{header}</h2>
        <p className=" w-[90%]  text-sm text-gray-400 leading-relaxed">{des}</p>
      </div>
    </div>
  );
};

export const EditMenu = ({ header, options, placeholder }) => {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <div className="w-full pl-4 h-full ">
        <Listbox value={selected} onChange={setSelected}>
          <div className="relative w-full space-y-2">
            {/* Button */}
            <p className="text-[#808080] font-semibold">{header}</p>

            <Listbox.Button
              className="
                                relative w-full h-8 cursor-pointer
                                rounded-xl  rounded-lg
                                bg-[#202020] text-white px-4  py-7 text-md
                                flex items-center justify-between outline-none
                              "
            >
              <span>{selected ? selected.value : `${placeholder}`}</span>
              <ChevronDown className="mr-3 text-gray-400 text-center w-6 h-6" />
            </Listbox.Button>

            {/* Options */}
            <Listbox.Options
              className="
                                absolute z-10 mt-1 w-full
                                rounded-md bg-[#222529]
                                border border-gray-600/40
                                shadow-lg focus:outline-none
                              "
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.id}
                  value={option}
                  className={({ active }) =>
                    `
                                    cursor-pointer px-3 h-10
                                    flex items-center text-sm
                                    ${
                                      active
                                        ? "bg-orange-500 text-white"
                                        : "text-gray-200"
                                    }
                                    `
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between w-full">
                      <span className="mr-8">
                        {" "}
                        {selected && { option }?.value}
                      </span>
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
    </>
  );
};

export const EditMenuBar = () => {
  const LocationOptions = [
    { id: 1, label: 5, value: "5/5" },
    { id: 2, label: 5, value: "4/5" },
    { id: 3, label: 3, value: "3/5" },
    { id: 4, label: 2, value: "2/5" },
    { id: 4, label: 1, value: "1/5" },
    { id: 4, label: 0, value: "0/5" },
  ];

  return (
    <div className=" w-full h-full  flex flex-col justify-center items-center  bg-[#2A2C31] space-y-4   p-4">
      {/*LOCATION */}
      <EditMenu
        header={"Location"}
        options={LocationOptions}
        placeholder={"Select location"}
      />
      {/*DATE */}
      <EditMenu
        header={"Date"}
        options={LocationOptions}
        placeholder={"All dates"}
      />
      {/*CATEGORY */}
      <EditMenu
        header={"Category"}
        options={LocationOptions}
        placeholder={"Select category"}
      />

      <div className="flex  justify-center mb-4 mt-6">
        <button className="flex text-white  font-semibold bg-[#FF7800] px-8 py-2 rounded-md space-x-2 lg:cursor-pointer">
          <Search />
          <span>Search here</span>
        </button>
      </div>
    </div>
  );
};
