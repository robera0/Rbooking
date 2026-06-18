import React from "react";
import { NotificationMenu } from "../src/components/Reusable";
import { motion } from "framer-motion";
import { Shield, Bell, Smartphone, LogOut, Save, X, ChevronRight } from "lucide-react";

const Setting = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 lg:py-20 space-y-10">
      {/* ── HEADER ── */}
      <div className="px-4 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 text-[#FF7A00] mb-4"
        >
          <Shield size={14} fill="currentColor" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Preferences & Security</span>
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
          Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Center</span>
        </h1>
      </div>

      {/* ── NOTIFICATION SETTINGS ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden group bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] p-8 md:p-12 transition-all hover:bg-white/[0.03] hover:border-white/[0.1]"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
           <Bell size={120} strokeWidth={1} />
        </div>

        <div className="relative z-10 space-y-10">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#FF7A00] rounded-full" />
              Notifications
            </h2>
          </div>

          {/* NEWSLETTER SCHEDULE */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#FF7A00]">Newsletter Frequency</h3>
              <p className="text-gray-500 text-xs font-medium">How often should we sync with your inbox?</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-300">
              {["Daily", "Once a week", "Twice a week"].map((freq, i) => (
                <label key={freq} className="group relative flex items-center gap-3 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                  <input
                    type="radio"
                    name="freq"
                    value={freq.toLowerCase()}
                    defaultChecked={i === 0}
                    className="appearance-none w-4 h-4 rounded-full border-2 border-white/10 checked:border-[#FF7A00] checked:border-[5px] transition-all cursor-pointer"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none translate-y-[1px]">{freq}</span>
                </label>
              ))}
            </div>
          </div>

          {/* NOTIFICATION TYPES */}
          <div className="space-y-2 pt-4">
            {[
              "Alert me about exclusive offers and upcoming event drops",
              "Notify me when a new venue is added to our network",
              "Send SMS confirmation for all online payment ",
              "Grant public visibility to my professional profile"
            ].map((info, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <NotificationMenu info={info} />
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10">
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black text-xs font-black uppercase italic rounded-2xl hover:bg-[#FF7A00] transition-all active:scale-95 group">
              <Save size={16} />
              Commit Changes
            </button>
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.03] border border-white/10 text-gray-400 text-xs font-black uppercase italic rounded-2xl hover:text-white hover:bg-white/10 transition-all">
              Discard
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── SECURITY SETTINGS ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden group bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] p-8 md:p-12 transition-all hover:bg-white/[0.03] hover:border-white/[0.1]"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
           <Shield size={120} strokeWidth={1} />
        </div>

        <div className="relative z-10 space-y-12">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
              Security Vault
            </h2>
          </div>

          {/* TWO FACTOR SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-blue-400">
                   <Smartphone size={18} />
                   <h3 className="text-sm font-black uppercase tracking-widest text-white leading-none translate-y-[1px]">Two-Factor Protocol</h3>
                </div>
                <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-sm">
                  Add an additional security layer via mobile authentication. Any login attempt will require 
                  a unique verification signal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter phone number"
                  className="flex-1 bg-white/[0.03] border border-white/[0.08] text-white rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 text-[13px] font-black tracking-tight transition-all"
                />
                <button className="px-6 py-4 bg-blue-500 text-white text-[10px] font-black uppercase italic rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-400 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                  Transmit
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* ACTIVE SESSION */}
            <div className="space-y-6 pt-10 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/[0.04] lg:pl-12">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-red-500">
                   <LogOut size={18} />
                   <h3 className="text-sm font-black uppercase tracking-widest text-white leading-none translate-y-[1px]">Active Sessions</h3>
                </div>
                <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-sm">
                  Selecting terminate will force a sign-out from all authorized devices except 
                  for the current terminal.
                </p>
              </div>

              <button className="w-full sm:w-fit px-8 py-4 bg-red-500/5 text-red-500/80 border border-red-500/10 text-[10px] font-black uppercase italic rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300">
                Terminate Global Session
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Setting;
