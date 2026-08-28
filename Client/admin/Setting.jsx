import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventService } from "@/Context/ApiEvent";
import api from "@/Context/api/api.config";
import toast from "react-hot-toast";
import { BellRing, Tag, CreditCard, CheckCircle2, Trash2, Plus, Edit2 } from "lucide-react";

// Section Header
const SectionHeader = ({ icon: Icon, title, desc }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-[#141313] border border-[#5a4136]/40 flex items-center justify-center text-[#ff6b00]">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#e5e2e1]">{title}</h2>
        <p className="text-sm text-[#e2bfb0] opacity-70 mt-1">{desc}</p>
      </div>
    </div>
  </div>
);

// Toggle Row
const ToggleRow = ({ label, desc, on, onToggle }) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-[#5a4136]/20 last:border-0 group">
    <div className="min-w-0 flex-1">
      <h3 className="text-sm font-bold text-[#e5e2e1] group-hover:text-white transition-colors">{label}</h3>
      <p className="text-xs text-[#8a8683] mt-1">{desc}</p>
    </div>
    <button
      type="button"
      onClick={() => onToggle(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        on ? "bg-[#FF7A00]" : "bg-[#141313] border-[#5a4136]/40"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

// Array Manager
const ArrayManager = ({ label, items, onChange, placeholder }) => {
  const [newItem, setNewItem] = useState("");
  const add = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onChange([...items, newItem.trim()]);
      setNewItem("");
    }
  };
  return (
    <div className="bg-[#1c1b1b] border border-[#5a4136]/40 rounded-xl p-5">
      <p className="text-xs font-semibold text-[#8a8683] mb-3">{label}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#141313] border border-[#5a4136]/40 rounded-full"
          >
            <span className="text-xs font-bold text-[#e5e2e1]">{item}</span>
            <button
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="text-[#ff6b00] hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-gray-600 italic">No items yet...</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className="flex-1 bg-[#141313] border border-[#5a4136]/40 rounded-lg px-3 py-2 text-sm text-[#e5e2e1] outline-none focus:border-[#ff6b00]"
        />
        <button
          onClick={add}
          className="px-3 bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30 rounded-lg hover:bg-[#ff6b00] hover:text-black transition-all"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

const AdminSetting = () => {
  const { adminSettings, adminSettingsLoading, availablePaymentMethods } = eventService();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    notifications: {
      adminAlerts: { newTicketPurchase: true },
      userAlerts: { ticketVerified: true, eventCancelled: true },
    },
    eventClassifications: {
      categories: [],
      genres: [],
    },
    activePaymentMethods: [],
    paymentMethods: [],
  });

  const [editingMethodIndex, setEditingMethodIndex] = useState(null);

  useEffect(() => {
    if (adminSettings) {
      setFormData({
        ...adminSettings,
        paymentMethods: availablePaymentMethods || [],
      });
    }
  }, [adminSettings, availablePaymentMethods]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put("/api/auth/admin/settings", data);
      return res.data;
    },
    onMutate: () => toast.loading("Saving settings...", { id: "settings" }),
    onSuccess: () => {
      toast.success("Settings saved successfully", { id: "settings" });
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message, { id: "settings" });
    },
  });

  if (adminSettingsLoading) {
    return <div className="p-8 text-[#8a8683] animate-pulse">Loading settings...</div>;
  }

  const setNested = (category, section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [section]: {
          ...prev[category][section],
          [field]: value,
        },
      },
    }));
  };

  const setArray = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const togglePaymentMethod = (method) => {
    const active = formData.activePaymentMethods;
    if (active.includes(method)) {
      setFormData({ ...formData, activePaymentMethods: active.filter((m) => m !== method) });
    } else {
      setFormData({ ...formData, activePaymentMethods: [...active, method] });
    }
  };

  return (
    <div className="space-y-10 w-full max-w-4xl pb-20 overflow-hidden">
      {/* Header */}
      <div className="space-y-2 mb-8 border-b border-white/[0.04] pb-6">
        <h1 className="text-2xl md:text-5xl uppercase tracking-tighter leading-none">
          Organizer <span className="text-[#FF7A00]">Settings</span>
        </h1>
        <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#FF7A00]" />
        <p className="text-sm text-[#e2bfb0] opacity-70 mt-4">
          Configure notifications, categorize your events, and manage payment gateways.
        </p>
      </div>

      {/* 1. Notifications */}
      <div className="bg-[#1c1b1b] border border-[#5a4136]/40 rounded-xl p-6 md:p-8">
        <SectionHeader
          icon={BellRing}
          title="Notification Triggers"
          desc="Control which automated alerts are sent to you or your attendees."
        />
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold text-[#ff6b00] uppercase tracking-widest mb-2">Admin Alerts</h3>
            <div className="bg-[#141313] border border-[#5a4136]/20 rounded-xl px-5">
              <ToggleRow
                label="New Ticket Purchase"
                desc="Receive an in-app alert when a user buys a ticket for your event."
                on={formData.notifications.adminAlerts.newTicketPurchase}
                onToggle={(val) => setNested("notifications", "adminAlerts", "newTicketPurchase", val)}
              />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#ff6b00] uppercase tracking-widest mb-2">User Alerts</h3>
            <div className="bg-[#141313] border border-[#5a4136]/20 rounded-xl px-5">
              <ToggleRow
                label="Ticket Verified"
                desc="Automatically notify attendees when their payment is approved."
                on={formData.notifications.userAlerts.ticketVerified}
                onToggle={(val) => setNested("notifications", "userAlerts", "ticketVerified", val)}
              />
              <ToggleRow
                label="Event Cancelled"
                desc="Automatically notify ticket holders if you cancel an event."
                on={formData.notifications.userAlerts.eventCancelled}
                onToggle={(val) => setNested("notifications", "userAlerts", "eventCancelled", val)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Event Classifications */}
      <div className="bg-[#1c1b1b] border border-[#5a4136]/40 rounded-xl p-6 md:p-8">
        <SectionHeader
          icon={Tag}
          title="Event Classifications"
          desc="Define the custom categories and genres you can select when creating a new event."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ArrayManager
            label="Event Categories"
            items={formData.eventClassifications.categories}
            onChange={(val) => setArray("eventClassifications", "categories", val)}
            placeholder="Add category (e.g. Workshop)"
          />
          <ArrayManager
            label="Music / Event Genres"
            items={formData.eventClassifications.genres}
            onChange={(val) => setArray("eventClassifications", "genres", val)}
            placeholder="Add genre (e.g. Classical)"
          />
        </div>
      </div>

      {/* 3. Payment Gateways */}
      <div className="bg-[#1c1b1b] border border-[#5a4136]/40 rounded-xl p-6 md:p-8">
        <SectionHeader
          icon={CreditCard}
          title="Payment Gateways"
          desc="Manage the payment accounts that buyers will use to purchase your tickets."
        />
        <div className="space-y-6">
          {(!formData.paymentMethods || formData.paymentMethods.length === 0) && (
            <p className="text-[#8a8683] text-xs italic">No payment methods added yet.</p>
          )}
          {(formData.paymentMethods || []).map((method, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-4 sm:items-center bg-[#141313] p-5 rounded-xl border border-[#5a4136]/20">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] text-[#ff6b00] font-bold uppercase tracking-widest">Provider</label>
                <select
                  value={method.provider}
                  disabled={editingMethodIndex !== idx}
                  onChange={(e) => {
                    const updated = [...formData.paymentMethods];
                    updated[idx].provider = e.target.value;
                    setFormData({ ...formData, paymentMethods: updated });
                  }}
                  className="w-full bg-transparent border-none text-white font-bold outline-none cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option className="bg-[#141313]" value="Telebirr">Telebirr</option>
                  <option className="bg-[#141313]" value="CBE">CBE</option>
                  <option className="bg-[#141313]" value="Awash">Awash</option>
                  <option className="bg-[#141313]" value="Dashen">Dashen</option>
                  <option className="bg-[#141313]" value="BOA">Bank of Abyssinia</option>
                </select>
              </div>
              <div className="flex-[2] space-y-2">
                <label className="text-[10px] text-[#ff6b00] font-bold uppercase tracking-widest">Account Number</label>
                <input
                  value={method.accountNumber}
                  disabled={editingMethodIndex !== idx}
                  onChange={(e) => {
                    const updated = [...formData.paymentMethods];
                    updated[idx].accountNumber = e.target.value;
                    setFormData({ ...formData, paymentMethods: updated });
                  }}
                  className="w-full bg-transparent border-none text-[#ff6b00] font-bold outline-none placeholder:text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter Account Number"
                />
              </div>
              <div className="sm:mt-4 flex items-center gap-1 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMethodIndex(editingMethodIndex === idx ? null : idx);
                  }}
                  className="text-gray-400 hover:text-white p-2 transition-colors"
                >
                  {editingMethodIndex === idx ? <CheckCircle2 size={16} className="text-green-500" /> : <Edit2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = formData.paymentMethods.filter((_, i) => i !== idx);
                    setFormData({ ...formData, paymentMethods: updated });
                    if (editingMethodIndex === idx) setEditingMethodIndex(null);
                  }}
                  className="text-red-500 hover:text-red-400 p-2 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const newMethods = [
                ...(formData.paymentMethods || []),
                { provider: "Telebirr", accountNumber: "" },
              ];
              setFormData({
                ...formData,
                paymentMethods: newMethods,
              });
              setEditingMethodIndex(newMethods.length - 1);
            }}
            className="w-full py-4 border border-dashed border-[#5a4136]/40 rounded-xl text-[#e2bfb0] opacity-80 hover:opacity-100 hover:text-[#ff6b00] hover:border-[#ff6b00] transition-all text-xs font-bold flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add New Payment Method
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => updateMutation.mutate(formData)}
          disabled={updateMutation.isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#ff6b00] text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-[#ff8533] transition-colors disabled:opacity-50"
        >
          <CheckCircle2 size={16} />
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default AdminSetting;
