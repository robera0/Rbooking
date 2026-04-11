import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Listbox } from "@headlessui/react";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
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
  Bell,
  X,
  MessageCircleMore,
} from "lucide-react";
import { useState } from "react";
import { Skeleton } from "boneyard-js/react";
import { eventService } from "@/Context/ApiEvent";
import { Navigate, useLocation } from "react-router-dom";
import { useService } from "@/Context/ServiceContext";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const ProtectedRoute = ({ children }) => {
  const { usererror, userIsLoading, user } = eventService();
  const location = useLocation();

  // 1. Loading State (Modern Backdrop)
  if (userIsLoading) {
    return (
      <div className="fixed inset-0 bg-[#121417] z-[100] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative flex items-center justify-center">
            {/* Outer Rotating Ring */}
            <div className="w-16 h-16 border-2 border-white/[0.05] border-t-[#FF7A00] rounded-full animate-spin" />
            {/* Inner Static Icon */}
            <Loader2
              className="absolute text-[#FF7A00] animate-pulse"
              size={20}
            />
          </div>

          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">
            Verifying Session
          </span>
        </motion.div>
      </div>
    );
  }

  // 2. Redirect to Login if no user or error occurs
  if (!user || usererror) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authorized Access
  return children;
};

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

export default function CheckoutModal({
  isOpen,
  onClose,
  amount = 400,
  name,
  action,
}) {
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState(null);
  const { quantity, setQuantity } = useService();

  const paymentMethods = [
    { id: "telebirr", name: "Telebirr" },
    { id: "cbe", name: "CBE Birr" },
    { id: "boa", name: "Bank of Abyssinia" },
    { id: "awash", name: "Awash Bank" },
  ];

  const totalAmount = amount * quantity;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="relative w-[90%] max-w-[420px] rounded-3xl p-8
            bg-gradient-to-br from-[#1E1F25] to-[#2B2E36]
            border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-white"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-lg text-gray-300 tracking-wide">
                Secure Checkout
              </h2>
              <h3 className="text-2xl font-semibold mt-1">{name}</h3>
            </div>

            {/* Phone Input */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/30 border border-white/10
                focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30
                transition rounded-xl px-4 py-3 outline-none"
              />
            </div>

            {/* Quantity Input */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Quantity
              </label>

              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
                className="w-full bg-black/30 border border-white/10
                focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30
                transition rounded-xl px-4 py-3 outline-none"
              />
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelected(method.id)}
                  className={`relative rounded-2xl p-4 text-sm font-medium
                  border transition-all duration-300
                  ${
                    selected === method.id
                      ? "bg-orange-500/10 border-orange-500 shadow-lg scale-[1.03]"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {method.name}
                </button>
              ))}
            </div>

            {/* Pay Button */}
            <button
              onClick={action}
              className="w-full py-3 rounded-2xl font-semibold text-lg
              bg-[#FF9A41]
              hover:scale-[1.02] active:scale-[0.98]
              transition duration-200 shadow-lg shadow-orange-500/30"
            >
              Pay {totalAmount.toLocaleString()} ETB
            </button>

            {/* Cancel */}
            <button
              onClick={onClose}
              className="w-full mt-4 text-gray-400 hover:text-white text-sm transition"
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      )}
    </>
  );
}
export const MenuBar = ({ icon, header, path }) => {
  const location = useLocation();
  // Improved matching logic to handle root and nested paths correctly
  const isActive = location.pathname.split("/")[1] === path.replace("/", "");

  return (
    <Link
      to={path}
      className="flex flex-col items-center justify-center gap-1 group transition-all duration-300"
    >
      {/* Icon Container */}
      <div
        className={`transition-colors duration-300 ${
          isActive ? "text-[#FF7800]" : "text-gray-400 group-hover:text-white"
        }`}
      >
        {/* Clone the icon to apply sizing if it's a Lucide component */}
        {React.cloneElement(icon, {
          size: 20,
          strokeWidth: isActive ? 2.5 : 2,
          fill: isActive ? "currentColor" : "none", // Only if you want filled icons like the screenshot
        })}
      </div>

      {/* Label */}
      <span
        className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${
          isActive
            ? "text-[#FF7800]"
            : "text-gray-500 group-hover:text-gray-300"
        }`}
      >
        {header}
      </span>
    </Link>
  );
};
export const WindowMenuBar = ({ icon, header, path }) => {
  const location = useLocation();
  const isActive = location.pathname.split("/")[1] == path.replace("/", "");
  return (
    <>
      <Link
        to={path}
        className="flex  w-full justify-center items-center text-white space-x-3"
      >
        <span className={`${isActive && "text-[#FF7800]"} `}>{icon}</span>

        <span className={`${isActive && "text-[#FF7800]"} text-center`}>
          {header}
        </span>
      </Link>
    </>
  );
};
export const InfoBar = ({ icon, header, bg, des }) => {
  const loading = !header || !des;
  if (loading) {
    return (
      <div className="w-full lg:space-y-6 space-y-2">
        <Skeleton name="blog-card" loading={true} />
      </div>
    );
  }
  return (
    <div className="w-full lg:space-y-6 space-y-2">
      <div
        className={`${bg} h-14 w-14 lg:w-20 lg:h-20 rounded-full flex items-center justify-center shadow-md`}
      >
        {icon}
      </div>
      <div className="">
        <h1 className="text-white font-semibold text-lg lg:text-xl ">
          {header}
        </h1>
        <p className="text-[#A1A1A1] text-sm lg:text-lg leading-relaxed w-[90%]">
          {des}
        </p>
      </div>
    </div>
  );
};

export const RatingStars = () => {
  // Simulate a loading prop or data presence check as needed
  const loading = false; // Replace with actual loading logic if available
  if (loading) {
    return (
      <div className="flex space-x-1 ">
        <Skeleton name="blog-card" loading={true} />
      </div>
    );
  }
  return (
    <div className="flex space-x-1 ">
      {Array(5)
        .fill()
        .map((_, idx) => (
          <div className="" key={idx}>
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
  const { userProfile } = eventService();
  return (
    <div className=" flex  justify-center  ">
      <div className="w-[85%] bg-[#2A2C31]  rounded-md">
        <div className="flex justify-center h-52 pt-8">
          <div className="w-full flex flex-col items-center space-y-2">
            <div>
              <img
                src={userProfile?.user?.avatarUrl || "/Login.jpg"}
                alt="Profile"
                className="w-24 h-24 object-cover rounded-full"
              />
            </div>

            <div className="w-full flex flex-col items-center text-center">
              <h3 className="text-lg font-semibold text-white">
                {userProfile?.user?.fullName}
              </h3>
              <p className="text-sm text-gray-400">
                {" "}
                {userProfile?.user?.userId?.email}
              </p>
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

export const NotificationSidebar = ({ setIsOpen }) => {
  const notifications = [
    {
      id: 1,
      title: "New Message",
      description: "You have received a new message.",
    },
    {
      id: 2,
      title: "Order Update",
      description: "Your order #1234 has shipped.",
    },
    {
      id: 3,
      title: "Friend Request",
      description: "John Doe sent you a friend request.",
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case "ticket":
        return <Ticket size={20} />;
      case "event":
        return <Calendar size={20} />;
      case "promo":
        return <Zap size={20} />;
      default:
        return <MessageCircleMore size={20} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#121417] text-white">
      {/* Header: High Contrast & Branded */}
      <div className="flex justify-between items-center px-6 py-8 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <Bell className="text-[#FF7A00]" size={20} strokeWidth={3} />
          <h2 className="text-xl font-black uppercase italic tracking-tighter">
            Updates
          </h2>
          <span className="bg-[#FF7A00] text-black text-[10px] font-black px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
        >
          <X size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto custom-scrollbar flex-1">
        {notifications.length > 0 ? (
          <div className="divide-y divide-white/[0.03]">
            {notifications.map((note, index) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={note.id}
                className="group relative flex gap-4 p-6 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                {/* Status Indicator Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FF7A00] opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Icon Container */}
                <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1C1F22] border border-white/[0.08] text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-black transition-all">
                  {getIcon(note.type)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black uppercase italic text-sm tracking-tight leading-none">
                      {note.title}
                    </h4>
                    <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">
                      {note.time || "Just Now"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs font-medium leading-relaxed">
                    {note.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#1C1F22] flex items-center justify-center border border-white/[0.05]">
              <Bell className="text-gray-800" size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">
              No new alerts
            </p>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-6 border-t border-white/[0.04] bg-[#0D0F11]">
        <button className="w-full py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          Mark all as read
        </button>
      </div>
    </div>
  );
};
