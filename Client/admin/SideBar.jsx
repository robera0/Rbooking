import SideMenu from "./SideMenu";
import {
  LayoutDashboard,
  UsersRound,
  Ticket,
  CreditCard,
  ChartNoAxesColumnIncreasing,
  Megaphone,
  Settings,
  Power,
  Tickets,
  X,
} from "lucide-react";
import api from "../src/Context/api/api.config";
import { useQueryClient } from "@tanstack/react-query";

const SideBar = ({ action, onClose }) => {
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await api.post(`/api/auth/logout`);

      queryClient.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1C1F22]">
      {/*side Bar */}
      <div className="w-full h-full space-y-3 flex flex-col overflow-y-auto scroll-hidden">
        <div className="w-full h-16 sm:h-20 shrink-0 flex justify-between items-center border-b border-white/[0.06] px-4">
          <img
            src="/P_logo.png"
            alt="PaySSo Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          {/* Close button — mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
        <div className="space-y-6 px-4 flex-1 pt-3">
          {/*Dashboard */}
          <SideMenu
            path="/admin/home"
            name="Dashboard"
            icon={<LayoutDashboard size={20} />}
            onNavigate={onClose}
          />
          {/*Event Mang */}
          <SideMenu
            path="/admin/events"
            name="Event Management"
            icon={<UsersRound size={20} />}
            onNavigate={onClose}
          />
          {/*ticket MAng */}
          <SideMenu
            path="/admin/orders"
            name="Ticket Management"
            icon={<Ticket size={20} />}
            onNavigate={onClose}
          />

          <SideMenu
            path="/admin/ticket/qr"
            name="Scan Ticket"
            icon={<Ticket size={20} />}
            onNavigate={onClose}
          />
          {/* 
        
          <SideMenu
            path="/admin/users"
            name="User Management"
            icon={<CreditCard size={20} />}
          />
         
          <SideMenu
            path="/admin/payment"
            name="Earnings & Finance"
            icon={<Megaphone size={20} />}
          />
          <SideMenu
            path="/admin/reports"
            name="Reports"
            icon={<ChartNoAxesColumnIncreasing size={20} />}
          />
          
          */}

          <div className="pt-6 pb-2 pl-4">
            <h1 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
              Account Settings
            </h1>
          </div>
          {/*Profile */}
          <SideMenu
            path="/admin/profile"
            name="Admin Profile"
            icon={<UsersRound size={20} />}
            onNavigate={onClose}
          />
          {/*Setting */}
          <SideMenu
            path="/admin/setting"
            name="Organizer Settings"
            icon={<Settings size={20} />}
            onNavigate={onClose}
          />
        </div>
        <div className="px-4 pb-8 mt-auto border-t border-white/[0.04] pt-4">
          {/*Logout */}
          <SideMenu
            path="/"
            name="Logout"
            action={handleLogout}
            icon={<Power size={20} />}
            isDanger={true}
            onNavigate={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default SideBar;
