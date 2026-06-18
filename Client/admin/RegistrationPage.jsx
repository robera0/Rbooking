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
  UploadCloud,
  X,
  LayoutDashboard,
  Briefcase,
  FileBadge2,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";

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
  {
    /*  const [files, setFiles] = useState({
    idDocument: null,
    businessLicense: null,
    companyLogo: null,
  });
 */
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  {
    /*  const handleFileDrop = (e, field) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    if (droppedFile) {
      setFiles((prev) => ({ ...prev, [field]: droppedFile }));
    }
  }; */
  }

  {
    /*  const removeFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
  }; */
  }

  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length > 7) strength += 25;
    if (pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/[0-9]/)) strength += 25;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const registerAdminMutation = useMutation({
    mutationFn: async (payload) => {
      const form = new FormData();

      // Base fields
      form.append("username", payload.email); // use email as username
      form.append("email", payload.email);
      form.append("password", payload.password);

      // Personal info
      form.append("firstName", payload.firstName);
      form.append("lastName", payload.lastName);
      form.append("phone", payload.phone);

      // Organization info
      form.append("organizationName", payload.organizationName);
      form.append("businessType", payload.businessType);
      form.append(
        "businessRegistrationNumber",
        payload.businessRegistrationNumber,
      );
      form.append("taxId", payload.taxId);

      // Address
      form.append("country", payload.country);
      form.append("city", payload.city);
      form.append("region", payload.region);
      form.append("streetAddress", payload.streetAddress);

      // Admin specific
      form.append("adminRole", payload.adminRole || "event_manager");
      form.append("twoFactorEnabled", String(payload.twoFactorEnabled));

      // Files (only if present)

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

      // Reset form
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

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    },

    onError: (error) => {
      toast.error(`Registration failed: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Log the entire formData object for debugging
    console.log("Registration formData:", formData);
    // Required fields validation
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
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      organizationName: formData.organizationName,
      businessType: formData.businessType,
      businessRegistrationNumber: formData.businessRegistrationNumber,
      taxId: formData.taxId,
      country: formData.country,
      city: formData.city,
      region: formData.region,
      streetAddress: formData.streetAddress,
      adminRole: "event_manager", // default role, matches backend enum
      twoFactorEnabled: formData.twoFactorEnabled,
    });
  };
  // they should add image after the admin signed in
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 font-sans text-slate-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden"
      >
        <div className="p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-900 mb-6 shadow-lg shadow-blue-900/20">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-950 mb-3">
              Admin Registration
            </h1>
            <p className="text-slate-500 max-w-lg mx-auto text-sm md:text-base">
              Create your admin account to manage events and tickets securely
              and professionally.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* SECTION 1 — Personal Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-blue-950">
                  1. Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {/* Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2 flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength > 0
                            ? passwordStrength > 50
                              ? "bg-orange-500"
                              : "bg-red-500"
                            : ""
                        }`}
                        style={{ width: "25%" }}
                      ></div>
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength > 25
                            ? passwordStrength > 50
                              ? "bg-orange-500"
                              : "bg-red-500"
                            : ""
                        }`}
                        style={{ width: "25%" }}
                      ></div>
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength > 50 ? "bg-orange-500" : ""
                        }`}
                        style={{ width: "25%" }}
                      ></div>
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength > 75 ? "bg-green-500" : ""
                        }`}
                        style={{ width: "25%" }}
                      ></div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-12 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-1 transition-all ${
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-slate-200 focus:border-blue-900 focus:ring-blue-900"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Passwords do not
                        match
                      </p>
                    )}
                </div>
              </div>
            </section>

            {/* SECTION 2 — Organization Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-blue-950">
                  2. Organization Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                      placeholder="Acme Events LLC"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Select business type
                      </option>
                      <option value="event_manager">Event Manager</option>
                      <option value="Venue Owner">Venue Owner</option>
                      <option value="ticket_manager">Ticket Reseller</option>
                      <option value="Festival Organizer">
                        Festival Organizer
                      </option>
                      <option value="corporate_events">Corporate Events</option>
                      <option value="Sports Organizer">Sports Organizer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business Registration Number
                  </label>
                  <div className="relative">
                    <FileBadge2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="businessRegistrationNumber"
                      value={formData.businessRegistrationNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                      placeholder="Reg No."
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Optional for individual organizers
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tax ID / VAT
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                      placeholder="Tax reference"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3 — Address Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-blue-950">
                  3. Address Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Country
                    </option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="GE">Germany</option>
                    <option value="FR">France</option>
                    <option value="KE">Kenya</option>
                    <option value="ZA">South Africa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Region / State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                    placeholder="region or Province"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                    placeholder="City name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                    placeholder="123 Organizer Street"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 4 — Verification Upload */}
            {/*
             <section className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <UploadCloud className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-blue-950">
                  4. Verification Upload
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: "idDocument",
                    label: "Government ID",
                    icon: <FileBadge2 className="w-6 h-6" />,
                  },
                  {
                    id: "businessLicense",
                    label: "Business License",
                    icon: <FileText className="w-6 h-6" />,
                  },
                  {
                    id: "companyLogo",
                    label: "Company Logo",
                    icon: <ImageIcon className="w-6 h-6" />,
                  },
                ].map((item) => (
                  <div key={item.id} className="relative group">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {item.label}
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all bg-slate-50
                        ${
                          files[item.id]
                            ? "border-orange-400 bg-orange-50/50"
                            : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer"
                        }`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleFileDrop(e, item.id)}
                    >
                      <input
                        type="file"
                        onChange={(e) => handleFileDrop(e, item.id)}
                        className="hidden"
                        id={`file-${item.id}`}
                        accept="image/*,.pdf"
                      />

                      {!files[item.id] ? (
                        <label
                          htmlFor={`file-${item.id}`}
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm mb-3">
                            {item.icon}
                          </div>
                          <span className="text-sm font-medium text-blue-900">
                            Click or drag file
                          </span>
                          <span className="text-xs text-slate-400 mt-1">
                            PDF, JPG, PNG (Max 5MB)
                          </span>
                        </label>
                      ) : (
                        <div className="flex flex-col items-center w-full">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-3">
                            <Check className="w-6 h-6" />
                          </div>
                          <span
                            className="text-sm font-medium text-slate-800 truncate w-full px-2"
                            title={files[item.id].name}
                          >
                            {files[item.id].name}
                          </span>
                          <span className="text-xs text-slate-500 mt-1">
                            {(files[item.id].size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(item.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            */}

            {/* SECTION 5 — Security & Agreement */}
            <section className="space-y-5 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-950">
                    Enable Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-sm text-slate-500">
                    Secure your admin account with an extra layer of protection.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="twoFactorEnabled"
                    checked={formData.twoFactorEnabled}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <hr className="border-slate-200" />

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      required
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-900 peer-checked:border-blue-900 transition-colors"></div>
                    <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                    I accept the{" "}
                    <a
                      href="#"
                      className="font-medium text-orange-500 hover:text-orange-600"
                    >
                      Terms & Conditions
                    </a>{" "}
                    for organizing events on this platform.{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      name="privacyAccepted"
                      checked={formData.privacyAccepted}
                      onChange={handleChange}
                      required
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-900 peer-checked:border-blue-900 transition-colors"></div>
                    <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="font-medium text-orange-500 hover:text-orange-600"
                    >
                      Privacy Policy
                    </a>{" "}
                    and data usage agreements.{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <button
                type="submit"
                disabled={
                  registerAdminMutation.isPending ||
                  !formData.termsAccepted ||
                  !formData.privacyAccepted ||
                  formData.password !== formData.confirmPassword
                }
                className="w-full sm:w-auto flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3.5 px-6 rounded-xl transition-colors shadow-lg shadow-orange-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {registerAdminMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Create Admin Account"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationPage;
