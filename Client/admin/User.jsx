import { Cards, SearchInput, UserTable } from "./Cards";
import {
  UserRoundPlus,
  UserRoundCheck,
  UserStar,
  UserRoundX,
  CirclePlus,
  Funnel,
  CloudUpload,
  CalendarDays,
  ChevronsRight,
  ChevronsLeft,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useService } from "../src/Context/ServiceContext";

const User = () => {
  const startRef = useRef(null);
  const endRef = useRef(null);

  const { API_URL } = useService();
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [errorMsg, setErrorMsg] = useState("");

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to create user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setIsAddModalOpen(false);
      setNewUserEmail("");
      setErrorMsg("");
    }
  });

  const handleAddUser = () => {
    if (!newUserEmail) {
      setErrorMsg("Email address is required to register a user.");
      return;
    }

    addMutation.mutate({
      email: newUserEmail,
      role: newUserRole
    });
  };

  return (
    <div className="w-full max-w-full space-y-8 relative">
      {/* Add User Modal Overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1C1F22] border border-white/[0.08] rounded-2xl p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Create <span className="text-[#FF7A00]">User</span></h2>
            
            {errorMsg && <p className="text-red-500 text-xs font-bold mb-4">{errorMsg}</p>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">User Email</label>
                <input 
                  type="email" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none transition-colors" 
                  placeholder="admin@rbooking.com" 
                />
              </div>
              
              <div>
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Assign Role</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:border-[#FF7A00]/50 outline-none transition-colors cursor-pointer"
                >
                  <option value="user">General User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <button 
                onClick={handleAddUser}
                disabled={addMutation.isLoading}
                className="w-full mt-4 py-3 bg-[#FF7A00] text-black hover:bg-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {addMutation.isLoading ? "Creating..." : "Confirm & Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 border-b border-white/[0.04] pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            User <span className="text-[#FF7A00]">Management</span>
          </h1>
          <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mt-4 md:mt-0 px-6 py-3 bg-[#FF7A00] text-black hover:bg-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <CirclePlus size={16} strokeWidth={3} />
          Add User
        </button>
      </div>

      <div className="flex flex-wrap gap-6">
        {/*Total User */}
        <Cards
          header="Total User"
          num="40,689"
          topicons={<UserRoundPlus strokeWidth={2.5} className="w-6 h-6 text-white" />}
          bg="bg-[#FF7A00]"
          daily_diff="Registered on platform"
        />

        {/*Verified Users */}
        <Cards
          header="Verified Users"
          num="10,000"
          topicons={<UserRoundCheck strokeWidth={2.5} className="w-6 h-6 text-white" />}
          bg="bg-[#5EC750]"
          daily_diff="Accounts verified"
        />
        
        {/*Active Users */}
        <Cards
          header="Active Users"
          num="3000"
          topicons={<UserStar strokeWidth={2.5} className="w-6 h-6 text-white" />}
          bg="bg-[#A17DF5]"
          daily_diff="Active past week"
        />
        
        {/*Deleted Users */}
        <Cards
          header="Deleted Users"
          num="3000"
          topicons={<UserRoundX strokeWidth={2.5} className="w-6 h-6 text-white" />}
          bg="bg-red-500"
          daily_diff="Deleted accounts"
        />
      </div>

      {/*Table Section */}
      <div className="w-full bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-6 shadow-xl flex flex-col min-h-[400px]">
        {/* Filters Wrapper */}
        <div className="w-full flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              w="w-full"
              h="h-12"
              top="top-1/2 -translate-y-1/2"
              left="left-4"
              placeholder="Search user name or email..."
            />
          </div>
          
          <button className="h-12 px-6 flex justify-center items-center bg-[#1A1D20] text-white rounded-full gap-2 border border-white/[0.06] hover:border-[#FF7A00]/50 transition-colors">
            <Funnel size={16} className="text-gray-500" />
            <select className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
               <option value="" className="bg-[#1C1F22]">Filter By</option>
               <option value="active" className="bg-[#1C1F22]">Active</option>
               <option value="suspended" className="bg-[#1C1F22]">Suspended</option>
            </select>
          </button>

          <button className="h-12 px-6 flex justify-center items-center bg-[#1A1D20] text-gray-500 hover:text-white rounded-full gap-2 border border-white/[0.06] hover:border-[#FF7A00]/50 transition-colors font-black uppercase text-[10px] tracking-widest">
             <CloudUpload size={16} /> Export
          </button>
        </div>

        {/* Table itself */}
        <div className="w-full overflow-x-auto flex-1">
          <UserTable />
        </div>

        {/* Pagination */}
        <div className="w-full mt-6 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row flex-wrap items-center justify-between gap-4">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
             Showing 1 to 7 of 40,689 entries
          </p>
          <div className="flex items-center gap-2 bg-[#1A1D20] border border-white/[0.06] p-1 rounded-full">
            <button className="w-10 h-10 flex justify-center items-center text-gray-500 hover:text-white rounded-full transition-colors active:scale-95">
              <ChevronsLeft size={16} strokeWidth={2.5} />
            </button>
            <div className="flex items-center gap-1">
               <button className="w-8 h-8 rounded-full bg-[#FF7A00] text-black font-black text-xs flex items-center justify-center shadow-[0_0_10px_rgba(255,122,0,0.5)]">1</button>
               <button className="w-8 h-8 rounded-full text-white hover:bg-white/[0.04] font-black text-xs flex items-center justify-center transition-colors">2</button>
               <button className="w-8 h-8 rounded-full text-white hover:bg-white/[0.04] font-black text-xs flex items-center justify-center transition-colors">3</button>
               <button className="w-8 h-8 rounded-full text-white hover:bg-white/[0.04] font-black text-xs flex items-center justify-center transition-colors">4</button>
            </div>
            <button className="w-10 h-10 flex justify-center items-center text-gray-500 hover:text-white rounded-full transition-colors active:scale-95">
               <ChevronsRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
