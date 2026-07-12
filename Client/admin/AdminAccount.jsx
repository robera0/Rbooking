import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Key,
  Activity,
  Globe,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Clock,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Briefcase,
  Link,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Flag,
} from "lucide-react";
import { CustomSelect } from "./Cards";
import { eventService } from "@/Context/ApiEvent";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

// ─── Reusable icon-prefixed input ───
function IconInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon
        size={14}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
      />
      <input
        {...props}
        className={`w-full bg-[#121417] border border-white/[0.06] rounded-xl pl-10 pr-5 py-4 text-white font-bold outline-none focus:border-[#FF7A00]/50 transition-all placeholder:text-gray-700 ${
          props.className ?? ""
        }`}
      />
    </div>
  );
}

// ─── Section header with orange left bar ───
function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-4 rounded-full bg-[#FF7A00]" />
      <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">
        {label}
      </span>
    </div>
  );
}

// ─── Field wrapper ───
function FieldWrap({ label, children, full = false }) {
  return (
    <div className={`space-y-2 ${full ? "md:col-span-2" : ""}`}>
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

const AdminAccount = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const queryClient = useQueryClient();
  const { userProfile } = eventService();
  const fileInputRef = useRef(null);
  const { API_URL } = useService();
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const [hardwareKey, setHardwareKey] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("eat");
  const [emergencyBroadcasts, setEmergencyBroadcasts] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationality: "",
    phone: "",
    dateOfBirth: "",
    Gender: "",
    address: "",
    // org / extra fields
    organizationName: "",
    role: "",
    website: "",
    country: "",
  });

  useEffect(() => {
    if (userProfile?.user) {
      const u = userProfile.user;
      setFormData({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        nationality: u.nationality || "",
        phone: u.phone || "",
        dateOfBirth: u.dateOfBirth ? u.dateOfBirth.split("T")[0] : "",
        Gender: u.Gender || "",
        address: u.address || "",
        organizationName: u.organizationName || "",
        role: u.role || "",
        website: u.website || "",
        country: u.country || "",
      });
    }
  }, [userProfile]);

  const [credentials, setCredentials] = useState({
    email: userProfile?.user?.userId?.email || "",
    currentPass: "",
    password: "",
  });

  useEffect(() => {
    if (userProfile?.user?.userId?.email) {
      setCredentials((prev) => ({
        ...prev,
        email: userProfile.user.userId.email,
      }));
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleCredentials = (e) => {
    const { name, value } = e.target;
    setCredentials((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDiscard = () => {
    if (userProfile?.user) {
      const u = userProfile.user;
      setFormData({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        nationality: u.nationality || "",
        phone: u.phone || "",
        dateOfBirth: u.dateOfBirth ? u.dateOfBirth.split("T")[0] : "",
        Gender: u.Gender || "",
        address: u.address || "",
        organizationName: u.organizationName || "",
        role: u.role || "",
        website: u.website || "",
        country: u.country || "",
      });
    }
    setPreview(null);
    setSelectedFile(null);
  };

  const updateUser = async () => {
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (selectedFile) data.append("avatarUrl", selectedFile);
    await axios.put(`${API_URL}/api/auth/profile`, data, {
      withCredentials: true,
    });
  };

  const updateCredentials = async () => {
    if (!credentials.currentPass) throw new Error("Current password required");
    if (!credentials.password) throw new Error("New password required");
    if (credentials.password.length < 8)
      throw new Error("Password must be at least 8 characters");
    await axios.put(`${API_URL}/api/auth/user`, credentials, {
      withCredentials: true,
    });
  };

  const profileMutation = useMutation({
    mutationFn: updateUser,
    onMutate: () => toast.loading("Saving profile…", { id: "profile" }),
    onSuccess: () => {
      toast.success("Profile saved", { id: "profile" });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setPreview(null);
      setSelectedFile(null);
    },
    onError: (err) =>
      toast.error(getFriendlyErrorMessage(err), { id: "profile" }),
  });

  const credentialsMutation = useMutation({
    mutationFn: updateCredentials,
    onMutate: () => toast.loading("Updating password…", { id: "credentials" }),
    onSuccess: () => {
      toast.success("Password updated", { id: "credentials" });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setCredentials((prev) => ({ ...prev, currentPass: "", password: "" }));
    },
    onError: (err) =>
      toast.error(getFriendlyErrorMessage(err), {
        id: "credentials",
      }),
  });

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      window.location.href = "/login";
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const avatarSrc = preview
    ? preview
    : userProfile?.user?.avatarUrl
    ? `${API_URL}/${userProfile.user.avatarUrl}`
    : "/Login.jpg";

  const userName =
    [userProfile?.user?.firstName, userProfile?.user?.lastName]
      .filter(Boolean)
      .join(" ") || "Your Name";
  const userEmail = userProfile?.user?.userId?.email || "";
  const userOrg = formData.organizationName || "—";
  const userRole = formData.role || "Admin";

  const auditLogs = [
    {
      action: "Deleted Event #EV-402",
      time: "2 hours ago",
      status: "completed",
    },
    {
      action: "Suspended User: user_882",
      time: "5 hours ago",
      status: "completed",
    },
    {
      action: "Updated Commission Policy",
      time: "Yesterday",
      status: "completed",
    },
    {
      action: "Exported Finance Report",
      time: "2 days ago",
      status: "completed",
    },
  ];

  const containers = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const passwordStrength = (() => {
    let s = 0;
    if (credentials.password.length >= 8) s++;
    if (/[A-Z]/.test(credentials.password)) s++;
    if (/[0-9]/.test(credentials.password)) s++;
    if (/[^A-Za-z0-9]/.test(credentials.password)) s++;
    return s;
  })();

  const strengthLabel =
    ["", "Weak", "Fair", "Good", "Strong"][passwordStrength] || "";

  return (
    <div className="w-full max-w-full space-y-10 pb-20">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 border-b border-white/[0.04] pb-8">
        <h1 className="text-3xl md:text-5xl text-white uppercase tracking-tighter leading-none">
          Admin Infos
        </h1>
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <div className="text-right hidden md:block">
            <p className="text-white font-black text-xs uppercase tracking-widest">
              {userName}
            </p>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
              {userEmail}
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF7A00] to-orange-700 p-[2px]">
            <div className="w-full h-full rounded-2xl bg-[#1C1F22] flex justify-center items-center font-black text-2xl text-white">
              {userName?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Sidebar ── */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          {/* Nav items */}
          {[
            { id: "profile", label: "My Profile", icon: User },
            { id: "security", label: "Security & Password", icon: Key },
            { id: "activity", label: "Activity History", icon: Activity },
            /* { id: "system", label: "App Preferences", icon: Globe },*/
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-300 group ${
                activeTab === item.id
                  ? "bg-[#FF7A00] border-[#FF7A00] text-black"
                  : "bg-[#1C1F22] border-white/[0.04] text-gray-500 hover:border-white/[0.1] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon
                  size={18}
                  strokeWidth={activeTab === item.id ? 3 : 2}
                />
                <span className="font-black text-[10px] uppercase tracking-widest">
                  {item.label}
                </span>
              </div>
              <ChevronRight
                size={14}
                className={
                  activeTab === item.id
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 transition-opacity"
                }
              />
            </button>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-widest mt-1"
          >
            <LogOut size={18} />
            Logout
          </button>

          {/* User card */}
          <div className="mt-4 bg-[#1C1F22] border border-white/[0.04] rounded-2xl p-5 flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={avatarSrc}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              />
              {/* Online dot */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1C1F22] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="text-center">
              <p className="text-white font-black text-sm">{userName}</p>
              <p className="text-[#FF7A00] font-black text-[10px] uppercase tracking-widest mt-0.5">
                {userOrg}
              </p>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                {userRole}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <CheckCircle2 size={10} className="text-green-500" />
              <span className="text-green-500 font-black text-[9px] uppercase tracking-widest">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                variants={containers}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="bg-[#1C1F22] border border-white/[0.04] rounded-[2rem] p-8 md:p-10 shadow-2xl space-y-10">
                  {/* Card header */}
                  <div className="flex items-start justify-between border-b border-white/[0.04] pb-6">
                    <div>
                      <h2 className="text-2xl  text-white uppercase  tracking-tighter">
                        Profile <span className="text-[#FF7A00]">Details</span>
                      </h2>
                    </div>
                    {/* 
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                      <CheckCircle2 size={11} className="text-green-500" />
                      <span className="text-green-500 font-black text-[9px] uppercase tracking-widest">
                        Trust Index: High (Verified)
                      </span>
                    </div>*/}
                  </div>

                  {/* ORGANIZATION */}
                  <div>
                    <SectionLabel label="Organization" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FieldWrap label="Organization Name">
                        <IconInput
                          icon={Building2}
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleChange}
                          placeholder="e.g. RBooking Events"
                        />
                      </FieldWrap>
                      <FieldWrap label="Role / Position">
                        <IconInput
                          icon={Briefcase}
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          placeholder="e.g. Master Admin"
                        />
                      </FieldWrap>
                      <FieldWrap label="Website" full>
                        <IconInput
                          icon={Link}
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="e.g. rbooking.com"
                        />
                      </FieldWrap>
                    </div>
                  </div>

                  {/* CONTACT */}
                  <div>
                    <SectionLabel label="Contact" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FieldWrap label="Full Name">
                        <IconInput
                          icon={UserCircle}
                          name="firstName"
                          value={`${formData.firstName} ${formData.lastName}`.trim()}
                          onChange={(e) => {
                            const parts = e.target.value.split(" ");
                            setFormData((p) => ({
                              ...p,
                              firstName: parts[0] || "",
                              lastName: parts.slice(1).join(" ") || "",
                            }));
                          }}
                          placeholder="First Last"
                        />
                      </FieldWrap>
                      <FieldWrap label="Email Address">
                        <IconInput
                          icon={Mail}
                          value={userEmail}
                          disabled
                          className="opacity-50 cursor-not-allowed"
                          placeholder="—"
                        />
                      </FieldWrap>
                      <FieldWrap label="Phone Number" full>
                        <IconInput
                          icon={Phone}
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+251 9XX XXX XXXX"
                        />
                      </FieldWrap>
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div>
                    <SectionLabel label="Location" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FieldWrap label="Address" full>
                        <IconInput
                          icon={MapPin}
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Street, City"
                        />
                      </FieldWrap>
                      <FieldWrap label="Country">
                        <IconInput
                          icon={Flag}
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="e.g. Ethiopia"
                        />
                      </FieldWrap>
                      <FieldWrap label="Nationality">
                        <IconInput
                          icon={Flag}
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                          placeholder="e.g. Ethiopian"
                        />
                      </FieldWrap>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/[0.04]">
                    <button
                      onClick={() => profileMutation.mutate()}
                      disabled={profileMutation.isPending}
                      className="px-10 py-4 bg-[#FF7A00] text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-orange-400 transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {profileMutation.isPending ? "Saving…" : "Save Changes"}
                    </button>
                    <button
                      onClick={handleDiscard}
                      disabled={profileMutation.isPending}
                      className="px-10 py-4 bg-transparent border border-white/[0.08] text-gray-400 hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                variants={containers}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                <div className="">
                  {/* Password Change */}
                  <div className="bg-[#1C1F22] w-full border border-white/[0.04] rounded-[2.5rem] p-8 space-y-8">
                    <div className="flex items-center gap-4 text-white">
                      <Lock className="text-[#FF7A00]" size={24} />
                      <h2 className="text-xl  uppercase tracking-tighter ">
                        Change <span className="text-[#FF7A00]">Password</span>
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <SectionLabel label="current password" />
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPass"
                            value={credentials.currentPass}
                            onChange={handleCredentials}
                            className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-6 py-4 text-white font-bold outline-none focus:border-[#FF7A00]/50 transition-all"
                            placeholder="••••••••••••"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                          >
                            {showCurrentPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <SectionLabel label="New Password" />
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="password"
                            value={credentials.password}
                            onChange={handleCredentials}
                            className="w-full bg-[#121417] border border-white/[0.06] rounded-xl px-6 py-4 text-white font-bold outline-none focus:border-[#FF7A00]/50 transition-all"
                            placeholder="••••••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                          >
                            {showNewPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>

                        {credentials.password.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1 flex-1 rounded-full transition-all ${
                                    level <= passwordStrength
                                      ? passwordStrength <= 1
                                        ? "bg-red-500"
                                        : passwordStrength === 2
                                        ? "bg-yellow-500"
                                        : passwordStrength === 3
                                        ? "bg-blue-500"
                                        : "bg-green-500"
                                      : "bg-white/10"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                              {strengthLabel}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => credentialsMutation.mutate()}
                      disabled={
                        credentialsMutation.isPending ||
                        !credentials.currentPass ||
                        !credentials.password
                      }
                      className="w-full py-4 bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white hover:text-black transition-all font-black text-[10px] uppercase tracking-widest rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {credentialsMutation.isPending
                        ? "Updating…"
                        : "Update Password"}
                    </button>
                  </div>

                  {/* 2FA */}

                  {/*
                              <div className="bg-[#1C1F22] border border-white/[0.04] rounded-[2.5rem] p-8 space-y-8">
                    <div className="flex items-center gap-4 text-white">
                      <Smartphone className="text-blue-500" size={24} />
                      <h2 className="text-xl font-black uppercase tracking-tighter italic">
                        Two-Factor <span className="text-blue-500">Auth</span>
                      </h2>
                    </div>
                    <p className="text-gray-500 text-xs font-bold leading-relaxed uppercase tracking-widest">
                      Secure your account access with biometric or hardware
                      verification.
                    </p>
                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
                      {[
                        {
                          label: "Hardware-Key Access",
                          val: hardwareKey,
                          set: setHardwareKey,
                        },
                        {
                          label: "Biometric Login",
                          val: biometric,
                          set: setBiometric,
                        },
                      ].map(({ label, val, set }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between"
                        >
                          <span ctlassName="text-white font-black text-[10px] uppercase tracking-widest">
                            {label}
                          </span>
                          <button
                            type="button"
                            onClick={() => set(!val)}
                            className={`w-12 h-6 rounded-full p-1 relative transition-all duration-300 ${
                              val
                                ? "bg-blue-500/20 border border-blue-500/30"
                                : "bg-white/5 border border-white/10"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                val
                                  ? "bg-blue-500 translate-x-6"
                                  : "bg-gray-600 translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                    */}
                </div>
              </motion.div>
            )}

            {/* ── ACTIVITY TAB ── */}
            {activeTab === "activity" && (
              <motion.div
                key="activity"
                variants={containers}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-[#1C1F22] border border-white/[0.04] rounded-[2.5rem] p-8"
              >
                <div className="flex items-center justify-between mb-10 border-b border-white/[0.04] pb-6">
                  <h2 className="text-2xl  text-white uppercase  tracking-tighter">
                    Recent <span className="text-[#FF7A00]">Activity</span>{" "}
                    History
                  </h2>
                  <div className="px-4 py-2 bg-white/[0.04] rounded-full text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                    Real-time Feedback
                  </div>
                </div>
                <div className="space-y-4">
                  {auditLogs.map((log, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl hover:border-white/[0.1] transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-[#121417] flex justify-center items-center text-[#FF7A00]">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-white font-black uppercase tracking-tight">
                            {log.action}
                          </p>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                            Timestamp: {log.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/5 text-green-500 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── SYSTEM / PREFERENCES TAB ── */}
            {/*
                     {activeTab === "system" && (
              <motion.div
                key="system"
                variants={containers}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                <div className="bg-[#1C1F22] border border-white/[0.04] rounded-[2.5rem] p-8 space-y-10">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                      Account{" "}
                      <span className="text-[#FF7A00]">Preferences</span>
                    </h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                      Control how the application behaves
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">
                        System Language
                      </label>
                      <CustomSelect
                        options={[
                          { label: "English (US) - Default", value: "en" },
                          { label: "Amharic (Ethiopia)", value: "am" },
                          { label: "French (Standard)", value: "fr" },
                        ]}
                        value={language}
                        onChange={(val) => setLanguage(val)}
                        placeholder="Select Language"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">
                        Timezone Reference
                      </label>
                      <CustomSelect
                        options={[
                          { label: "UTC +3:00 (Addis Ababa)", value: "eat" },
                          { label: "UTC +0:00 (Greenwich)", value: "utc" },
                        ]}
                        value={timezone}
                        onChange={(val) => setTimezone(val)}
                        placeholder="Select Timezone"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-black text-xs uppercase tracking-widest">
                          Emergency System Broadcasts
                        </p>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                          Receive critical system-level error updates
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setEmergencyBroadcasts(!emergencyBroadcasts)
                        }
                        className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 flex ${
                          emergencyBroadcasts
                            ? "bg-[#FF7A00] justify-end"
                            : "bg-white/10 justify-start"
                        }`}
                      >
                        <div className="w-5 h-5 bg-white rounded-full shadow-lg" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => toast.success("Preferences saved")}
                    className="px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#FF7A00] transition-all active:scale-95 shadow-xl"
                  >
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            )}
               */}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminAccount;
