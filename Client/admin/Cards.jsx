import {
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useService } from "../src/Context/ServiceContext";

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
        <div className={`w-12 h-12 flex justify-center items-center ${bg || 'bg-white/[0.04]'} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          {topicons}
        </div>
      </div>
      {/*Status */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
        <div className={percent_change?.includes('-') ? 'text-red-500' : 'text-[#5EC750]'}>{bottomIcon}</div>
        <p className={`text-[10px] font-black tracking-widest ${percent_change?.includes('-') ? 'text-red-500' : 'text-[#5EC750]'}`}>{percent_change}</p>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{daily_diff}</p>
      </div>
    </div>
  );
};

export const SearchInput = ({ placeholder, w = "w-full", h = "h-12 md:h-14", top = "top-1/2 -translate-y-1/2", left = "left-5" }) => {
  return (
    <div className={`relative ${w}`}>
      <button
        className={`absolute ${top} ${left} flex justify-center cursor-pointer`}
      >
        <Search className="text-gray-500 w-4 h-4 md:w-5 md:h-5 hover:text-[#FF7A00] transition-colors" strokeWidth={2.5} />
      </button>
      <input
        className={`w-full ${h} pl-12 md:pl-14 pr-6 bg-[#1A1D20] text-white font-bold text-xs md:text-sm rounded-[1.5rem] md:rounded-full border border-white/[0.06] focus:border-[#FF7A00]/50 outline-none transition-all placeholder:text-gray-600`}
        placeholder={placeholder}
        type="text"
      />
    </div>
  );
};

export const EventTable = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const { API_URL } = useService();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/events`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.events || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventIds) => {
      const res = await fetch(`${API_URL}/api/admin/events/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventIds })
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      setSelected([]);
    }
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(events.map(ev => ev._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="w-full">
      {/* Action Toolbar */}
      {selected.length > 0 && (
        <div className="flex justify-between items-center bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 transition-all duration-300">
          <p className="text-red-500 font-bold text-[10px] md:text-sm tracking-widest uppercase shadow-sm">
            {selected.length} items selected
          </p>
          <button 
            onClick={() => deleteMutation.mutate(selected)}
            disabled={deleteMutation.isLoading}
            className="flex items-center gap-2 bg-red-500 text-white hover:bg-white hover:text-red-500 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors duration-300 shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={16} strokeWidth={2.5} /> {deleteMutation.isLoading ? "Deleting..." : "Delete Selected"}
          </button>
        </div>
      )}

      <table className="w-full table-fixed text-sm text-left">
        <thead className="bg-[#1C1F22] border-b border-white/[0.08]">
          <tr>
            <th className="px-6 py-4 w-12 text-center">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                onChange={handleSelectAll}
                checked={selected.length === events.length && events.length > 0}
              />
            </th>
            <th className="px-6 py-4 w-[200px] text-white font-bold uppercase tracking-wider text-[10px]">
              Event Name
            </th>
            <th className="px-6 py-4 w-[200px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Venue / Location
            </th>
            <th className="px-6 py-4 w-[140px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Date
            </th>
            <th className="px-6 py-4 w-[150px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Status
            </th>
            <th className="px-6 py-4 w-[100px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Sold
            </th>
            <th className="px-6 py-4 w-[160px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-300 font-medium">
          {isLoading && <tr><td colSpan="7" className="text-center py-8">Loading events...</td></tr>}
          {events.map((item, idx) => (
            <tr
              key={item._id || idx}
              className={`border-b border-white/[0.04] transition-colors ${
                selected.includes(item._id)
                  ? "bg-red-500/[0.05] border-l-2 border-l-red-500"
                  : "bg-transparent hover:bg-white/[0.02]"
              }`}
            >
              <td className="px-6 py-4 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                  checked={selected.includes(item._id)}
                  onChange={() => handleSelect(item._id)}
                />
              </td>
              <td className="px-6 py-4 border-gray-300">
                <h1 className="text-sm text-white font-bold truncate w-40">
                  {item.name}
                </h1>
                <p className="text-[10px] text-[#FF7A00] uppercase tracking-widest mt-1">
                  {item.type || "Concert"}
                </p>
              </td>
              <td className="px-6 py-4 text-center font-bold">
                {item.locale || "N/A"}
              </td>
              <td className="px-6 py-4 text-center font-bold text-gray-400">
                {item.dates?.start?.localDate || "N/A"}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="w-full h-8 flex justify-center items-center bg-[#5EC750]/10 border border-[#5EC750]/20 rounded-md">
                  <h1 className="text-[#5EC750] font-black text-[10px] uppercase tracking-widest">
                    Active
                  </h1>
                </div>
              </td>
              <td className="px-6 py-4 text-center font-black text-white">
                {item.ticketCount || 0}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => navigate(`/admin/events/${item._id}`)}
                  className="text-gray-400 hover:text-[#FF7A00] font-black uppercase text-[10px] tracking-widest transition-colors"
                >
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
            <td className="px-6 py-4 font-black tracking-widest text-[#FF7A00]">#TK-00${idx+1}</td>
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

export const UserTable = () => {
  const [selected, setSelected] = useState([]);
  const { API_URL } = useService();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/users`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.users || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (userIds) => {
      const res = await fetch(`${API_URL}/api/admin/users/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds })
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setSelected([]);
    }
  });

  const suspendMutation = useMutation({
    mutationFn: async (userIds) => {
      const res = await fetch(`${API_URL}/api/admin/users/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds })
      });
      if (!res.ok) throw new Error("Suspend failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setSelected([]);
    }
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(users.map(u => u._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="w-full">
      {/* Action Toolbar */}
      {selected.length > 0 && (
        <div className="flex justify-between items-center bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 transition-all duration-300">
          <p className="text-red-500 font-bold text-[10px] md:text-sm tracking-widest uppercase shadow-sm">
            {selected.length} users selected
          </p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => suspendMutation.mutate(selected)}
              disabled={suspendMutation.isLoading}
              className="flex items-center gap-2 hover:bg-white/[0.04] text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors duration-300 active:scale-95 border border-white/[0.08] disabled:opacity-50"
            >
              {suspendMutation.isLoading ? "Suspending..." : "Suspend"}
            </button>
            <button 
               onClick={() => deleteMutation.mutate(selected)}
               disabled={deleteMutation.isLoading}
               className="flex items-center gap-2 bg-red-500 text-white hover:bg-white hover:text-red-500 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors duration-300 shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Trash2 size={16} strokeWidth={2.5} /> {deleteMutation.isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      <table className="w-full table-fixed text-sm text-left">
        <thead className="bg-[#1C1F22] border-b border-white/[0.08]">
          <tr>
            <th className="px-6 py-4 w-12 text-center">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                onChange={handleSelectAll}
                checked={selected.length === users.length && users.length > 0}
              />
            </th>
            <th className="px-6 py-4 w-[250px] text-white font-bold uppercase tracking-wider text-[10px]">User Info</th>
            <th className="px-6 py-4 w-[160px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Role</th>
            <th className="px-6 py-4 w-[160px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Date Joined</th>
            <th className="px-6 py-4 w-[140px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Status</th>
            <th className="px-6 py-4 w-[120px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Action</th>
          </tr>
        </thead>
        <tbody className="text-gray-300 font-medium">
          {isLoading && <tr><td colSpan="6" className="text-center py-8">Loading users...</td></tr>}
          {users.map((item, idx) => (
            <tr
              key={item._id || idx}
              className={`border-b border-white/[0.04] transition-colors ${
                selected.includes(item._id)
                  ? "bg-red-500/[0.05] border-l-2 border-l-red-500"
                  : "bg-transparent hover:bg-white/[0.02]"
              }`}
            >
              <td className="px-6 py-4 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                  checked={selected.includes(item._id)}
                  onChange={() => handleSelect(item._id)}
                />
              </td>
              <td className="px-6 py-4 border-gray-300">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A1D20] border border-white/[0.08] flex justify-center items-center font-bold text-white uppercase">
                    {(item.username?.[0] || String.fromCharCode(65 + idx))}
                  </div>
                  <div>
                    <h1 className="text-sm text-white font-bold">{item.username || `User ${String.fromCharCode(65 + idx)}`}</h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{item.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <p className={`font-bold text-[10px] uppercase tracking-widest ${item.role === 'admin' ? "text-purple-400" : "text-gray-400"}`}>
                  {item.role || "General"}
                </p>
              </td>
              <td className="px-6 py-4 text-center font-bold text-gray-400">{new Date(item.createdAt || Date.now()).toISOString().split('T')[0]}</td>
              <td className="px-6 py-4 text-center">
                <div className={`w-full h-8 flex justify-center items-center border rounded-md ${item.status === 'suspended' ? "bg-red-500/10 border-red-500/20" : "bg-[#5EC750]/10 border-[#5EC750]/20"}`}>
                  <h1 className={`${item.status === 'suspended' ? "text-red-500" : "text-[#5EC750]"} font-black text-[10px] uppercase tracking-widest`}>
                    {item.status || "Active"}
                  </h1>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <button className="text-gray-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors border border-white/[0.08] px-3 py-1.5 rounded-lg active:bg-white/[0.04]">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export const MarketingTable = () => <div>MarketingTable Placeholder</div>;
export const TransactionTable = () => {
  const data = [1, 2, 3, 4, 5, 6];
  return (
    <div className="w-full">
      <table className="w-full table-fixed text-sm text-left">
        <thead className="bg-[#1C1F22] border-b border-white/[0.08]">
          <tr>
            <th className="px-6 py-4 w-[150px] text-white font-bold uppercase tracking-wider text-[10px]">Reference</th>
            <th className="px-6 py-4 w-[180px] text-white font-bold uppercase tracking-wider text-[10px]">Customer</th>
            <th className="px-6 py-4 w-[200px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Method</th>
            <th className="px-6 py-4 w-[140px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Date</th>
            <th className="px-6 py-4 w-[140px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Amount</th>
            <th className="px-6 py-4 w-[160px] text-center text-white font-bold uppercase tracking-wider text-[10px]">Status</th>
          </tr>
        </thead>
        <tbody className="text-gray-300 font-medium">
          {data.map((_, idx) => (
            <tr key={idx} className="bg-transparent hover:bg-white/[0.02] border-b border-white/[0.04] transition-colors">
              <td className="px-6 py-4 font-black tracking-widest text-[#FF7A00]">TRX-00{(idx+1)*72}</td>
              <td className="px-6 py-4 border-gray-300">
                <h1 className="text-sm text-white font-bold">Abebe Kebede {idx}</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">abebe{idx}@email.com</p>
              </td>
              <td className="px-6 py-4 text-center font-bold">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs">
                  Chapa
                </div>
              </td>
              <td className="px-6 py-4 text-center font-bold text-gray-400">Oct {24 - idx}, 2026</td>
              <td className="px-6 py-4 text-center font-black text-white">4,500 ETB</td>
              <td className="px-6 py-4 text-center">
                <div className={`w-full h-8 flex justify-center items-center rounded-md ${idx === 2 ? "bg-red-500/10 border border-red-500/20 text-red-500" : "bg-[#5EC750]/10 border border-[#5EC750]/20 text-[#5EC750]"}`}>
                  <h1 className="font-black text-[10px] uppercase tracking-widest">
                    {idx === 2 ? "Failed" : "Success"}
                  </h1>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export const RatingBreakdown = () => <div>RatingBreakdown Placeholder</div>;
export const BusinessCards = () => <div>BusinessCards Placeholder</div>;
