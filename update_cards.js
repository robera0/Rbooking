const fs = require('fs');
const path = require('path');

const cardsPath = path.join(__dirname, 'Client', 'admin', 'Cards.jsx');

const newContent = `import {
  Search,
  Check,
  Star,
  ToggleRight,
  ToggleLeft,
  Trash2,
  BookText,
  Eye,
  Download,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export const Cards = ({
  header,
  num,
  bg,
  topicons,
  bottomIcon,
  percent_change,
  daily_diff,
  border,
}) => {
  const loading = !header || !num;
  if (loading) {
    return (
      <div className="w-full h-full bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-6 shadow-xl animate-pulse min-h-[160px]"></div>
    );
  }
  return (
    <div className="w-full min-w-[240px] flex-1 bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-6 shadow-xl hover:shadow-[#FF7A00]/5 hover:border-white/[0.1] transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{header}</h3>
          <h1 className="text-3xl lg:text-4xl text-white font-black tracking-tighter">{num}</h1>
        </div>
        <div className={\`w-12 h-12 flex justify-center items-center \${bg || 'bg-white/[0.04]'} rounded-xl group-hover:scale-110 transition-transform duration-300\`}>
          {topicons}
        </div>
      </div>
      {/*Status */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
        <div className={percent_change?.includes('-') ? 'text-red-500' : 'text-[#5EC750]'}>{bottomIcon}</div>
        <p className={\`text-[10px] font-black tracking-widest \${percent_change?.includes('-') ? 'text-red-500' : 'text-[#5EC750]'}\`}>{percent_change}</p>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{daily_diff}</p>
      </div>
    </div>
  );
};

export const SearchInput = ({ placeholder, w = "w-full", h = "h-12 md:h-14", top = "top-1/2 -translate-y-1/2", left = "left-5" }) => {
  return (
    <div className={\`relative \${w}\`}>
      <button
        className={\`absolute \${top} \${left} flex justify-center cursor-pointer\`}
      >
        <Search className="text-gray-500 w-4 h-4 md:w-5 md:h-5 hover:text-[#FF7A00] transition-colors" strokeWidth={2.5} />
      </button>
      <input
        className={\`w-full \${h} pl-12 md:pl-14 pr-6 bg-[#1A1D20] text-white font-bold text-xs md:text-sm rounded-[1.5rem] md:rounded-full border border-white/[0.06] focus:border-[#FF7A00]/50 outline-none transition-all placeholder:text-gray-600\`}
        placeholder={placeholder}
        type="text"
      />
    </div>
  );
};

export const EventTable = () => {
  const navigate = useNavigate();
  return (
    <table className="w-full table-fixed text-sm text-left">
      <thead className="bg-[#1C1F22] border-b border-white/[0.08]">
        <tr>
          <th className="px-6 py-4 w-12 text-center">
             <input type="checkbox" className="w-4 h-4 accent-[#FF7A00]" />
          </th>
          <th className="px-6 py-4 w-[200px] text-white font-bold uppercase tracking-wider text-[10px]">Event Name</th>
          <th className="px-6 py-4 w-[200px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Venue / Location</th>
          <th className="px-6 py-4 w-[140px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Date</th>
          <th className="px-6 py-4 w-[150px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Status</th>
          <th className="px-6 py-4 w-[100px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Sold</th>
          <th className="px-6 py-4 w-[160px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Action</th>
        </tr>
      </thead>
      <tbody className="text-gray-300 font-medium">
        {[1,2,3,4,5].map((_, idx) => (
          <tr key={idx} className="bg-transparent hover:bg-white/[0.02] border-b border-white/[0.04] transition-colors">
            <td className="px-6 py-4 text-center">
              <input type="checkbox" className="w-4 h-4 accent-[#FF7A00]" />
            </td>
            <td className="px-6 py-4 border-gray-300">
              <h1 className="text-sm text-white font-bold">Warehouse Project \${idx + 1}</h1>
              <p className="text-[10px] text-[#FF7A00] uppercase tracking-widest mt-1">Concert</p>
            </td>
            <td className="px-6 py-4 text-center font-bold">Printworks, London</td>
            <td className="px-6 py-4 text-center font-bold text-gray-400">Oct 24, 2026</td>
            <td className="px-6 py-4 text-center">
              <div className="w-full h-8 flex justify-center items-center bg-[#5EC750]/10 border border-[#5EC750]/20 rounded-md">
                <h1 className="text-[#5EC750] font-black text-[10px] uppercase tracking-widest">Active</h1>
              </div>
            </td>
            <td className="px-6 py-4 text-center font-black text-white">1,500</td>
            <td className="px-6 py-4 text-center">
              <button
                onClick={() => navigate("/admin/events/1")}
                className="text-gray-400 hover:text-[#FF7A00] font-black uppercase text-[10px] tracking-widest transition-colors"
               >
                Manage
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const TicketTable = () => {
  const navigate = useNavigate();
  return (
    <table className="w-full table-fixed text-sm text-left">
      <thead className="bg-[#1C1F22] border-b border-white/[0.08]">
        <tr>
          <th className="px-6 py-4 w-12 text-center">
             <input type="checkbox" className="w-4 h-4 accent-[#FF7A00]" />
          </th>
          <th className="px-6 py-4 w-[150px] text-white font-bold uppercase tracking-wider text-[10px]">Order ID</th>
          <th className="px-6 py-4 w-[180px] text-white font-bold uppercase tracking-wider text-[10px]">Customer</th>
          <th className="px-6 py-4 w-[200px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Event</th>
          <th className="px-6 py-4 w-[140px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Date</th>
          <th className="px-6 py-4 w-[120px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Total</th>
          <th className="px-6 py-4 w-[160px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Action</th>
        </tr>
      </thead>
      <tbody className="text-gray-300 font-medium">
        {[1,2,3,4,5,6].map((_, idx) => (
          <tr key={idx} className="bg-transparent hover:bg-white/[0.02] border-b border-white/[0.04] transition-colors">
            <td className="px-6 py-4 text-center">
              <input type="checkbox" className="w-4 h-4 accent-[#FF7A00]" />
            </td>
            <td className="px-6 py-4 font-black tracking-widest text-[#FF7A00]">#TK-00\${idx+1}</td>
            <td className="px-6 py-4 font-bold text-white">Christian Brooks</td>
            <td className="px-6 py-4 text-center font-bold">Warehouse Project</td>
            <td className="px-6 py-4 text-center font-bold text-gray-400">Oct 24, 2026</td>
            <td className="px-6 py-4 text-center font-black text-white">$45.00</td>
            <td className="px-6 py-4 text-center">
              <button
                onClick={() => navigate("/admin/orders/1")}
                className="text-gray-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors"
               >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const Table = () => <div>Table Placeholder</div>;
export const MarketingTable = () => <div>MarketingTable Placeholder</div>;
export const TransactionTable = () => <div>TransactionTable Placeholder</div>;
`;

fs.writeFileSync(cardsPath, newContent, 'utf-8');
console.log('Cards.jsx rewritten successfully.');
