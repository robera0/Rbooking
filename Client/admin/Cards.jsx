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
  ChevronDown,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useService } from "../src/Context/ServiceContext";
import { renderTableSkeleton } from "./../src/components/Reusable";
import { useAdminEventService } from "@/Context/EventAdminContest";
import { Toaster } from "react-hot-toast";
import api from "../src/Context/api/api.config";
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
      <div className="w-full h-full app-surface border border-white/[0.04] rounded-[2rem] p-6 shadow-xl animate-pulse min-h-[160px]"></div>
    );
  }
  return (
    <div className="w-full min-w-[240px] flex-1 app-surface border border-white/[0.04] rounded-[2rem] p-6 shadow-xl hover:shadow-[#FF7A00]/5 hover:border-white/[0.1] transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
            {header}
          </h3>
          <h1 className="text-3xl lg:text-4xl text-white font-black tracking-tighter">
            {num}
          </h1>
        </div>
        <div
          className={`w-12 h-12 flex justify-center items-center ${
            bg || "bg-white/[0.04]"
          } rounded-xl group-hover:scale-110 transition-transform duration-300`}
        >
          {topicons}
        </div>
      </div>
      {/*Status */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
        <div
          className={
            percent_change?.includes("-") ? "text-red-500" : "app-success"
          }
        >
          {bottomIcon}
        </div>
        <p
          className={`text-[10px] font-black tracking-widest ${
            percent_change?.includes("-") ? "text-red-500" : "app-success"
          }`}
        >
          {percent_change}
        </p>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
          {daily_diff}
        </p>
      </div>
    </div>
  );
};

export const SearchInput = ({
  placeholder,
  value,
  onChange,
  w = "w-full",
  h = "h-12 md:h-14",
  top = "top-1/2 -translate-y-1/2",
  left = "left-5",
}) => {
  return (
    <div className={`relative ${w}`}>
      <button
        className={`absolute ${top} ${left} flex justify-center cursor-pointer`}
      >
        <Search
          className="text-gray-500 w-4 h-4 md:w-5 md:h-5 hover:text-[#FF7A00] transition-colors"
          strokeWidth={2.5}
        />
      </button>
      <input
        className={`w-full ${h} pl-12 md:pl-14 pr-6 bg-[var(--color-surface-elevated)] text-white font-bold text-xs md:text-sm rounded-[1.5rem] md:rounded-full border border-white/[0.06] focus:border-[#FF7A00]/50 outline-none transition-all placeholder:text-gray-600`}
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
}) => {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative min-w-[160px]">
        <Listbox.Button className="h-12 px-6 flex justify-center items-center bg-[#1A1D20] text-white rounded-full gap-2 border border-white/[0.06] hover:border-[#FF7A00]/50 transition-colors outline-none">
          {Icon && <Icon size={16} className="text-gray-500" />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {options.find((o) => o.value === value)?.label || placeholder}
          </span>
          <ChevronDown size={14} className="text-gray-500 ml-1" />
        </Listbox.Button>
        <AnimatePresence>
          <Listbox.Options
            as={motion.div}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] mt-2 w-full bg-[#1C1F22] border border-white/[0.1] rounded-2xl shadow-2xl py-2 outline-none overflow-hidden backdrop-blur-3xl"
          >
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  `px-6 py-3 cursor-pointer transition-colors ${
                    active
                      ? "bg-[#FF7A00] text-black"
                      : "text-gray-400 hover:text-white"
                  }`
                }
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        selected ? "text-inherit" : ""
                      }`}
                    >
                      {option.label}
                    </span>
                    {selected && <Check size={14} />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </AnimatePresence>
      </div>
    </Listbox>
  );
};

export const EventTable = ({ search = "", filter = "" }) => {
  const { selected, setSelected, events, isLoading, deleteMutation } =
    useAdminEventService();
  const navigate = useNavigate();

  const getRowKey = (ev, idx) => ev?._id || `row-${idx}`;

  const handleSelect = (key) => {
    if (!key) return;
    if (selected.includes(key)) {
      setSelected(selected.filter((item) => item !== key));
    } else {
      setSelected([...selected, key]);
    }
  };

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      setSelected(filteredEvents?.map((ev, idx) => getRowKey(ev, idx)));
    } else {
      setSelected([]);
    }
  };

  const filteredEvents = events?.filter((ev) => {
    const matchesSearch =
      ev?.name?.toLowerCase().includes(search.toLowerCase()) ||
      ev?.locale?.toLowerCase().includes(search.toLowerCase()) ||
      ev?.links?.venues?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter
      ? ev.type?.toLowerCase() === filter.toLowerCase()
      : true;
    return matchesSearch && matchesFilter;
  });

  const allSelected =
    (filteredEvents?.length ?? 0) > 0 &&
    filteredEvents.every((ev, idx) => selected.includes(getRowKey(ev, idx)));

  const someSelected = selected.length > 0 && !allSelected;

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
            <Trash2 size={16} strokeWidth={2.5} />{" "}
            {deleteMutation.isLoading ? "Deleting..." : "Delete Selected"}
          </button>
        </div>
      )}

      <table className="w-full min-w-[800px] table-fixed text-sm text-left">
        <thead className="bg-[#1C1F22] border-b border-white/[0.08]">
          <tr>
            <th className="px-6 py-4 w-12 text-center">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={handleSelectAll}
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
            <th className="px-6 py-4 w-[160px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              QR
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-300 font-medium">
          {isLoading && (
            <tr>
              <td colSpan="7" className="text-center py-8">
                Loading events...
              </td>
            </tr>
          )}
          {!isLoading && !filteredEvents?.length && (
            <tr>
              <td colSpan="7" className="px-6 py-10">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] py-10 text-center">
                  <p className="text-sm font-semibold text-white">
                    No event created.
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Create your first event to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/events/add")}
                    className="mt-4 rounded-full app-brand-bg px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-white"
                  >
                    Create Event
                  </button>
                </div>
              </td>
            </tr>
          )}
          {filteredEvents?.map((item, idx) => {
            const rowKey = getRowKey(item, idx);
            return (
              <tr
                key={rowKey}
                className={`border-b border-white/[0.04] transition-colors ${
                  selected.includes(rowKey)
                    ? "bg-red-500/[0.05] border-l-2 border-l-red-500"
                    : "bg-transparent hover:bg-white/[0.02]"
                }`}
              >
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                    checked={selected.includes(rowKey)}
                    onChange={() => handleSelect(rowKey)}
                  />
                </td>
                <td className="px-6 py-4 border-gray-300">
                  <h1 className="text-sm text-white font-bold truncate w-40">
                    {item?.name}
                  </h1>
                  <p className="text-[10px] text-[#FF7A00] uppercase tracking-widest mt-1">
                    {item?.type || "Concert"}
                  </p>
                </td>
                <td className="px-6 py-4 text-center font-bold">
                  {item?.links?.venues?.name || item?.locale || "N/A"}
                </td>
                <td className="px-6 py-4 text-center font-bold text-gray-400">
                  {item?.dates?.start?.localDate || "N/A"}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="w-full h-8 flex justify-center items-center app-success-soft app-success-border rounded-md border">
                    <h1 className="app-success font-black text-[10px] uppercase tracking-widest">
                      Active
                    </h1>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-black text-white">
                  {item?.ticketCount || 0}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => navigate(`/admin/events/${item?._id}`)}
                    className="text-gray-400 hover:text-[#FF7A00] font-black uppercase text-[10px] tracking-widest transition-colors"
                  >
                    Manage
                  </button>
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => navigate(`/admin/events/${item?._id}/qr`)}
                    className="text-gray-400 hover:text-[#FF7A00] font-black uppercase text-[10px] tracking-widest transition-colors"
                  >
                   Get QR
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const TicketTable = ({ search = "", filter = "" }) => {
  const navigate = useNavigate();
  const { API_URL } = useService();
  const [selected, setSelected] = useState([]);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["adminTransactions"],
    queryFn: async () => {
      const res = await api.get(`/api/auth/admin/analytics/transactions`);
      return res.data.transactions || [];
    },
  });

  const filteredTransactions = transactions.filter((txn) => {
    const userObj = txn.user?.[0];
    const custName = (
      userObj?.fullName ||
      userObj?.username ||
      "Guest"
    ).toLowerCase();
    const idKey = (txn.orderNo || txn._id || "").toLowerCase();

    const matchesSearch =
      custName.includes(search.toLowerCase()) ||
      idKey.includes(search.toLowerCase());

    const matchesFilter = filter
      ? txn.status?.toLowerCase() === filter.toLowerCase()
      : true;

    return matchesSearch && matchesFilter;
  });

  const getRowKey = (txn, idx) => txn._id || `row-${idx}`;

  const handleSelect = (key) => {
    if (!key) return;
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredTransactions.map((txn, idx) => getRowKey(txn, idx)));
    } else {
      setSelected([]);
    }
  };

  const allSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((txn, idx) =>
      selected.includes(getRowKey(txn, idx)),
    );

  const someSelected = selected.length > 0 && !allSelected;

  const statusStyles = {
    pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    completed: "bg-green-500/10 text-green-400 border border-green-500/20",
    failed: "bg-red-500/10 text-red-400 border border-red-500/20",
    cancelled: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  };

  return (
    <table className="w-full min-w-[900px] table-fixed text-sm text-left">
      <thead className="bg-[#1C1F22] border-b border-white/[0.08]">
        <tr>
          <th className="px-6 py-4 w-12 text-center">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={handleSelectAll}
            />
          </th>
          <th className="px-6 py-4 w-[190px] text-white font-bold uppercase tracking-wider text-[10px]">
            Order ID
          </th>
          <th className="px-6 py-4 w-[180px] text-white font-bold uppercase tracking-wider text-[10px]">
            Customer
          </th>
          <th className="px-6 py-4 w-[160px] text-white font-bold uppercase tracking-wider text-[10px]">
            Event
          </th>
          <th className="px-6 py-4 w-[130px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
            Ticket Level
          </th>
          <th className="px-6 py-4 w-[120px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
            Date
          </th>
          <th className="px-6 py-4 w-[110px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
            Total
          </th>
          <th className="px-6 py-4 w-[120px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
            Status
          </th>
          <th className="px-6 py-4 w-[100px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
            Action
          </th>
        </tr>
      </thead>
      <tbody className="text-gray-300 font-medium">
        {isLoading && renderTableSkeleton()}
        {!isLoading && filteredTransactions.length === 0 && (
          <tr>
            <td
              colSpan={9}
              className="px-6 py-12 text-center text-gray-500 text-sm"
            >
              No transactions found.
            </td>
          </tr>
        )}
        {filteredTransactions.map((txn, idx) => {
          const rowKey = getRowKey(txn, idx);
          const userObj = txn.user?.[0];
          const ticket = txn.ticket;
          const event = txn.event;
          const status = txn.status?.toLowerCase() || "pending";
          const isSelected = selected.includes(rowKey);

          return (
            <tr
              key={rowKey}
              className={`border-b border-white/[0.04] transition-colors ${
                isSelected
                  ? "bg-[#FF7A00]/[0.04] border-l-2 border-l-[#FF7A00]"
                  : "bg-transparent hover:bg-white/[0.02]"
              }`}
            >
              {/* Checkbox */}
              <td className="px-6 py-4 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                  checked={isSelected}
                  onChange={() => handleSelect(rowKey)}
                />
              </td>

              {/* Order ID */}
              <td className="px-6 py-4">
                <span className="font-black tracking-widest text-[#FF7A00] text-[10px] whitespace-nowrap">
                  #{txn.orderNo || txn._id?.slice(-8).toUpperCase()}
                </span>
              </td>

              {/* Customer */}
              <td className="px-6 py-4">
                <p className="font-bold text-white truncate">
                  {userObj?.fullName || userObj?.username || "Guest"}
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  {userObj?.email || ""}
                </p>
              </td>

              {/* Event */}
              <td className="px-6 py-4">
                <p className="font-bold text-white truncate">
                  {event?.name || "—"}
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  {event?.artist?.name || ""}
                </p>
              </td>

              {/* Ticket Level */}
              <td className="px-6 py-4 text-center">
                <span className="font-bold text-white">
                  {ticket?.name || "General"}
                </span>
                <p className="text-[11px] text-gray-500">
                  qty: {txn.quantity ?? 1}
                </p>
              </td>

              {/* Date */}
              <td className="px-6 py-4 text-center font-bold text-gray-400 text-[11px]">
                {txn.purchasedAt
                  ? new Date(txn.purchasedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>

              {/* Total */}
              <td className="px-6 py-4 text-center font-black text-white">
                {txn.totalAmount?.toLocaleString()} ETB
              </td>

              {/* Status */}
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    statusStyles[status] || statusStyles.pending
                  }`}
                >
                  {txn.status}
                </span>
              </td>

              {/* Action */}
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => navigate(`/admin/orders/${txn._id}`)}
                  className="text-gray-400 hover:text-[#FF7A00] font-black uppercase text-[10px] tracking-widest transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
export const UserTable = ({ onEdit, search = "", filter = "" }) => {
  const [selected, setSelected] = useState([]);
  const { API_URL } = useService();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await api.get(`/api/auth/admin/users`);
      return res.data.users || [];
    },
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter
      ? u.status?.toLowerCase() === filter.toLowerCase()
      : true;
    return matchesSearch && matchesFilter;
  });

  const deleteMutation = useMutation({
    mutationFn: async (userIds) => {
      await api.post(`/api/auth/admin/users/delete`, { userIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setSelected([]);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (userIds) => {
      await api.post(`/api/auth/admin/users/suspend`, { userIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setSelected([]);
    },
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredUsers.map((u) => u._id));
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
              <Trash2 size={16} strokeWidth={2.5} />{" "}
              {deleteMutation.isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      <table className="w-full min-w-[800px] table-fixed text-sm text-left">
        <thead className="bg-[#1C1F22] border-b border-white/[0.08]">
          <tr>
            <th className="px-6 py-4 w-12 text-center">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                onChange={handleSelectAll}
                checked={
                  selected.length === filteredUsers.length &&
                  filteredUsers.length > 0
                }
              />
            </th>
            <th className="px-6 py-4 w-[250px] text-white font-bold uppercase tracking-wider text-[10px]">
              User Info
            </th>
            <th className="px-6 py-4 w-[160px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Role
            </th>
            <th className="px-6 py-4 w-[160px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Date Joined
            </th>
            <th className="px-6 py-4 w-[140px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Status
            </th>
            <th className="px-6 py-4 w-[120px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-300 font-medium">
          {isLoading && (
            <tr>
              <td colSpan="6" className="text-center py-8">
                Loading users...
              </td>
            </tr>
          )}
          {filteredUsers.map((item, idx) => (
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
                    {item.username?.[0] || String.fromCharCode(65 + idx)}
                  </div>
                  <div>
                    <h1 className="text-sm text-white font-bold">
                      {item.username || `User ${String.fromCharCode(65 + idx)}`}
                    </h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                      {item.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <p
                  className={`font-bold text-[10px] uppercase tracking-widest ${
                    item.role === "admin" ? "text-purple-400" : "text-gray-400"
                  }`}
                >
                  {item.role || "General"}
                </p>
              </td>
              <td className="px-6 py-4 text-center font-bold text-gray-400">
                {
                  new Date(item.createdAt || Date.now())
                    .toISOString()
                    .split("T")[0]
                }
              </td>
              <td className="px-6 py-4 text-center">
                <div
                  className={`w-full h-8 flex justify-center items-center border rounded-md 
                  ${
                    item.status === "banned"
                      ? "bg-red-500/10 border-red-500/20"
                      : item.status === "suspended"
                      ? "bg-yellow-500/10 border-yellow-500/20"
                      : "bg-[#5EC750]/10 border-[#5EC750]/20"
                  }`}
                >
                  <h1
                    className={`font-black text-[10px] uppercase tracking-widest
                    ${
                      item.status === "banned"
                        ? "text-red-500"
                        : item.status === "suspended"
                        ? "text-yellow-500"
                        : "text-[#5EC750]"
                    }`}
                  >
                    {item.status || "Active"}
                  </h1>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onEdit && onEdit(item)}
                  className="text-gray-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors border border-white/[0.08] px-3 py-1.5 rounded-lg active:bg-white/[0.04]"
                >
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
export const TransactionTable = ({ search = "", filter = "" }) => {
  const allData = [
    {
      ref: "TRX-0072",
      customer: "Abebe Kebede",
      email: "abebe@email.com",
      method: "Chapa",
      date: "Oct 24, 2026",
      amount: "4,500 ETB",
      status: "success",
    },
    {
      ref: "TRX-0144",
      customer: "Bekele Molla",
      email: "bekele@email.com",
      method: "Chapa",
      date: "Oct 23, 2026",
      amount: "2,200 ETB",
      status: "success",
    },
    {
      ref: "TRX-0216",
      customer: "Sara Tesfaye",
      email: "sara@email.com",
      method: "Telebirr",
      date: "Oct 22, 2026",
      amount: "1,500 ETB",
      status: "failed",
    },
    {
      ref: "TRX-0288",
      customer: "Dawit Girma",
      email: "dawit@email.com",
      method: "CBE",
      date: "Oct 21, 2026",
      amount: "3,800 ETB",
      status: "success",
    },
    {
      ref: "TRX-0360",
      customer: "Helen Tadesse",
      email: "helen@email.com",
      method: "Chapa",
      date: "Oct 20, 2026",
      amount: "5,000 ETB",
      status: "success",
    },
    {
      ref: "TRX-0432",
      customer: "Yonas Alemu",
      email: "yonas@email.com",
      method: "Telebirr",
      date: "Oct 19, 2026",
      amount: "900 ETB",
      status: "failed",
    },
  ];

  const filteredData = allData.filter((item) => {
    const matchesSearch =
      item.ref.toLowerCase().includes(search.toLowerCase()) ||
      item.customer.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter
      ? item.status.toLowerCase() === filter.toLowerCase()
      : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full">
      <table className="w-full min-w-[750px] table-fixed text-sm text-left">
        <thead className="bg-[#1C1F22] border-b border-white/[0.08]">
          <tr>
            <th className="px-6 py-4 w-[150px] text-white font-bold uppercase tracking-wider text-[10px]">
              Reference
            </th>
            <th className="px-6 py-4 w-[180px] text-white font-bold uppercase tracking-wider text-[10px]">
              Customer
            </th>
            <th className="px-6 py-4 w-[200px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Method
            </th>
            <th className="px-6 py-4 w-[140px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Date
            </th>
            <th className="px-6 py-4 w-[140px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Amount
            </th>
            <th className="px-6 py-4 w-[160px] text-center text-white font-bold uppercase tracking-wider text-[10px]">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-300 font-medium">
          {filteredData.map((item, idx) => (
            <tr
              key={idx}
              className="bg-transparent hover:bg-white/[0.02] border-b border-white/[0.04] transition-colors"
            >
              <td className="px-6 py-4 font-black tracking-widest text-[#FF7A00]">
                {item.ref}
              </td>
              <td className="px-6 py-4 border-gray-300">
                <h1 className="text-sm text-white font-bold">
                  {item.customer}
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                  {item.email}
                </p>
              </td>
              <td className="px-6 py-4 text-center font-bold">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs">
                  {item.method}
                </div>
              </td>
              <td className="px-6 py-4 text-center font-bold text-gray-400">
                {item.date}
              </td>
              <td className="px-6 py-4 text-center font-black text-white">
                {item.amount}
              </td>
              <td className="px-6 py-4 text-center">
                <div
                  className={`w-full h-8 flex justify-center items-center rounded-md ${
                    item.status === "failed"
                      ? "bg-red-500/10 border border-red-500/20 text-red-500"
                      : "bg-[#5EC750]/10 border border-[#5EC750]/20 text-[#5EC750]"
                  }`}
                >
                  <h1 className="font-black text-[10px] uppercase tracking-widest">
                    {item.status}
                  </h1>
                </div>
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="py-20 text-center text-gray-500 font-black uppercase tracking-widest text-[10px]"
              >
                No transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export const RatingBreakdown = () => <div>RatingBreakdown Placeholder</div>;
export const BusinessCards = () => <div>BusinessCards Placeholder</div>;
