import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  AlertCircle,
  MapPin,
  Clock,
  Wallet,
  Martini,
  Trash2,
  Image,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import api from "../src/Context/api/api.config";

/* ------------------------------ shared styles ----------------------------- */

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  caretColor: "#FF7A00",
  colorScheme: "dark",
};
const inputFocusStyle = { borderColor: "rgba(255,122,0,0.5)" };
const inputBlurStyle = { borderColor: "rgba(255,255,255,0.08)" };

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const SUNRISE = "06:00";

// every clickable thing gets: pointer cursor, smooth hover, keyboard focus ring
const btnBase =
  "cursor-pointer select-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60";

const defaultHours = () =>
  DAYS.map((_, day) => ({
    day, // 0 = Sunday
    isOpen: day >= 4, // Thu–Sun open by default
    opensAt: "21:00",
    closesAt: "04:00",
  }));

/* ------------------------------- primitives ------------------------------- */

const FieldInput = ({
  icon: Icon,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required,
  min,
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
      min={min}
      className={`w-full ${
        Icon ? "pl-11" : "pl-5"
      } pr-5 py-3.5 sm:py-4 rounded-2xl text-white text-sm outline-none transition-colors ${className}`}
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

const TimeInput = ({ value, onChange }) => (
  <input
    type="time"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="flex-1 min-w-0 px-3 py-3 sm:px-5 sm:py-4 rounded-2xl text-white text-sm outline-none transition-colors"
    style={inputStyle}
    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
    onBlur={(e) => Object.assign(e.target.style, inputBlurStyle)}
  />
);

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full flex-shrink-0 hover:brightness-125 ${btnBase}`}
    style={{ background: checked ? "#FF7A00" : "rgba(255,255,255,0.1)" }}
  >
    <span
      className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white transition-transform"
      style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
    />
  </button>
);

const CustomSelect = ({
  icon: Icon,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={containerRef}>
      {Icon && (
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10"
          style={{ color: "#c9a88a" }}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full ${
          Icon ? "pl-11" : "pl-5"
        } pr-11 py-3.5 sm:py-4 rounded-2xl text-sm text-left flex items-center justify-between hover:brightness-125 ${btnBase}`}
        style={{
          ...inputStyle,
          borderColor: open ? "rgba(255,122,0,0.5)" : "rgba(255,255,255,0.08)",
          color: selected ? "#fff" : "rgba(255,255,255,0.3)",
        }}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className="absolute right-4 w-4 h-4 transition-transform duration-200"
          style={{
            color: "#c9a88a",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-20 mt-2 w-full rounded-2xl overflow-hidden py-1.5 max-h-64 overflow-y-auto"
            style={{
              background: "#1a1b1e",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors cursor-pointer"
                  style={{
                    color: isSelected ? "#FF7A00" : "rgba(255,255,255,0.8)",
                    background: isSelected
                      ? "rgba(255,122,0,0.08)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const calculatePasswordStrength = (pass) => {
  if (!pass) return 0;
  let strength = 0;
  if (pass.length > 7) strength += 25;
  if (pass.match(/[A-Z]/)) strength += 25;
  if (pass.match(/[0-9]/)) strength += 25;
  if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
  return strength;
};

/* ---------------------------------- page ---------------------------------- */

const ClubOwnerRegistrationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setIsLoggedIn } = useService();
  const coverInputRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emptyForm = {
    // owner → goes to the User document
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // club → goes to the Club document
    clubName: "",
    description: "",
    contactPhone: "",
    country: "ET",
    region: "",
    city: "",
    streetAddress: "",
    acceptsReservations: true,
    holdMinutes: 15,
    openingHours: defaultHours(),
    paymentMethods: [],
    termsAccepted: false,
    privacyAccepted: false,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [coverPageFile, setCoverPageFile] = useState(null);
  const [currentPayment, setCurrentPayment] = useState({
    provider: "Telebirr",
    accountNumber: "",
    receiverName: "",
  });

  /* ------------------------------- handlers ------------------------------- */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateDay = (day, patch) =>
    setFormData((prev) => ({
      ...prev,
      openingHours: prev.openingHours.map((h) =>
        h.day === day ? { ...h, ...patch } : h,
      ),
    }));

  const copyToAllOpen = (from) =>
    setFormData((prev) => ({
      ...prev,
      openingHours: prev.openingHours.map((h) =>
        h.isOpen ? { ...h, opensAt: from.opensAt, closesAt: from.closesAt } : h,
      ),
    }));

  const handleAddPayment = () => {
    if (!currentPayment.accountNumber.trim()) {
      return toast.error("Please enter an account number");
    }
    setFormData((prev) => ({
      ...prev,
      paymentMethods: [
        ...prev.paymentMethods,
        {
          ...currentPayment,
          // Telebirr only returns the payer's first name, so keep one word
          receiverName:
            currentPayment.receiverName?.trim().split(/\s+/)[0] || "",
        },
      ],
    }));
    setCurrentPayment({
      provider: "Telebirr",
      accountNumber: "",
      receiverName: "",
    });
  };

  const handleRemovePayment = (idx) =>
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((_, i) => i !== idx),
    }));

  const normalizePhone = (raw) => {
    let p = raw.replace(/[^\d+]/g, "");
    if (p.startsWith("0")) p = "+251" + p.substring(1);
    else if (p.startsWith("251")) p = "+" + p;
    else if (!p.startsWith("+")) p = "+251" + p;
    return p;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const strengthColor = (idx) => {
    const filled = passwordStrength > idx * 25;
    if (!filled) return "rgba(255,255,255,0.08)";
    if (passwordStrength <= 25) return "#ef4444";
    if (passwordStrength <= 75) return "#f97316";
    return "#22c55e";
  };

  /* ------------------------------- mutation ------------------------------- */

  const registerClubOwnerMutation = useMutation({
    mutationFn: async (payload) => {
      const body = new FormData();
      const jsonKeys = ["openingHours", "paymentMethods"];
      Object.entries(payload).forEach(([key, val]) => {
        if (jsonKeys.includes(key)) body.append(key, JSON.stringify(val));
        else body.append(key, val);
      });
      if (coverPageFile) body.append("coverPage", coverPageFile);

      const res = await api.post(`/api/auth/signup/club-owner`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Club registered successfully!");
      setIsLoggedIn(true);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setFormData(emptyForm);
      setCoverPageFile(null);
      setTimeout(() => navigate("/club-owner/home"), 2000);
    },
    onError: (error) => toast.error(getFriendlyErrorMessage(error)),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const f = formData;

    if (
      !f.email ||
      !f.password ||
      !f.firstName ||
      !f.lastName ||
      !f.phone ||
      !f.clubName ||
      !f.contactPhone ||
      !f.country ||
      !f.city ||
      !f.region ||
      !f.streetAddress ||
      !f.termsAccepted ||
      !f.privacyAccepted
    ) {
      return toast.error("Please fill all required fields");
    }
    if (f.password !== f.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    const openDays = f.openingHours.filter((h) => h.isOpen);
    if (openDays.length === 0) {
      return toast.error("Open your club on at least one day");
    }
    const missing = openDays.find((h) => !h.opensAt || !h.closesAt);
    if (missing) {
      return toast.error(
        `Set opening and closing time for ${DAYS[missing.day]}`,
      );
    }
    if (f.acceptsReservations) {
      if (Number(f.holdMinutes) < 1) {
        return toast.error("Hold time must be at least 1 minute");
      }
      if (f.paymentMethods.length === 0) {
        return toast.error(
          "Add a payment method to accept reservations, or turn reservations off",
        );
      }
    }

    const { confirmPassword, termsAccepted, privacyAccepted, ...rest } = f;

    registerClubOwnerMutation.mutate({
      ...rest,
      phone: normalizePhone(f.phone),
      contactPhone: normalizePhone(f.contactPhone),
      openingHours: f.openingHours.map((h) =>
        h.isOpen ? h : { ...h, opensAt: "", closesAt: "" },
      ),
      role: "club_owner",
    });
  };

  /* --------------------------------- view --------------------------------- */

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "#0c0d0e" }}
    >
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
            <Martini className="w-6 h-6" style={{ color: "#FF7A00" }} />
          </div>
          <h1 className="text-2xl font-black text-white">
            Club Owner Registration
          </h1>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Create your account and list your club so guests can find it and
            reserve.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          {/* SECTION 1 — Owner Information */}
          <section className="flex flex-col gap-5">
            <SectionHeading icon={User} number="1" title="Owner Information" />

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
                  placeholder="+2519-000-000"
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
                    aria-label="Show or hide password"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:brightness-200 ${btnBase}`}
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
                    aria-label="Show or hide password"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:brightness-200 ${btnBase}`}
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

          {/* SECTION 2 — Club Information */}
          <section className="flex flex-col gap-5">
            <SectionHeading
              icon={Building2}
              number="2"
              title="Club Information"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Club Name *</Label>
                <FieldInput
                  icon={Building2}
                  name="clubName"
                  value={formData.clubName}
                  onChange={handleChange}
                  placeholder="Skyline Lounge"
                  required
                />
              </div>
              <div>
                <Label>Club Contact Phone *</Label>
                <FieldInput
                  icon={Phone}
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+2519-000-000"
                  required
                />
                <p
                  className="text-[11px] mt-1.5"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Shown to guests for booking questions
                </p>
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Music, vibe, dress code, what makes your club special…"
                  className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none transition-colors resize-none"
                  style={inputStyle}
                  onFocus={(e) =>
                    Object.assign(e.target.style, inputFocusStyle)
                  }
                  onBlur={(e) => Object.assign(e.target.style, inputBlurStyle)}
                />
              </div>

              {/* Cover Page */}
              <div className="md:col-span-2">
                <Label>Club Cover Photo</Label>
                {coverPageFile ? (
                  <div className="relative w-full h-48 rounded-[1.5rem] overflow-hidden border border-white/10 group bg-black">
                    <img
                      src={URL.createObjectURL(coverPageFile)}
                      alt="Cover preview"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        type="button"
                        onClick={() => setCoverPageFile(null)}
                        aria-label="Remove cover photo"
                        className={`p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white ${btnBase}`}
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className={`w-full h-32 bg-[#121417] border border-dashed border-white/[0.2] hover:border-[#FF7A00] hover:bg-[#FF7A00]/5 text-gray-500 hover:text-[#FF7A00] rounded-[1.5rem] flex flex-col items-center justify-center gap-3 active:scale-95 group ${btnBase}`}
                  >
                    <Image
                      size={32}
                      strokeWidth={1.5}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <p className="font-black text-[11px] uppercase tracking-[0.2em] italic">
                      Upload Cover Photo
                    </p>
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={coverInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCoverPageFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* SECTION 3 — Address */}
          <section className="flex flex-col gap-5">
            <SectionHeading icon={MapPin} number="3" title="Club Address" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Country *</Label>
                <CustomSelect
                  value={formData.country}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, country: val }))
                  }
                  placeholder="Select country"
                  options={[
                    { value: "ET", label: "Ethiopia" },
                    { value: "KE", label: "Kenya" },
                    { value: "ZA", label: "South Africa" },
                    { value: "US", label: "United States" },
                    { value: "UK", label: "United Kingdom" },
                  ]}
                />
              </div>
              <div>
                <Label>Region / State *</Label>
                <FieldInput
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="Region or Province"
                  required
                />
              </div>
              <div>
                <Label>City *</Label>
                <FieldInput
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Addis Ababa"
                  required
                />
              </div>
              <div>
                <Label>Street Address *</Label>
                <FieldInput
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="Bole Road, near…"
                  required
                />
              </div>
            </div>
          </section>

          {/* SECTION 4 — Opening Hours */}
          <section className="flex flex-col gap-5">
            <SectionHeading icon={Clock} number="4" title="Opening Hours" />
            <p className="text-xs text-gray-500 -mt-3">
              Closing earlier than opening means the club closes after midnight.
            </p>

            <div className="flex flex-col gap-3">
              {formData.openingHours.map((h) => {
                const sunrise = h.closesAt === SUNRISE;
                return (
                  <div
                    key={h.day}
                    className="rounded-2xl p-3 sm:p-4 flex flex-col gap-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        {DAYS[h.day]}
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {h.isOpen ? "Open" : "Closed"}
                        </span>
                        <Toggle
                          checked={h.isOpen}
                          onChange={(val) => updateDay(h.day, { isOpen: val })}
                        />
                      </div>
                    </div>

                    {h.isOpen && (
                      <>
                        <div className="flex items-center gap-3">
                          <TimeInput
                            value={h.opensAt}
                            onChange={(v) => updateDay(h.day, { opensAt: v })}
                          />
                          <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                          >
                            to
                          </span>
                          <TimeInput
                            value={h.closesAt}
                            onChange={(v) => updateDay(h.day, { closesAt: v })}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {sunrise && (
                            <span style={{ color: "rgba(253,230,138,0.6)" }}>
                              Runs until sunrise
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              updateDay(h.day, {
                                closesAt: sunrise ? "" : SUNRISE,
                              })
                            }
                            className={`px-3 py-1.5 rounded-full font-bold border hover:brightness-125 ${
                              sunrise
                                ? "border-[#FF7A00]/50 bg-[#FF7A00]/10"
                                : "border-white/10"
                            } ${btnBase}`}
                            style={{
                              color: sunrise
                                ? "#FF7A00"
                                : "rgba(255,255,255,0.4)",
                            }}
                          >
                            Until sunrise (6:00 AM)
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToAllOpen(h)}
                            className={`px-3 py-1.5 rounded-full font-bold border border-white/10 hover:brightness-150 hover:bg-white/5 ${btnBase}`}
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            Copy to all open days
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 5 — Reservations & Payment */}
          <section className="flex flex-col gap-5">
            <SectionHeading
              icon={Wallet}
              number="5"
              title="Reservations & Payment"
            />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">
                  Accept reservations
                </p>
                <p
                  className="text-[12px] mt-0.5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Let guests reserve and pay through the platform.
                </p>
              </div>
              <Toggle
                checked={formData.acceptsReservations}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, acceptsReservations: val }))
                }
              />
            </div>

            {formData.acceptsReservations && (
              <>
                <div className="max-w-xs">
                  <Label>Hold Time (minutes)</Label>
                  <FieldInput
                    type="number"
                    min={1}
                    name="holdMinutes"
                    value={formData.holdMinutes}
                    onChange={handleChange}
                  />
                  <p
                    className="text-[11px] mt-1.5"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    How long a pending reservation is held while the guest pays
                  </p>
                </div>

                <div className="bg-[#1C1F22] p-4 sm:p-5 rounded-2xl border border-white/[0.04]">
                  <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
                    <div className="w-full md:w-1/4">
                      <Label>Payment Provider</Label>
                      <CustomSelect
                        value={currentPayment.provider}
                        onChange={(val) =>
                          setCurrentPayment((prev) => ({
                            ...prev,
                            provider: val,
                          }))
                        }
                        options={[{ value: "Telebirr", label: "Telebirr" }]}
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <Label>Account / Phone Number</Label>
                      <FieldInput
                        name="accountNumber"
                        value={currentPayment.accountNumber}
                        onChange={(e) =>
                          setCurrentPayment((prev) => ({
                            ...prev,
                            accountNumber: e.target.value,
                          }))
                        }
                        placeholder="+2519-000-000"
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <Label>Account Holder Name</Label>
                      <FieldInput
                        name="receiverName"
                        value={currentPayment.receiverName}
                        onChange={(e) =>
                          setCurrentPayment((prev) => ({
                            ...prev,
                            receiverName: e.target.value,
                          }))
                        }
                        placeholder="First name only"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPayment}
                      className={`w-full md:w-auto px-6 py-3.5 md:py-4 rounded-2xl font-bold hover:brightness-110 active:scale-95 flex items-center justify-center ${btnBase}`}
                      style={{ background: "#FF7A00", color: "#000" }}
                    >
                      Add
                    </button>
                  </div>

                  {formData.paymentMethods.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <Label>Added Methods</Label>
                      {formData.paymentMethods.map((method, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-black/40 border border-white/[0.05]"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] font-black text-xs uppercase">
                              {method.provider.slice(0, 3)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">
                                {method.provider}
                              </p>
                              <p className="text-xs text-gray-400 break-all">
                                {method.accountNumber}
                              </p>
                              <p className="text-sm font-bold text-white">
                                {method.receiverName}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePayment(idx)}
                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10 text-sm font-bold ${btnBase}`}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* SECTION 6 — Agreements */}
          <section
            className="flex flex-col gap-3 p-6 rounded-2xl"
            style={{
              background: "rgba(255,122,0,0.04)",
              border: "1px solid rgba(255,122,0,0.12)",
            }}
          >
            {[
              {
                name: "termsAccepted",
                checked: formData.termsAccepted,
                label: (
                  <>
                    I accept the{" "}
                    <Link
                      to="/termsAndConditions"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: "#FF7A00" }}
                      className="font-bold hover:underline"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    for running a club on this platform.{" "}
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
                      onClick={(e) => e.stopPropagation()}
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
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={
                registerClubOwnerMutation.isPending ||
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
              {registerClubOwnerMutation.isPending ? (
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: "rgba(0,0,0,0.2)",
                    borderTopColor: "#000",
                  }}
                />
              ) : (
                "Create Club Account"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="sm:w-auto px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.97]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Back
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ClubOwnerRegistrationPage;
