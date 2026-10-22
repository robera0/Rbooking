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
  Calendar,
  Zap,
  ToggleRightIcon,
  CheckCheck,
  ChevronDown,
  Search,
  Bell,
  X,
  ChevronRight,
  MessageCircleMore,
  MapPin,
  User,
  Crown,
  Users,
  Sparkles,
  XCircle,
  Award,
  Gem,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { Skeleton } from "boneyard-js/react";
import { eventService } from "@/Context/ApiEvent";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useService } from "@/Context/ServiceContext";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import "react-loading-skeleton/dist/skeleton.css";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/Context/api/api.config";
export const ProtectedRoute = ({ children }) => {
  const { usererror, user, isUserLoading, isUserFetching } = eventService();
  const location = useLocation();

  if (isUserLoading || isUserFetching) {
    // still loading
    return (
      <div className="fixed inset-0 bg-[#121417] z-[100] flex flex-col items-center justify-center">
        {/* your loading spinner */}
      </div>
    );
  }

  if (!user || usererror) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/home" replace />;
  }

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
  eventId,
  ticketId,
  paymentMethods = [],
}) {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quantityStr, setQuantityStr] = useState("1");
  const { setQuantity, API_URL } = useService();
  const navigate = useNavigate();

  const isFree = Number(amount) === 0;
  const MAX_FREE_QUANTITY = 4;
  const quantity = Math.min(
    isFree ? MAX_FREE_QUANTITY : Infinity,
    Math.max(1, parseInt(quantityStr) || 1),
  );

  const totalAmount = amount * quantity;

  const copyNumberToClipboard = async (num) => {
    try {
      await navigator.clipboard.writeText(num);
      import("react-hot-toast").then(({ default: toast }) =>
        toast.success(`Copied ${num} to clipboard!`),
      );
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = num;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      import("react-hot-toast").then(({ default: toast }) =>
        toast.success(`Copied ${num} to clipboard!`),
      );
    }
  };

  const handleConfirmAndPay = async () => {
    if (!phone || !phone.trim()) {
      const { default: toast } = await import("react-hot-toast");
      toast.error("Please enter your phone number to complete the purchase.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post(`/api/auth/ticket/${ticketId}/purchase`, {
        quantity,
        phone,
      });
      const data = res.data;

      if (totalAmount === 0) {
        const { default: toast } = await import("react-hot-toast");
        toast.success("Your free ticket is acquired successfully!", {
          duration: 4000,
        });

        navigate(
          eventId
            ? `/tickets_home/${eventId}/${data.userTicket._id}`
            : `/tickets_home/${data.userTicket._id}`,
        );
      } else {
        const { default: toast } = await import("react-hot-toast");
        toast.success(
          "Your ticket is successfully held! Please complete your payment.",
          { duration: 9000 },
        );

        navigate(`/tickets_home/verify/${data.userTicket._id}`, {
          state: {
            orderNo: data.userTicket.orderNo,
            eventName: name,
            eventId,
            totalAmount,
            quantity,
          },
        });
      }
      onClose();
    } catch (error) {
      const message =
        (error?.response?.status < 500 && error?.response?.data?.message) ||
        error.message ||
        "Purchase failed. Please try again.";
      import("react-hot-toast").then(({ default: toast }) =>
        toast.error(message),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div
        className="relative w-full max-w-[440px] rounded-[2.5rem] p-10 -mt-16
        bg-[#0A0A0B] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] 
        text-[#F4F4F5] overflow-hidden"
      >
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF7A00]/10 blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
              Checkout
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase italic">
              {name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Fields Container */}
        <div className="space-y-6 mb-10">
          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold z-10 pointer-events-none">
                +251
              </span>
              <input
                type="tel"
                placeholder="9xx xxx xxxx"
                value={phone.replace(/^\+251/, "")}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setPhone(val ? `+251${val}` : "");
                }}
                className="w-full bg-white/[0.03] border border-white/10 focus:border-[#FF7A00] 
                transition-all rounded-2xl pl-[68px] pr-5 py-4 outline-none font-bold text-lg tracking-tight"
              />
            </div>
          </div>

          {/* Quantity and Price Display */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Tickets
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={quantityStr}
                onChange={(e) => {
                  const val = e.target.value;
                  // allow empty string while typing, digits only
                  if (val === "" || /^[0-9]+$/.test(val)) {
                    setQuantityStr(val);
                    setQuantity(Math.max(1, parseInt(val) || 1));
                  }
                }}
                onBlur={() => {
                  // normalize on blur so it never stays blank
                  const clamped = Math.max(1, parseInt(quantityStr) || 1);
                  setQuantityStr(String(clamped));
                  setQuantity(clamped);
                }}
                className="w-full bg-white/[0.03] border border-white/10 focus:border-[#FF7A00] 
                rounded-2xl px-5 py-4 outline-none font-bold text-center no-spinner"
              />
            </div>
            <div className="flex-[2] space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                Price
              </label>
              <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl px-5 py-4 font-black italic text-gray-400">
                {isFree ? "Free" : `${amount} ETB`}
              </div>
            </div>
          </div>
        </div>

        {!isFree && (
          <>
        {/* Payment Methods */}
        <div className="space-y-3 mb-10 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
            Payment Options
          </p>
          <div className="flex flex-col gap-3">
            {paymentMethods && paymentMethods.length > 0 ? (
              paymentMethods.map((method, idx) => (
                <div
                  key={idx}
                  onClick={() => copyNumberToClipboard(method.accountNumber)}
                  className="group relative rounded-2xl py-4 px-5 border border-[#FF7A00]/30 bg-[#FF7A00]/[0.06] cursor-pointer hover:bg-[#FF7A00]/[0.12] transition-all flex-shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FF7A00]">
                        {method.provider} Number
                      </p>
                      <p className="text-xl font-black tracking-wider text-white font-mono">
                        {method.accountNumber}
                      </p>

                      <p className="text-xl font-black tracking-wider text-white font-mono">
                        {method.receiverName?.split(" ")[0]}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Copy size={16} className="text-[#FF7A00]" />
                      <span className="text-[7px] font-black uppercase tracking-wider text-gray-500">
                        Tap to copy
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm font-bold text-gray-500 italic">
                  The organizer hasn't set up any payment methods yet.
                </p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-gray-600 text-center mt-2">
            Send{" "}
            <span className="text-[#FF7A00] font-bold">
              {totalAmount.toLocaleString()} ETB
            </span>{" "}
            to one of the accounts above, then verify your receipt
          </p>
        </div>

          </>
        )}

        {/* Final Execution Button */}
        <div className="space-y-4">
          <button
            onClick={handleConfirmAndPay}
            disabled={isLoading}
            className="group w-full py-5 bg-[#FF7A00] text-black font-black uppercase italic text-sm 
            rounded-[1.2rem] flex items-center justify-center gap-3 hover:bg-white transition-all 
            shadow-[0_10px_30px_rgba(255,122,0,0.15)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {isFree
                  ? "GET FREE TICKET"
                  : `CONFIRM & PAY ${totalAmount.toLocaleString()} ETB`}
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export const MenuBar = ({ icon, header, path, onClick }) => {
  const location = useLocation();
  // Improved matching logic to handle root and nested paths correctly
  const isActive = path
    ? location.pathname.split("/")[1] === path.replace("/", "")
    : false;

  const content = (
    <div className="flex flex-col items-center justify-center gap-1 group transition-all duration-300">
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
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="outline-none focus:outline-none">
        {content}
      </button>
    );
  }

  return (
    <Link to={path} className="outline-none">
      {content}
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

export const AccountSideMenu = ({ setIsOpen, minimal = false }) => {
  const { API_URL } = useService();
  const { user, userProfile, tickets, wishlist } = eventService();
  const location = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await api.post(`/api/auth/logout`, {});
      queryClient.clear();
      setIsOpen(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const ticketCount = tickets?.events?.length ?? 0;
  const savedCount = wishlist?.wishlist?.items?.length ?? 0;

  const avatarSrc = userProfile?.user?.avatarUrl
    ? userProfile.user.avatarUrl.startsWith("http")
      ? userProfile.user.avatarUrl
      : `${API_URL}/${userProfile.user.avatarUrl}`
    : "/defaultAvater.jpg";

  const displayName =
    userProfile?.user?.fullName ||
    user?.fullName ||
    user?.name ||
    "Verified user";
  const email = userProfile?.user?.userId?.email || user?.email || "";

  const allItems = [
    {
      icon: <CircleUser size={18} />,
      label: "My profile",
      path: "/account",
    },
    {
      icon: <Ticket size={18} />,
      label: "My tickets",
      path: "/tickets_home",
    },
    {
      icon: <Heart size={18} />,
      label: "Wishlist",
      path: "/account/favorites",
    },
    {
      icon: <MapPin size={18} />,
      label: "Venues",
      path: "/venues",
    },
    {
      icon: <Search size={18} />,
      label: "Explore",
      path: "/event",
    },
  ];

  // Navigation items shown when not logged in
  const guestNavItems = [
    {
      icon: <Search size={18} />,
      label: "Explore",
      path: "/event",
    },
    {
      icon: <MapPin size={18} />,
      label: "Venues",
      path: "/venues",
    },
    {
      icon: <User size={18} />,
      label: "Artists",
      path: "/artists",
    },
  ];

  const menuItems = !user
    ? guestNavItems
    : minimal
      ? allItems.filter((item) =>
          ["My tickets", "Wishlist"].includes(item.label),
        )
      : allItems;

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`);

  const listMotion = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.055, delayChildren: 0.08 },
    },
  };

  const itemMotion = {
    hidden: { opacity: 0, x: -18 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 380, damping: 30 },
    },
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0E1012]">
      {/* Ambient orange glow */}
      <div className="pointer-events-none absolute -left-24 -top-28 h-64 w-64 rounded-full bg-[#FF7A00]/20 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-64 w-64 rounded-full bg-[#FF7A00]/[0.08] blur-[90px]" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5">
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2.5"
        >
          <img src="/P_logo.png" alt="" className="h-7 w-7 object-contain" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
            Menu
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-gray-400 transition hover:rotate-90 hover:border-white/20 hover:text-white active:scale-90"
        >
          <X size={16} />
        </button>
      </div>

      {minimal ? (
        <p className="px-6 pt-5 text-[9px] font-bold uppercase tracking-[0.34em] text-gray-600">
          Quick access
        </p>
      ) : user ? (
        <>
          {/* Profile card */}
          <div className="relative z-10 mt-4 px-5">
            <Link
              to="/account"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-4 rounded-[1.6rem] border border-white/[0.07] bg-white/[0.03] p-3.5 transition hover:border-[#FF7A00]/40 hover:bg-white/[0.05]"
            >
              <span className="relative shrink-0">
                <span className="absolute -inset-[2px] rounded-[1.25rem] bg-gradient-to-br from-[#FF7A00] via-[#FF7A00]/40 to-transparent opacity-70 blur-[1px] transition group-hover:opacity-100" />
                <img
                  src={avatarSrc}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/defaultAvater.jpg";
                  }}
                  className="relative h-12 w-12 rounded-[1rem] border border-black/40 object-cover"
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                  {email}
                </p>
              </div>

              <ChevronRight
                size={15}
                className="shrink-0 text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-[#FF7A00]"
              />
            </Link>
          </div>

          {/* Quick stats */}
          <div className="relative z-10 mt-2.5 grid grid-cols-2 gap-2 px-5">
            <Link
              to="/tickets_home"
              onClick={() => setIsOpen(false)}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:border-[#FF7A00]/30 hover:bg-white/[0.04]"
            >
              <Ticket size={14} className="text-[#FF7A00]" />
              <p className="mt-1.5 text-base font-semibold leading-none text-white">
                {ticketCount}
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Tickets
              </p>
            </Link>

            <Link
              to="/account/favorites"
              onClick={() => setIsOpen(false)}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-[#FF7A00]/30 hover:bg-white/[0.04]"
            >
              <Heart size={14} className="text-[#FF7A00]" />
              <p className="mt-2 text-lg font-semibold leading-none text-white">
                {savedCount}
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Saved
              </p>
            </Link>
          </div>
        </>
      ) : (
        <div className="relative z-10 mt-6 px-5">
          <div className="rounded-[1.6rem] border border-white/[0.07] bg-gradient-to-br from-[#FF7A00]/15 to-transparent p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#FF7A00]">
              Welcome
            </p>
            <p className="mt-2 text-base font-semibold leading-snug text-white">
              Sign in to save events and collect tickets.
            </p>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#FF7A00] text-[10px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <motion.nav
        variants={listMotion}
        initial="hidden"
        animate="show"
        className="relative z-10 mt-4 flex-1 overflow-y-auto px-4 pb-2"
      >
        <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600">
          {user ? "Your account" : "Explore Paysso"}
        </p>

        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <motion.div key={item.path} variants={itemMotion}>
              <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`group relative mb-0.5 flex items-center gap-3.5 rounded-2xl px-3 py-2 transition-colors ${
                  active
                    ? "bg-[#FF7A00]/10 text-white"
                    : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-[#FF7A00]" />
                )}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    active
                      ? "bg-[#FF7A00] text-black"
                      : "bg-white/[0.04] text-gray-500 group-hover:text-[#FF7A00]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-[13px] font-semibold">{item.label}</span>
                <ChevronRight
                  size={14}
                  className="ml-auto text-gray-700 transition group-hover:translate-x-0.5 group-hover:text-[#FF7A00]"
                />
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* Footer */}
      {!minimal && (
        <div className="relative z-10 border-t border-white/[0.06] px-4 py-3">
          {user ? (
            <>
              <button
                onClick={handleLogout}
                className="group flex w-full items-center gap-3.5 rounded-2xl px-3 py-2.5 text-red-400/80 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 transition group-hover:bg-red-500/20">
                  <LogOut size={16} />
                </span>
                <span className="text-[13px] font-semibold">Sign out</span>
              </button>
              <p className="mt-2 text-center text-[9px] uppercase tracking-[0.28em] text-gray-700">
                Paysso · Addis Ababa
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block h-11 w-full rounded-xl bg-[#FF7A00] text-center text-[10px] font-bold uppercase leading-[2.75rem] tracking-[0.2em] text-black transition hover:bg-white"
              >
                Sign in
              </Link>
              <Link
                to="/sign_up"
                onClick={() => setIsOpen(false)}
                className="block h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] text-center text-[10px] font-bold uppercase leading-[2.75rem] tracking-[0.2em] text-white transition hover:bg-white/10"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* Animated drawer shell shared by the storefront header and the account page.
   The panel springs in from the left and a light sheen sweeps across it once,
   while the menu content staggers itself in. */
export const SideMenuPanel = ({ setIsOpen, minimal = false }) => {
  if (minimal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="absolute right-6 top-20 w-72 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0E1012]/95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
      >
        <AccountSideMenu setIsOpen={setIsOpen} minimal />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.85 }}
      className="absolute left-0 top-0 h-full w-[88%] max-w-[380px] overflow-hidden rounded-r-[2rem] border-r border-white/[0.07] bg-[#0E1012] shadow-[30px_0_80px_rgba(0,0,0,0.65)]"
    >
      <AccountSideMenu setIsOpen={setIsOpen} />
      <motion.div
        initial={{ x: "-140%" }}
        animate={{ x: "140%" }}
        transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.12 }}
        className="pointer-events-none absolute inset-y-0 z-30 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
      />
    </motion.div>
  );
};

export const NotificationMenu = ({ info }) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="w-full flex items-center justify-between gap-6 py-5 px-2 group transition-all">
      <p className="text-xs font-semibold text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors flex-1">
        {info}
      </p>

      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? "bg-[#FF7A00]" : "bg-white/10"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
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
                      <span className="mr-8">{option.value}</span>
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
  const {
    notifications,
    notificationIsError,
    notificationError,
    readNotification,
  } = eventService();
  const { titles } = useService();

  const getIcon = (type) => {
    switch (type) {
      case "Booking":
        return <Ticket size={20} />;
      case "event":
        return <Calendar size={20} />;
      case "payment":
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
            {notifications?.length}
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
        {notifications?.length > 0 ? (
          <div className="divide-y divide-white/[0.03]">
            {notifications?.notifications?.map(
              (note, index) =>
                !note?.read && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={note?._id}
                    onClick={(e) => {
                      e.preventDefault();
                      readNotification(note?._id);
                      console.log(note?._id);
                    }}
                    className="group relative flex gap-4 p-6 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    {/* Status Indicator Bar */}

                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FF7A00] opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Icon Container */}
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1C1F22] border border-white/[0.08] text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-black transition-all">
                      {getIcon(note?.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold uppercase   text-sm tracking-tight leading-none">
                          {titles[note?.type]}
                        </h4>

                        <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">
                          {formatDistanceToNow(new Date(note?.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs font-medium leading-relaxed">
                        {note?.message}
                      </p>
                    </div>
                  </motion.div>
                ),
            )}
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

// TicketTableSkeleton

const ROW_VARIANTS = [
  { name: "w-24", email: "w-36", value: "w-14", badge: "w-20" },
  { name: "w-20", email: "w-40", value: "w-10", badge: "w-16" },
  { name: "w-28", email: "w-32", value: "w-16", badge: "w-24" },
  { name: "w-24", email: "w-44", value: "w-12", badge: "w-20" },
  { name: "w-22", email: "w-36", value: "w-14", badge: "w-18" },
];

export const renderTableSkeleton = (rowCount = 5) => {
  return Array.from({ length: rowCount }).map((_, i) => {
    const variant = ROW_VARIANTS[i % ROW_VARIANTS.length];

    return (
      <tr
        key={i}
        className="border-b border-zinc-200 dark:border-zinc-800 animate-pulse"
      >
        {/* Column 1: User Profile */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex-shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-2">
              <div
                className={`h-4 ${variant.name} rounded bg-zinc-200 dark:bg-zinc-800`}
              />
              <div className="h-3 w-10 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </td>

        {/* Column 2: Email */}
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div
              className={`h-4 ${variant.email} rounded bg-zinc-200 dark:bg-zinc-800`}
            />
            <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </td>

        {/* Column 3: Status */}
        <td className="px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <div className="h-3.5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </td>

        {/* Column 4: Value */}
        <td className="px-6 py-4">
          <div
            className={`h-[18px] ${variant.value} mx-auto rounded bg-zinc-200 dark:bg-zinc-800`}
          />
        </td>

        {/* Column 5: Team Avatars */}
        <td className="px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex -space-x-1.5">
              <div className="h-5 w-5 rounded-full border border-white bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-800" />
              <div className="h-5 w-5 rounded-full border border-white bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-800" />
              <div className="h-5 w-5 rounded-full border border-white bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-800" />
            </div>
          </div>
        </td>

        {/* Column 6: Badge */}
        <td className="px-6 py-4">
          <div
            className={`h-[26px] ${variant.badge} mx-auto rounded-full bg-zinc-200/60 dark:bg-zinc-800/60`}
          />
        </td>

        {/* Column 7: Actions */}
        <td className="px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-7 w-7 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-7 w-7 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </td>
      </tr>
    );
  });
};

// AdminViewTicketSkeleton.jsx
export const AdminViewTicketSkeleton = () => {
  const Bone = ({ className }) => (
    <div className={`bg-white/[0.06] rounded-lg animate-pulse ${className}`} />
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left — Transaction Record (spans 2 columns) */}
      <div className="lg:col-span-2 space-y-8">
        <div className="rounded-[2rem] bg-[#1C1F22] border border-white/[0.04] overflow-hidden shadow-2xl">
          {/* Card header */}
          <div className="px-8 py-6 border-b border-white/[0.04]">
            <Bone className="h-5 w-48" />
          </div>

          {/* Detail grid */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Bone className="h-3 w-24" />
                <Bone className="h-4 w-40" />
              </div>
            ))}
          </div>

          {/* Financials footer */}
          <div className="bg-[#151719] p-8 border-t border-white/[0.04] space-y-5">
            <div className="flex justify-between items-center">
              <Bone className="h-4 w-40" />
              <Bone className="h-4 w-20" />
            </div>
            <div className="flex justify-between items-center">
              <Bone className="h-4 w-20" />
              <Bone className="h-4 w-10" />
            </div>
            <div className="w-full border-t border-dashed border-white/[0.08]" />
            <div className="flex justify-between items-center">
              <Bone className="h-5 w-32" />
              <Bone className="h-8 w-28" />
            </div>
            <div className="flex justify-between items-center">
              <Bone className="h-3 w-44" />
              <Bone className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-8">
        {/* Customer card */}
        <div className="rounded-[2rem] bg-[#1C1F22] border border-white/[0.04] p-6 shadow-xl space-y-4">
          <Bone className="h-3 w-32" />
          <Bone className="h-5 w-40" />
          <Bone className="h-4 w-48" />
        </div>

        {/* Event card */}
        <div className="rounded-[2rem] bg-[#1C1F22] border border-white/[0.04] p-6 shadow-xl space-y-4">
          <Bone className="h-3 w-36" />
          <Bone className="h-32 w-full rounded-xl" />
          <Bone className="h-5 w-36" />
          <Bone className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
};

export const ticketThemes = {
  standard: {
    bandGradient:
      "linear-gradient(120deg, #FF7A00 0%, #FF9D00 60%, #FFC347 100%)",
    ctaGradient:
      "linear-gradient(135deg, #FF7A00 0%, #FF9D00 50%, #FF7A00 100%)",
    accentColor: "#FF7A00",
    label: "Standard",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-800",
    labelBg: "bg-orange-100",
    icon: Users,
    iconColor: "text-orange-600",
    shadowColor: "rgba(255,122,0,0.20)",
    statusColor: "text-orange-800 bg-orange-100 border-orange-300",
  },
  regular: {
    bandGradient:
      "linear-gradient(120deg, #EAB308 0%, #FACC15 60%, #FDE047 100%)",
    ctaGradient:
      "linear-gradient(135deg, #EAB308 0%, #FACC15 50%, #EAB308 100%)",
    accentColor: "#FACC15",
    label: "Regular",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    labelBg: "bg-yellow-100",
    icon: Star,
    iconColor: "text-yellow-600",
    shadowColor: "rgba(234,179,8,0.20)",
    statusColor: "text-yellow-800 bg-yellow-100 border-yellow-300",
  },
  vip: {
    bandGradient:
      "linear-gradient(120deg, #FF6B00 0%, #FF8C00 60%, #FFB347 100%)",
    ctaGradient:
      "linear-gradient(135deg, #FF6B00 0%, #FF8C00 50%, #FF6B00 100%)",
    accentColor: "#FF8C00",
    label: "VIP",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    textColor: "text-amber-900",
    labelBg: "bg-amber-100",
    icon: Crown,
    iconColor: "text-amber-600",
    shadowColor: "rgba(255,107,0,0.25)",
    statusColor: "text-amber-800 bg-amber-100 border-amber-300",
  },
  vvip: {
    bandGradient:
      "linear-gradient(120deg, #CC5500 0%, #E67E22 60%, #F39C12 100%)",
    ctaGradient:
      "linear-gradient(135deg, #CC5500 0%, #E67E22 50%, #CC5500 100%)",
    accentColor: "#E67E22",
    label: "VVIP",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-400",
    textColor: "text-orange-900",
    labelBg: "bg-orange-200",
    icon: Sparkles,
    iconColor: "text-orange-700",
    shadowColor: "rgba(204,85,0,0.25)",
    statusColor: "text-orange-800 bg-orange-100 border-orange-300",
  },
  premium: {
    bandGradient:
      "linear-gradient(120deg, #9333EA 0%, #A855F7 60%, #C084FC 100%)",
    ctaGradient:
      "linear-gradient(135deg, #9333EA 0%, #A855F7 50%, #9333EA 100%)",
    accentColor: "#A855F7",
    label: "Premium",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    textColor: "text-purple-900",
    labelBg: "bg-purple-100",
    icon: Gem,
    iconColor: "text-purple-600",
    shadowColor: "rgba(147,51,234,0.20)",
    statusColor: "text-purple-800 bg-purple-100 border-purple-300",
  },
  soldout: {
    bandGradient:
      "linear-gradient(120deg, #DC2626 0%, #B91C1C 60%, #991B1B 100%)",
    ctaGradient: "linear-gradient(135deg, #444 0%, #333 50%, #222 100%)",
    accentColor: "#EF4444",
    label: "SOLD OUT",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    textColor: "text-red-800",
    labelBg: "bg-red-100",
    icon: XCircle,
    iconColor: "text-red-600",
    shadowColor: "rgba(220,38,38,0.20)",
    statusColor: "text-red-800 bg-red-100 border-red-300",
  },
};

// Helper function to get theme by ticket type
export const getTicketTheme = (ticketName) => {
  if (!ticketName) return ticketThemes.standard;

  const type = ticketName.toLowerCase();

  // Check if it's a valid theme key
  if (ticketThemes[type]) {
    return ticketThemes[type];
  }

  // Check if it contains certain keywords
  if (type.includes("vip") || type.includes("vvip")) {
    return type.includes("vvip") ? ticketThemes.vvip : ticketThemes.vip;
  }
  if (type.includes("premium")) {
    return ticketThemes.premium;
  }
  if (type.includes("regular")) {
    return ticketThemes.regular;
  }
  if (type.includes("sold") || type.includes("out")) {
    return ticketThemes.soldout;
  }

  return ticketThemes.standard;
};

// Helper function to get theme by event type
export const getEventTheme = (eventType) => {
  const type = eventType?.toLowerCase() || "";

  if (type.includes("concert") || type.includes("music")) {
    return ticketThemes.vip;
  }
  if (type.includes("sports") || type.includes("game")) {
    return ticketThemes.regular;
  }
  if (type.includes("conference") || type.includes("business")) {
    return ticketThemes.premium;
  }
  if (type.includes("festival") || type.includes("party")) {
    return ticketThemes.vvip;
  }

  return ticketThemes.standard;
};

// Reusable ticket components
export const TicketTypeIcon = ({ type, size = 16, className = "" }) => {
  const theme = getTicketTheme(type);
  const IconComponent = theme.icon;
  return (
    <IconComponent size={size} className={`${theme.iconColor} ${className}`} />
  );
};

export const TicketThemeBadge = ({ type, className = "" }) => {
  const theme = getTicketTheme(type);
  return (
    <div
      className={`${theme.labelBg} ${theme.textColor} text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-sm flex items-center justify-center gap-2 ${className}`}
    >
      <TicketTypeIcon type={type} size={14} />
      {theme.label}
    </div>
  );
};
