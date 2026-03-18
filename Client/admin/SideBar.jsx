import SideMenu from "./SideMenu";
import {
  LayoutDashboard,
  UsersRound,
  ShoppingBag,
  BookCheck,
  CreditCard,
  ChartNoAxesColumnIncreasing,
  Megaphone,
  Settings,
  Power,
  Tickets,
} from "lucide-react";

const SideBar = () => {
  return (
    <div className="flex">
      {/*side Bar */}
      <div className="fixed w-1/7 h-screen bg-[#F1F2F7] space-y-8">
        <div className="w-full pt-6 flex justify-center items-center space-x-3 ">
          <span className="flex  items-center">
            <Tickets className="text-orange-400" />
          </span>

          <h1 className="text-xl  text-orange-400 font-bold">PaySo</h1>
        </div>
        <div className=" space-y-4">
          {/*Dashboard */}
          <SideMenu
            path="/dashboard"
            name="Dashboard"
            icon={<LayoutDashboard />}
          />
          {/*Event Mang */}
          <SideMenu
            path="/user"
            name="Event Management"
            icon={<UsersRound />}
          />
          {/*ticket MAng */}
          <SideMenu
            path="/salon"
            name="Ticket Management"
            icon={<ShoppingBag />}
          />
          {/*user Mang */}
          <SideMenu
            path="/payment"
            name="User Management"
            icon={<CreditCard />}
          />
          <div className="ml-4">
            <h1>Others</h1>
          </div>
          {/*Setting */}
          <SideMenu path="/setting" name="Setting" icon={<Settings />} />
          {/*Payment */}
          <SideMenu path="/marketing" name="Payment" icon={<Megaphone />} />
          {/*Accounts */}
          <SideMenu
            path="/reports"
            name="Accounts"
            icon={<ChartNoAxesColumnIncreasing />}
          />
          {/*Logout */}
          <SideMenu path="/" name="Logout" icon={<Power />} />
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default SideBar;
