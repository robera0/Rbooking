import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventService } from "@/Context/ApiEvent";
import api from "@/Context/api/api.config";
import toast from "react-hot-toast";
import { CreditCard, Trash2, Plus, Edit2, CheckCircle2 } from "lucide-react";

const PaymentGateways = () => {
  const { adminSettings, adminSettingsLoading, availablePaymentMethods } =
    eventService();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    activePaymentMethods: [],
    paymentMethods: [],
  });
  const [editingMethodIndex, setEditingMethodIndex] = useState(null);

  useEffect(() => {
    if (adminSettings) {
      setFormData({
        ...formData,
        ...adminSettings,
        paymentMethods: availablePaymentMethods || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminSettings, availablePaymentMethods]);

  const togglePaymentMethod = (method) => {
    const active = formData.activePaymentMethods || [];
    if (active.includes(method)) {
      setFormData({
        ...formData,
        activePaymentMethods: active.filter((m) => m !== method),
      });
    } else {
      setFormData({ ...formData, activePaymentMethods: [...active, method] });
    }
  };

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
      toast.error(err.response?.data?.message || err.message, {
        id: "settings",
      });
    },
  });

  if (adminSettingsLoading) {
    return <div className="p-8 text-[#8a8683] animate-pulse">Loading...</div>;
  }

  const setEditing = (idx) => setEditingMethodIndex(idx);

  return (
    <div className="space-y-6">
      <div className="bg-[#1c1b1b] border border-[#5a4136]/40 rounded-xl p-6 md:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#141313] border border-[#5a4136]/40 flex items-center justify-center text-[#ff6b00]">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#e5e2e1]">
                Payment Gateways
              </h2>
              <p className="text-sm text-[#e2bfb0] opacity-70 mt-1">
                Manage the payment accounts that buyers will use to purchase
                your tickets.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {(!formData.paymentMethods ||
            formData.paymentMethods.length === 0) && (
            <p className="text-[#8a8683] text-xs italic">
              No payment methods added yet.
            </p>
          )}

          {(formData.paymentMethods || []).map((method, idx) => {
            const isActive = (formData.activePaymentMethods || []).includes(
              method.provider,
            );
            const isEditing = editingMethodIndex === idx;
            return (
              <div
                key={idx}
                className="flex flex-col lg:flex-row gap-4 lg:items-center bg-[#141313] p-5 rounded-xl border border-[#5a4136]/20"
              >
                <div className="w-full lg:w-1/4 space-y-2">
                  <label className="text-[10px] text-[#ff6b00] font-bold uppercase tracking-widest">
                    Provider
                  </label>
                  <div className="w-full bg-transparent border border-[#5a4136]/40 rounded-lg p-2 text-white font-bold text-sm opacity-80">
                    {method.provider || "Telebirr"}
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-[10px] text-[#ff6b00] font-bold uppercase tracking-widest">
                    Account / Phone Number
                  </label>
                  <input
                    value={method.accountNumber || ""}
                    disabled={!isEditing}
                    onChange={(e) => {
                      const updated = [...(formData.paymentMethods || [])];
                      updated[idx] = {
                        ...updated[idx],
                        accountNumber: e.target.value,
                      };
                      setFormData({ ...formData, paymentMethods: updated });
                    }}
                    className="w-full bg-transparent border border-[#5a4136]/40 rounded-lg p-2 text-sm text-[#e5e2e1] outline-none placeholder:text-gray-700"
                    placeholder="Enter Account Number"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-[10px] text-[#ff6b00] font-bold uppercase tracking-widest">
                    Receiver / Holder Name
                  </label>
                  <input
                    value={method.receiverName || ""}
                    disabled={!isEditing}
                    onChange={(e) => {
                      const updated = [...(formData.paymentMethods || [])];
                      updated[idx] = {
                        ...updated[idx],
                        receiverName: e.target.value,
                      };
                      setFormData({ ...formData, paymentMethods: updated });
                    }}
                    className="w-full bg-transparent border border-[#5a4136]/40 rounded-lg p-2 text-sm text-[#e5e2e1] outline-none placeholder:text-gray-700"
                    placeholder="First name only (Telebirr shows first name)"
                  />
                </div>

                <div className="lg:mt-4 flex items-center gap-2 self-end lg:self-auto">
                  <button
                    type="button"
                    onClick={() => togglePaymentMethod(method.provider)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent ${
                      isActive
                        ? "bg-[#FF7A00]"
                        : "bg-[#0f0f0f] border-[#5a4136]/40"
                    }`}
                    title={
                      isActive
                        ? "Active — tap to disable"
                        : "Disabled — tap to activate"
                    }
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    aria-label={
                      isEditing ? "Done editing" : "Edit payment method"
                    }
                    onClick={() =>
                      setEditingMethodIndex(isEditing ? null : idx)
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      isEditing
                        ? "text-green-500 hover:bg-green-500/10"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {isEditing ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <Edit2 size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    aria-label="Delete payment method"
                    onClick={() => {
                      if (!window.confirm("Delete this payment method?"))
                        return;

                      const updated = (formData.paymentMethods || []).filter(
                        (_, i) => i !== idx,
                      );
                      setFormData({ ...formData, paymentMethods: updated });

                      // keep the edit pointer correct after the list shifts
                      if (editingMethodIndex === idx) {
                        setEditingMethodIndex(null);
                      } else if (
                        editingMethodIndex !== null &&
                        editingMethodIndex > idx
                      ) {
                        setEditingMethodIndex(editingMethodIndex - 1);
                      }
                    }}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              const newMethods = [
                ...(formData.paymentMethods || []),
                { provider: "Telebirr", accountNumber: "", receiverName: "" },
              ];
              setFormData({ ...formData, paymentMethods: newMethods });
              setEditingMethodIndex(newMethods.length - 1);
            }}
            className="w-full py-4 border border-dashed border-[#5a4136]/40 rounded-xl text-[#e2bfb0] opacity-80 hover:opacity-100 hover:text-[#ff6b00] hover:border-[#ff6b00] transition-all text-xs font-bold flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add New Payment Method
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() =>
            updateMutation.mutate({
              ...formData,
              paymentMethods: (formData.paymentMethods || []).map((m) => ({
                ...m,
                receiverName: m.receiverName?.trim().split(/\s+/)[0] || "",
              })),
            })
          }
          disabled={updateMutation.isPending}
          className="px-6 py-2 bg-[#ff6b00] text-black font-bold rounded-xl"
        >
          {updateMutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default PaymentGateways;
