import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  MapPin,
  FileText,
  LayoutDashboard,
  Briefcase,
  FileBadge2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";

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
  children,
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
    {children}
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

const SectionHeading = ({ icon: Icon, number, title }) => (
  <div
    className="flex items-center gap-3 pb-4 mb-2"
    style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
  >
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{
        background: "rgba(255,122,0,0.15)",
        border: "1px solid rgba(255,122,0,0.25)",
      }}
    >
      <Icon className="w-4 h-4" style={{ color: "#FF7A00" }} />
    </div>
    <h2
      className="text-sm font-black uppercase tracking-[0.15em]"
      style={{ color: "rgba(255,255,255,0.85)" }}
    >
      {number}. {title}
    </h2>
  </div>
);

const calculatePasswordStrength = (pass) => {
  if (!pass) return 0;
  let strength = 0;
  if (pass.length > 7) strength += 25;
  if (pass.match(/[A-Z]/)) strength += 25;
  if (pass.match(/[0-9]/)) strength += 25;
  if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
  return strength;
};

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { API_URL } = useService();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    businessType: "",
    businessRegistrationNumber: "",
    taxId: "",
    country: "",
    city: "",
    region: "",
    streetAddress: "",
    twoFactorEnabled: false,
    termsAccepted: false,
    privacyAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const strengthColor = (idx) => {
    const filled = passwordStrength > idx * 25;
    if (!filled) return "rgba(255,255,255,0.08)";
    if (passwordStrength <= 25) return "#ef4444";
    if (passwordStrength <= 50) return "#f97316";
    if (passwordStrength <= 75) return "#f97316";
    return "#22c55e";
  };

  const registerAdminMutation = useMutation({
    mutationFn: async (payload) => {
      const form = new FormData();
      form.append("username", payload.email);
      form.append("email", payload.email);
      form.append("password", payload.password);
      form.append("firstName", payload.firstName);
      form.append("lastName", payload.lastName);
      form.append("phone", payload.phone);
      form.append("organizationName", payload.organizationName);
      form.append("businessType", payload.businessType);
      form.append(
        "businessRegistrationNumber",
        payload.businessRegistrationNumber,
      );
      form.append("taxId", payload.taxId);
      form.append("country", payload.country);
      form.append("city", payload.city);
      form.append("region", payload.region);
      form.append("streetAddress", payload.streetAddress);
      form.append("adminRole", payload.adminRole || "event_manager");
      form.append("twoFactorEnabled", String(payload.twoFactorEnabled));

      const res = await fetch(`${API_URL}/api/auth/signup/admin`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to register admin");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Admin Registered Successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        organizationName: "",
        businessType: "",
        businessRegistrationNumber: "",
        taxId: "",
        country: "",
        city: "",
        region: "",
        streetAddress: "",
        twoFactorEnabled: false,
        termsAccepted: false,
        privacyAccepted: false,
      });
      setTimeout(() => navigate("/admin/dashboard"), 2000);
    },
    onError: (error) => {
      toast.error(`Registration failed: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.organizationName ||
      !formData.businessType ||
      !formData.country ||
      !formData.city ||
      !formData.region ||
      !formData.streetAddress ||
      !formData.termsAccepted ||
      !formData.privacyAccepted
    ) {
      return toast.error("Please fill all required fields");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    registerAdminMutation.mutate({
      ...formData,
      adminRole: "event_manager",
    });
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    cursor: "pointer",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "#0c0d0e" }}
    >
      <Toaster />

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
        className="relative z-10 w-full max-w-2xl flex flex-col gap-8"
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
            style={{
              background: "rgba(255,122,0,0.15)",
              border: "1px solid rgba(255,122,0,0.25)",
            }}
          >
            <LayoutDashboard className="w-6 h-6" style={{ color: "#FF7A00" }} />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Registration</h1>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Create your admin account to manage events and tickets securely and
            professionally.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          {/* SECTION 1 — Personal Information */}
          <section className="flex flex-col gap-5">
            <SectionHeading
              icon={User}
              number="1"
              title="Personal Information"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>First Name *</Label>
                <FieldInput
                  icon={User}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <FieldInput
                  icon={User}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <Label>Email Address *</Label>
                <FieldInput
                  icon={Mail}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <FieldInput
                  icon={Phone}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label>Password *</Label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "#c9a88a" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-4 rounded-2xl text-white text-sm outline-none transition-colors"
                    style={inputStyle}
                    onFocus={(e) =>
                      Object.assign(e.target.style, inputFocusStyle)
                    }
                    onBlur={(e) =>
                      Object.assign(e.target.style, inputBlurStyle)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 flex gap-1 h-1 rounded-full overflow-hidden">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-full transition-all duration-300"
                        style={{ background: strengthColor(i) }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label>Confirm Password *</Label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "#c9a88a" }}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-4 rounded-2xl text-white text-sm outline-none transition-colors"
                    style={{
                      ...inputStyle,
                      borderColor:
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword
                          ? "rgba(239,68,68,0.5)"
                          : "rgba(255,255,255,0.08)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor =
                        formData.password !== formData.confirmPassword
                          ? "rgba(239,68,68,0.7)"
                          : "rgba(255,122,0,0.5)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor =
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword
                          ? "rgba(239,68,68,0.5)"
                          : "rgba(255,255,255,0.08)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p
                      className="text-xs mt-1 flex items-center gap-1"
                      style={{ color: "#f87171" }}
                    >
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </p>
                  )}
              </div>
            </div>
          </section>

          {/* SECTION 2 — Organization Information */}
          <section className="flex flex-col gap-5">
            <SectionHeading
              icon={Building2}
              number="2"
              title="Organization Information"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label>Organization Name *</Label>
                <FieldInput
                  icon={Building2}
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="Acme Events LLC"
                  required
                />
              </div>

              <div>
                <Label>Business Type *</Label>
                <div className="relative">
                  <Briefcase
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "#c9a88a" }}
                  />
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-5 py-4 rounded-2xl text-white text-sm outline-none transition-colors"
                    style={selectStyle}
                    onFocus={(e) =>
                      Object.assign(e.target.style, inputFocusStyle)
                    }
                    onBlur={(e) =>
                      Object.assign(e.target.style, inputBlurStyle)
                    }
                  >
                    <option value="" disabled style={{ background: "#1a1b1e" }}>
                      Select business type
                    </option>
                    <option
                      value="event_manager"
                      style={{ background: "#1a1b1e" }}
                    >
                      Event Manager
                    </option>
                    <option
                      value="Venue Owner"
                      style={{ background: "#1a1b1e" }}
                    >
                      Venue Owner
                    </option>
                    <option
                      value="ticket_manager"
                      style={{ background: "#1a1b1e" }}
                    >
                      Ticket Reseller
                    </option>
                    <option
                      value="Festival Organizer"
                      style={{ background: "#1a1b1e" }}
                    >
                      Festival Organizer
                    </option>
                    <option
                      value="corporate_events"
                      style={{ background: "#1a1b1e" }}
                    >
                      Corporate Events
                    </option>
                    <option
                      value="Sports Organizer"
                      style={{ background: "#1a1b1e" }}
                    >
                      Sports Organizer
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Business Registration Number</Label>
                <FieldInput
                  icon={FileBadge2}
                  name="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={handleChange}
                  placeholder="Reg No."
                />
                <p
                  className="text-[11px] mt-1.5"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Optional for individual organizers
                </p>
              </div>

              <div>
                <Label>Tax ID / VAT</Label>
                <FieldInput
                  icon={FileText}
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="Tax reference"
                />
              </div>
            </div>
          </section>

          {/* SECTION 3 — Address Information */}
          <section className="flex flex-col gap-5">
            <SectionHeading
              icon={MapPin}
              number="3"
              title="Address Information"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Country *</Label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none transition-colors"
                  style={selectStyle}
                  onFocus={(e) =>
                    Object.assign(e.target.style, inputFocusStyle)
                  }
                  onBlur={(e) => Object.assign(e.target.style, inputBlurStyle)}
                >
                  <option value="" disabled style={{ background: "#1a1b1e" }}>
                    Select Country
                  </option>
                  <option value="US" style={{ background: "#1a1b1e" }}>
                    United States
                  </option>
                  <option value="UK" style={{ background: "#1a1b1e" }}>
                    United Kingdom
                  </option>
                  <option value="CA" style={{ background: "#1a1b1e" }}>
                    Canada
                  </option>
                  <option value="AU" style={{ background: "#1a1b1e" }}>
                    Australia
                  </option>
                  <option value="GE" style={{ background: "#1a1b1e" }}>
                    Germany
                  </option>
                  <option value="FR" style={{ background: "#1a1b1e" }}>
                    France
                  </option>
                  <option value="KE" style={{ background: "#1a1b1e" }}>
                    Kenya
                  </option>
                  <option value="ZA" style={{ background: "#1a1b1e" }}>
                    South Africa
                  </option>
                  <option value="ET" style={{ background: "#1a1b1e" }}>
                    Ethiopia
                  </option>
                </select>
              </div>

              <div>
                <Label>Region / State *</Label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  placeholder="Region or Province"
                  className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) =>
                    Object.assign(e.target.style, inputFocusStyle)
                  }
                  onBlur={(e) => Object.assign(e.target.style, inputBlurStyle)}
                />
              </div>

              <div>
                <Label>City *</Label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="City name"
                  className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) =>
                    Object.assign(e.target.style, inputFocusStyle)
                  }
                  onBlur={(e) => Object.assign(e.target.style, inputBlurStyle)}
                />
              </div>

              <div>
                <Label>Street Address *</Label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  required
                  placeholder="123 Organizer Street"
                  className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) =>
                    Object.assign(e.target.style, inputFocusStyle)
                  }
                  onBlur={(e) => Object.assign(e.target.style, inputBlurStyle)}
                />
              </div>
            </div>
          </section>

          {/* SECTION 4 — Security & Agreement */}
          <section
            className="flex flex-col gap-5 p-6 rounded-2xl"
            style={{
              background: "rgba(255,122,0,0.04)",
              border: "1px solid rgba(255,122,0,0.12)",
            }}
          >
            {/* 2FA Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">
                  Enable Two-Factor Authentication (2FA)
                </p>
                <p
                  className="text-[12px] mt-0.5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Secure your admin account with an extra layer of protection.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  name="twoFactorEnabled"
                  checked={formData.twoFactorEnabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 rounded-full relative transition-all peer-checked:bg-orange-500"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <div
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"
                    style={{
                      transform: formData.twoFactorEnabled
                        ? "translateX(20px)"
                        : "translateX(0)",
                      background: formData.twoFactorEnabled
                        ? "#fff"
                        : "rgba(255,255,255,0.7)",
                    }}
                  />
                </div>
              </label>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />

            {/* Checkboxes */}
            <div className="flex flex-col gap-3">
              {[
                {
                  name: "termsAccepted",
                  checked: formData.termsAccepted,
                  label: (
                    <>
                      I accept the{" "}
                      <a
                        href="#"
                        style={{ color: "#FF7A00" }}
                        className="font-bold hover:underline"
                      >
                        Terms & Conditions
                      </a>{" "}
                      for organizing events on this platform.{" "}
                      <span style={{ color: "#f87171" }}>*</span>
                    </>
                  ),
                },
                {
                  name: "privacyAccepted",
                  checked: formData.privacyAccepted,
                  label: (
                    <>
                      I agree to the{" "}
                      <a
                        href="#"
                        style={{ color: "#FF7A00" }}
                        className="font-bold hover:underline"
                      >
                        Privacy Policy
                      </a>{" "}
                      and data usage agreements.{" "}
                      <span style={{ color: "#f87171" }}>*</span>
                    </>
                  ),
                },
              ].map((item) => (
                <label
                  key={item.name}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="relative flex items-center mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={item.checked}
                      onChange={handleChange}
                      required
                      className="peer sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center transition-all"
                      style={{
                        background: item.checked
                          ? "#FF7A00"
                          : "rgba(255,255,255,0.05)",
                        border: `1px solid ${
                          item.checked ? "#FF7A00" : "rgba(255,255,255,0.15)"
                        }`,
                      }}
                    >
                      {item.checked && (
                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                  <span
                    className="text-[13px]"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={
                registerAdminMutation.isPending ||
                !formData.termsAccepted ||
                !formData.privacyAccepted ||
                formData.password !== formData.confirmPassword
              }
              className="flex-1 py-4 rounded-2xl font-black text-base transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "#FF7A00",
                color: "#000",
                boxShadow: "0 4px 24px rgba(255,122,0,0.35)",
              }}
            >
              {registerAdminMutation.isPending ? (
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: "rgba(0,0,0,0.2)",
                    borderTopColor: "#000",
                  }}
                />
              ) : (
                "Create Admin Account"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="sm:w-auto px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.97]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegistrationPage;
