import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useService } from "../src/Context/ServiceContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Hash,
  ShieldCheck,
  User,
  CreditCard,
  Building,
  CheckCircle2,
  Loader2,
  XCircle,
  FileText
} from "lucide-react";
import moment from "moment";

/* ─── design tokens ─── */
const SURFACE = "bg-[#1C1F22]";
const BORDER = "border-white/[0.04]";

/* ─── detail row ─── */
const Detail = ({ icon: Icon, label, value, highlight = false }) => (
  <div className={`flex items-start gap-4 py-4 border-b ${BORDER} last:border-0`}>
    <div className={`mt-0.5 shrink-0 p-2 rounded-lg ${highlight ? 'bg-[#FF7A00]/10 text-[#FF7A00]' : 'bg-white/[0.02] text-gray-400'}`}>
      <Icon size={16} />
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-center">
      <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">{label}</span>
      <span className={`text-sm ${highlight ? 'text-[#FF7A00] font-black' : 'text-gray-200 font-medium'} truncate`}>{value}</span>
    </div>
  </div>
);

const AdminViewTicket = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useService();

  const { data: transaction, isLoading, isError, error } = useQuery({
    queryKey: ["adminTransaction", orderId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/analytics/transactions/${orderId}`);
      if (!res.ok) {
         const err = await res.json();
         throw new Error(err.message || "Failed to fetch transaction");
      }
      const data = await res.json();
      return data.transaction;
    },
    enabled: !!orderId,
    retry: false,
  });

  const evt = transaction?.ticketId?.eventId;
  const tkt = transaction?.ticketId;
  const usr = transaction?.userId;
  
  const statusColors = {
      pending: "bg-[#FDC142]/10 text-[#FDC142] border-[#FDC142]/20",
      paid: "bg-[#5EC750]/10 text-[#5EC750] border-[#5EC750]/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20"
  };
  
  const statusValue = transaction?.status || "pending";
  const statusClass = statusColors[statusValue.toLowerCase()] || statusColors.pending;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 border-b border-white/[0.04] pb-6">
        <div className="space-y-4">
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Ledger
          </motion.button>
          
          <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
            Order <span className="text-[#FF7A00]">#{orderId?.slice(-8).toUpperCase()}</span>
          </h1>
          <div className="w-12 h-1 bg-[#FF7A00]" />
        </div>
        
        {!isLoading && !isError && (
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${statusClass}`}>
            {statusValue === 'paid' ? <CheckCircle2 size={16} /> : 
             statusValue === 'cancelled' ? <XCircle size={16} /> : 
             <Loader2 size={16} className="animate-spin" />}
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{statusValue}</span>
          </div>
        )}
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 size={40} className="text-[#FF7A00] animate-spin" />
          <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">Querying Ledger...</p>
        </div>
      )}

      {isError && (
        <div className={`rounded-3xl ${SURFACE} border ${BORDER} p-8 text-center`}>
          <p className="text-lg font-bold text-red-500 mb-2">Order Not Found</p>
          <p className="text-sm text-gray-400">{error?.message}</p>
        </div>
      )}

      {/* Main Grid */}
      {!isLoading && !isError && transaction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Column 1: Financials */}
          <div className="lg:col-span-2 space-y-8">
            <div className={`rounded-[2rem] ${SURFACE} border ${BORDER} overflow-hidden shadow-2xl`}>
               <div className="px-8 py-6 border-b border-white/[0.04]">
                 <h2 className="text-lg font-bold text-white flex items-center gap-3">
                   <FileText className="text-[#FF7A00]" /> Transaction Record
                 </h2>
               </div>
               <div className="p-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    <Detail icon={Hash} label="Transaction Hash" value={transaction._id} />
                    <Detail icon={Calendar} label="Date Authorized" value={moment(transaction.purchasedAt).format("MMMM Do YYYY, h:mm a")} />
                    <Detail icon={CreditCard} label="Payment Method" value="Chapa Gateway" />
                    <Detail icon={Tag} label="Quantity" value={`${transaction.quantity}x Tickets`} />
                 </div>
               </div>
               {/* Financials Totals */}
               <div className="bg-[#151719] p-8 border-t border-white/[0.04] space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                    <span>Base Ticket Price ({tkt?.type || 'General'})</span>
                    <span>{tkt?.price || 0} ETB</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                    <span>Quantity</span>
                    <span>x{transaction.quantity}</span>
                  </div>
                  <div className="w-full border-t border-dashed border-white/[0.08] my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Total Settled</span>
                    <span className="text-[#5EC750] font-black text-2xl">{transaction.totalAmount} ETB</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Platform Commission Cut (10%)</span>
                    <span className="text-[#FF7A00] font-black text-sm">~{transaction.commissionAmount} ETB</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Column 2: External Linkages */}
          <div className="space-y-8">
             {/* Customer Data */}
             <div className={`rounded-[2rem] ${SURFACE} border ${BORDER} p-6 shadow-xl`}>
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                 <User size={14} /> Linked Account
               </h3>
               <div className="space-y-1">
                 <p className="text-white font-bold text-lg">{usr?.fullName || usr?.username}</p>
                 <p className="text-[#FF7A00] font-semibold text-sm">{usr?.email}</p>
               </div>
             </div>

             {/* Event Data */}
             <div className={`rounded-[2rem] ${SURFACE} border ${BORDER} p-6 shadow-xl`}>
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                 <Building size={14} /> Event Fulfillment
               </h3>
               {evt ? (
                 <div className="space-y-4">
                   <div className="w-full h-32 rounded-xl overflow-hidden relative">
                      <img src={evt.pictures?.[0]} alt="event" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40" />
                   </div>
                   <div>
                     <p className="text-white font-bold">{evt.name}</p>
                     <p className="text-gray-400 text-xs mt-1">{evt.locale}</p>
                   </div>
                 </div>
               ) : (
                  <p className="text-gray-500 text-sm">Original event data no longer exists.</p>
               )}
             </div>

             {/* Security */}
             <div className="flex items-center gap-3 justify-center py-4 text-gray-500">
               <ShieldCheck size={14} />
               <p className="text-[9px] font-black uppercase tracking-widest">
                 Tamper-evident Audit Logging Active
               </p>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminViewTicket;
