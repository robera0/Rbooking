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
} from "lucide-react";

const SideBar = () => {
  return (
    <div className="flex flex-col h-full bg-[#1C1F22]">
      {/*side Bar */}
      <div className="w-full h-full space-y-6 flex flex-col overflow-y-auto scroll-hidden">
        <div className="w-full pt-8 pb-4 flex justify-center items-center space-x-3 border-b border-white/[0.04]">
          <div className="p-2 bg-[#FF7A00]/10 rounded-xl">
            <Tickets className="text-[#FF7A00]" size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl text-white font-black uppercase tracking-tighter">Pay<span className="text-[#FF7A00]">So</span></h1>
        </div>
        <div className="space-y-2 px-4 flex-1">
          {/*Dashboard */}
          <SideMenu
            path="/dashboard"
            name="Dashboard"
            icon={<LayoutDashboard size={20} />}
          />
          {/*Event Mang */}
          <SideMenu
            path="/admin/events"
            name="Event Management"
            icon={<UsersRound size={20} />}
          />
          {/*ticket MAng */}
          <SideMenu
            path="/admin/orders"
            name="Ticket Management"
            icon={<Ticket size={20} />}
          />
          {/*user Mang */}
          <SideMenu
            path="/admin/users"
            name="User Management"
            icon={<CreditCard size={20} />}
          />
          <div className="pt-6 pb-2 pl-4">
            <h1 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Others</h1>
          </div>
          {/*Setting */}
          <SideMenu path="/setting" name="Setting" icon={<Settings size={20} />} />
          {/*Payment */}
          <SideMenu path="/marketing" name="Payment" icon={<Megaphone size={20} />} />
          {/*Accounts */}
          <SideMenu
            path="/reports"
            name="Accounts"
            icon={<ChartNoAxesColumnIncreasing size={20} />}
          />
        </div>
        <div className="px-4 pb-8 mt-auto border-t border-white/[0.04] pt-4">
          {/*Logout */}
          <SideMenu path="/" name="Logout" icon={<Power size={20} />} isDanger={true} />
        </div>
      </div>
    </div>
  );
};

export default SideBar;
