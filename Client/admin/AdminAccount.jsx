import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Shield, 
  Key, 
  Activity, 
  Bell, 
  Globe, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Smartphone,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { CustomSelect } from "./Cards";

const AdminAccount = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);

  // Mock Admin Data
  const adminInfo = {
    name: "Senior Administrator",
    email: "admin@rbooking.com",
    role: "Super Admin",
    joined: "January 15, 2026",
    status: "Verified",
    permissions: ["Full CRUD", "Finance Access", "User Ban Control", "Audit Logs Viewer"]
  };

  const auditLogs = [
    { action: "Deleted Event #EV-402", time: "2 hours ago", status: "completed" },
    { action: "Suspended User: user_882", time: "5 hours ago", status: "completed" },
    { action: "Updated Commission Policy", time: "Yesterday", status: "completed" },
    { action: "Exported Finance Report", time: "2 days ago", status: "completed" }
  ];

  const containers = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="w-full max-w-full space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-end mb-8 border-b border-white/[0.04] pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#FF7A00] font-black uppercase text-[10px] tracking-widest">
            <Shield size={14} strokeWidth={3} />
            Admin Portal v4.2
          </div>
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white italic">
            Admin <span className="text-[#FF7A00] underline">Credentials</span>
          </h1>
          <div className="w-20 h-1.5 bg-[#FF7A00]" />
        </div>
        
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <div className="text-right hidden md:block">
            <p className="text-white font-black text-xs uppercase tracking-widest">{adminInfo.name}</p>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">{adminInfo.email}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF7A00] to-orange-700 p-[2px]">
            <div className="w-full h-full rounded-2xl bg-[#1C1F22] flex justify-center items-center font-black text-2xl text-white">
              S
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: "profile", label: "My Profile", icon: User },
            { id: "security", label: "Security & Password", icon: Key },
            { id: "activity", label: "Activity History", icon: Activity },
            { id: "system", label: "App Preferences", icon: Globe }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-300 group ${
                activeTab === item.id 
                  ? "bg-[#FF7A00] border-[#FF7A00] text-black" 
                  : "bg-[#1C1F22] border-white/[0.04] text-gray-500 hover:border-white/[0.1] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={18} strokeWidth={activeTab === item.id ? 3 : 2} />
                <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
              </div>
              <ChevronRight size={14} className={activeTab === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"} />
            </button>
          ))}

          <div className="pt-10">
            <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-widest">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div 
                key="profile"
                variants={containers}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                <div className="bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-20 -top-20 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
                    <User size={300} />
                  </div>
                  
                  <div className="relative z-10 space-y-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Profile <span className="text-[#FF7A00]">Details</span></h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#5EC750]/10 border border-[#5EC750]/20 rounded-full w-fit">
                          <CheckCircle2 size={12} className="text-[#5EC750]" />
                          <span className="text-[#5EC750] font-black text-[9px] uppercase tracking-widest">Trust Index: High (Verified)</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Legal Full Name</label>
                        <input className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-6 py-4 text-white font-bold outline-none border-focus-[#FF7A00]/50 transition-all" defaultValue={adminInfo.name} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contact Email</label>
                        <input className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-6 py-4 text-white font-bold outline-none cursor-not-allowed" disabled defaultValue={adminInfo.email} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">Account Permissions</h3>
                      <div className="flex flex-wrap gap-2">
                        {adminInfo.permissions.map(perm => (
                          <div key={perm} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white font-black text-[10px] uppercase tracking-widest">
                            {perm}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#FF7A00] transition-all active:scale-95 shadow-xl">
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div 
                key="security"
                variants={containers}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Password Change */}
                  <div className="bg-[#1C1F22] border border-white/[0.04] rounded-[2.5rem] p-8 space-y-8">
                    <div className="flex items-center gap-4 text-white">
                      <Lock className="text-[#FF7A00]" size={24} />
                      <h2 className="text-xl font-black uppercase tracking-tighter italic">Change <span className="text-[#FF7A00]">Password</span></h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current Key</label>
                         <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"}
                              className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-6 py-4 text-white font-bold outline-none" 
                              placeholder="••••••••••••"
                            />
                            <button 
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                         </div>
                      </div>
                      <div className="space-y-2 pt-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">New Authentication Key</label>
                         <input type="password" className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-6 py-4 text-white font-bold outline-none" />
                      </div>
                    </div>
                    
                    <button className="w-full py-4 bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white hover:text-black transition-all font-black text-[10px] uppercase tracking-widest rounded-2xl">
                      Update Password
                    </button>
                  </div>

                  {/* Multi-Factor */}
                  <div className="bg-[#1C1F22] border border-white/[0.04] rounded-[2.5rem] p-8 space-y-8">
                    <div className="flex items-center gap-4 text-white">
                      <Smartphone className="text-blue-500" size={24} />
                      <h2 className="text-xl font-black uppercase tracking-tighter italic">Two-Factor <span className="text-blue-500">Auth</span></h2>
                    </div>
                    
                    <p className="text-gray-500 text-xs font-bold leading-relaxed uppercase tracking-widest">
                       Secure your account access with biometric or hardware verification.
                    </p>

                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
                       <div className="flex items-center justify-between">
                         <span className="text-white font-black text-[10px] uppercase tracking-widest">Hardware-Key Access</span>
                         <div className="w-12 h-6 bg-blue-500/20 border border-blue-500/30 rounded-full p-1 relative cursor-pointer">
                            <div className="w-4 h-4 bg-blue-500 rounded-full" />
                         </div>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-white font-black text-[10px] uppercase tracking-widest">Biometric Login</span>
                         <div className="w-12 h-6 bg-white/5 border border-white/10 rounded-full p-1 relative cursor-pointer">
                            <div className="w-4 h-4 bg-gray-600 rounded-full translate-x-0" />
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "activity" && (
              <motion.div 
                key="activity"
                variants={containers}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-[#1C1F22] border border-white/[0.04] rounded-[2.5rem] p-8"
              >
                <div className="flex items-center justify-between mb-10 border-b border-white/[0.04] pb-6">
                   <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Recent <span className="text-[#FF7A00]">Activity</span> History</h2>
                   <div className="px-4 py-2 bg-white/[0.04] rounded-full text-gray-500 font-bold text-[10px] uppercase tracking-widest">Real-time Feedback</div>
                </div>

                <div className="space-y-4">
                  {auditLogs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl hover:border-white/[0.1] transition-all group">
                       <div className="flex items-center gap-6">
                         <div className="w-12 h-12 rounded-xl bg-[#121417] flex justify-center items-center text-[#FF7A00]">
                            <Clock size={20} />
                         </div>
                         <div>
                            <p className="text-sm text-white font-black uppercase tracking-tight">{log.action}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Timestamp: {log.time}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2 px-3 py-1 bg-[#5EC750]/5 text-[#5EC750] rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#5EC750] animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{log.status}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "system" && (
              <motion.div 
                key="system"
                variants={containers}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                <div className="bg-[#1C1F22] border border-white/[0.04] rounded-[2.5rem] p-8 space-y-10">
                   <div>
                     <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Account <span className="text-[#FF7A00]">Preferences</span></h2>
                     <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Control how the application behaves</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">System Language</label>
                        <CustomSelect 
                         options={[
                           { label: "English (US) - Default", value: "en" },
                           { label: "Amharic (Ethiopia)", value: "am" },
                           { label: "French (Standard)", value: "fr" }
                         ]}
                         value="en"
                         onChange={() => {}}
                         placeholder="Select Language"
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">Timezone Reference</label>
                        <CustomSelect 
                         options={[
                           { label: "UTC +3:00 (Addis Ababa)", value: "eat" },
                           { label: "UTC +0:00 (Greenwich)", value: "utc" }
                         ]}
                         value="eat"
                         onChange={() => {}}
                         placeholder="Select Timezone"
                        />
                     </div>
                   </div>

                   <div className="pt-8 border-t border-white/[0.04]">
                     <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-black text-xs uppercase tracking-widest">Emergency System Broadcasts</p>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Receive critical system-level error updates</p>
                        </div>
                        <div className="w-14 h-7 bg-[#FF7A00] rounded-full p-1 cursor-pointer flex justify-end">
                           <div className="w-5 h-5 bg-white rounded-full shadow-lg" />
                        </div>
                     </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminAccount;
