import React, { useState } from "react";
import {
  Search,
  Heart,
  Share2,
  MapPin,
  ClockFading,
  Ticket,
  MoveRight,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";

import { useService } from "@/Context/ServiceContext";
import { eventService } from "@/Context/ApiEvent";
import CheckoutModal from "@/components/Reusable";
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

const EventInfo = () => {
  const { eventId, ticketId } = useParams();
  const { setEditMenuActive, setCheckoutOpen, checkoutOpen } = useService();
  const { fetchEventById } = eventService();

  const { data: event_id, isLoading } = useQuery({
    queryKey: ["event", eventId, ticketId],
    queryFn: () => fetchEventById(eventId, ticketId),
  });

  const event = event_id?.event || null;
  const ticket = event_id?.ticket || null;

  const handlePayment = async () => {
    const loadingToast = toast.loading("Confirming transaction...");
    try {
      // Simulate API payment call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Payment Successful! Access granted.", {
        id: loadingToast,
      });
      setCheckoutOpen(false);
    } catch (error) {
      toast.error("Payment failed. Please try again.", { id: loadingToast });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] p-6 lg:p-12 space-y-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-[450px] w-full rounded-[2rem]" />
          </div>
          <aside className="lg:col-span-4">
            <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F5] antialiased">
      <Toaster position="top-center" />

      {/* SEARCH NAV */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-8">
          <span className="text-sm font-black tracking-tighter uppercase italic text-[#FF7A00]">
            PAYSSO
          </span>
          <div
            onClick={() => setEditMenuActive(true)}
            className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 gap-3 cursor-pointer hover:bg-white/10 transition-all group"
          >
            <Search
              size={14}
              className="text-gray-500 group-hover:text-[#FF7A00]"
            />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest w-48">
              Modify Search...
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Heart size={20} className="cursor-pointer hover:text-[#FF7A00]" />
          <Share2 size={20} className="cursor-pointer hover:text-[#FF7A00]" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-24">
        {/* MOBILE SEARCH TRIGGER */}
        <div className="md:hidden mb-8">
          <button
            onClick={() => setEditMenuActive(true)}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest"
          >
            <Search size={16} /> Modify Transmission Search
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* SIDEBAR - order-1 on mobile, order-2 on desktop */}
          <aside className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="bg-[#111112] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                <Ticket size={120} />
              </div>
              <div className="relative z-10 space-y-8">
                <div>
                  <p className="text-[10px] font-black text-gray-600 tracking-[0.4em] uppercase mb-2">
                    Access Protocol
                  </p>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    {ticket?.type || "Standard"}
                  </h2>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter italic text-white">
                    ${ticket?.price}
                  </span>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                    USD
                  </span>
                </div>
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full py-5 bg-[#FF7A00] text-black font-black uppercase italic text-xs rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,122,0,0.15)]"
                >
                  SECURE ENTRY <MoveRight size={18} />
                </button>
                <div className="pt-8 border-t border-white/5 flex items-center gap-4 opacity-50">
                  <ShieldCheck size={20} className="text-[#FF7A00]" />
                  <p className="text-[9px] font-black text-gray-500 uppercase leading-tight tracking-widest">
                    Encrypted <br /> Terminal
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT - order-2 on mobile, order-1 on desktop */}
          <div className="lg:col-span-8 order-2 lg:order-1 space-y-12">
            <header className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-[#FF7A00]/10 text-[#FF7A00] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border border-[#FF7A00]/20">
                  Confirmed Transmission
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9]">
                {event?.name}
              </h1>
              <div className="flex items-center gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <ClockFading size={16} />
                  <span className="text-xs font-bold uppercase">
                    {moment(event?.dates?.start?.localDate).format("LL")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span className="text-xs font-bold uppercase">
                    {event?._embedded?.venues?.[0]?.name}
                  </span>
                </div>
              </div>
            </header>

            <div className="rounded-[2rem] overflow-hidden border border-white/5 h-[400px] md:h-[550px]">
              <img
                src={event?.images?.[0]?.url}
                className="w-full h-full object-cover"
                alt="Event"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF7A00]">
                Transmission Logs
              </h3>
              <p className="text-lg text-gray-400 italic font-medium leading-relaxed">
                "{event?.description || "No encrypted logs found."}"
              </p>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            amount={ticket?.price}
            name={event?.name}
            action={handlePayment}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventInfo;
