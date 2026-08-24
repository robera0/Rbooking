import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, MapPin, Calendar, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import api from "../src/Context/api/api.config";

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  caretColor: "#FF7A00",
  colorScheme: "dark",
};

const inputFocusStyle = { borderColor: "rgba(255,122,0,0.5)" };
const inputBlurStyle = { borderColor: "rgba(255,255,255,0.08)" };

const FieldInput = ({
  icon: Icon,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required,
  className = "",
  style = {},
}) => (
  <div className="relative">
    {Icon && (
      <Icon
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: "#c9a88a" }}
      />
    )}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`w-full ${
        Icon ? "pl-11" : "pl-5"
      } pr-5 py-4 rounded-2xl text-white text-sm outline-none transition-colors ${className}`}
      style={{ ...inputStyle, ...style }}
      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
      onBlur={(e) => Object.assign(e.target.style, inputBlurStyle)}
    />
  </div>
);

const Label = ({ children }) => (
  <label
    className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2"
    style={{ color: "#c9a88a" }}
  >
    {children}
  </label>
);

const CompleteProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setIsLoggedIn } = useService();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    city: "",
    dateOfBirth: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const completeProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/api/auth/complete-profile`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Profile Completed Successfully!");
      setIsLoggedIn(true);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.city) {
      return toast.error("Please fill all required fields");
    }
    completeProfileMutation.mutate(formData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "#0c0d0e" }}
    >
      {/* Dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1f2023 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.5,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xl flex flex-col gap-8"
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="w-12 h-12 flex items-center justify-center mb-2">
            <LayoutDashboard className="w-8 h-8 text-[#FF7A00]" />
          </div>
          <h1 className="text-2xl font-black text-white">
            Complete Your Profile
          </h1>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Please provide a few details to finish setting up your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <Label>Full Name *</Label>
              <FieldInput
                icon={User}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label>Phone Number *</Label>
              <FieldInput
                icon={Phone}
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+251..."
                required
              />
            </div>

            <div>
              <Label>City *</Label>
              <FieldInput
                icon={MapPin}
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Addis Ababa"
                required
              />
            </div>

            <div>
              <Label>Date of Birth (Optional)</Label>
              <FieldInput
                icon={Calendar}
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                placeholder=""
              />
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={completeProfileMutation.isPending}
              className="w-full sm:w-2/3 md:w-1/2 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "#FF7A00",
                color: "#000",
              }}
            >
              {completeProfileMutation.isPending ? (
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: "rgba(0,0,0,0.2)",
                    borderTopColor: "#000",
                  }}
                />
              ) : (
                "Complete Profile"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
