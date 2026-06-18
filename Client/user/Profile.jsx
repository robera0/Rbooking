import { motion, AnimatePresence } from "framer-motion";
import {
  CircleCheckBig,
  Camera,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  MapPin,
  Lock,
  Loader2,
  Shield,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { eventService } from "@/Context/ApiEvent";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import toast, { Toaster } from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import { useService } from "@/Context/ServiceContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ─────────────────── tiny design tokens ─────────────────── */
const SURFACE = "bg-[#111214]";
const BORDER = "border-[#1f2023]";
const INPUT_BASE =
  "w-full bg-[#18191c] border border-[#262729] hover:border-[#35373b] focus:border-[#FF7A00]/70 focus:ring-2 focus:ring-[#FF7A00]/10 text-[#f4f4f5] px-4 py-3 rounded-xl outline-none transition-all duration-200 placeholder:text-[#4b4d52] text-[13.5px] font-normal";

/* ─────────────────── SVG Completion Ring ─────────────────── */
const CompletionRing = ({ progress, size = 96, stroke = 4 }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1f2023"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#FF7A00"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
};

/* ─────────────────── Floating Label Input ─────────────────── */
const FloatingInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  readOnly = false,
  placeholder = " ",
  suffix,
}) => {
  const [focused, setFocused] = useState(false);
  const filled = value && value.length > 0;
  const active = focused || filled;

  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={active ? placeholder : ""}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`${INPUT_BASE} pt-5 pb-2.5 ${
          readOnly ? "opacity-50 cursor-not-allowed" : ""
        }`}
        style={{ colorScheme: "dark" }}
      />
      <label
        className="absolute left-4 pointer-events-none transition-all duration-200 origin-left"
        style={{
          top: active ? "8px" : "50%",
          transform: active
            ? "translateY(0) scale(0.75)"
            : "translateY(-50%) scale(1)",
          color: focused ? "#FF7A00" : "#4b4d52",
          fontSize: "13.5px",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      {suffix && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {suffix}
        </div>
      )}
    </div>
  );
};

/* ─────────────────── Password input with show/hide ─────────────────── */
const PasswordInput = ({ label, name, value, onChange }) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const filled = value && value.length > 0;
  const active = focused || filled;

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=""
        className={`${INPUT_BASE} pt-5 pb-2.5 pr-12`}
      />
      <label
        className="absolute left-4 pointer-events-none transition-all duration-200 origin-left"
        style={{
          top: active ? "8px" : "50%",
          transform: active
            ? "translateY(0) scale(0.75)"
            : "translateY(-50%) scale(1)",
          color: focused ? "#FF7A00" : "#4b4d52",
          fontSize: "13.5px",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4b4d52] hover:text-[#9ca3af] transition-colors"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

/* ─────────────────── Password Strength Meter ─────────────────── */
const getStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const StrengthMeter = ({ password }) => {
  const score = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#262729", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full"
            initial={{ backgroundColor: "#262729" }}
            animate={{
              backgroundColor: i <= score ? colors[score] : "#262729",
            }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}
      </div>
      <p className="text-[11px] font-medium" style={{ color: colors[score] }}>
        {labels[score]}
      </p>
    </div>
  );
};

/* ─────────────────── Section divider ─────────────────── */
const SectionDivider = ({ title, description }) => (
  <div className="pb-5 border-b border-[#1f2023] mb-6">
    <h3 className="text-[14px] font-semibold text-[#f4f4f5]">{title}</h3>
    {description && (
      <p className="text-[12px] text-[#6b7280] mt-0.5">{description}</p>
    )}
  </div>
);

/* ─────────────────── Sidebar Nav item ─────────────────── */
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 text-left group ${
      active
        ? "bg-[#FF7A00]/10 text-[#FF7A00]"
        : "text-[#9ca3af] hover:bg-[#18191c] hover:text-[#f4f4f5]"
    }`}
  >
    <Icon
      size={15}
      className={
        active ? "text-[#FF7A00]" : "text-[#6b7280] group-hover:text-[#9ca3af]"
      }
    />
    {label}
    {active && <ChevronRight size={13} className="ml-auto" />}
  </button>
);

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
const Profile = () => {
  const COMPLETION = 80;
  const queryClient = useQueryClient();
  const { userProfile } = eventService();
  const fileInputRef = useRef(null);
  const { API_URL } = useService();
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [newPassword, setNewPassword] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    nationality: "",
    phone: "",
    dateOfBirth: "",
    Gender: "",
    address: "",
  });

  useEffect(() => {
    if (userProfile?.user) {
      setFormData({
        fullName: userProfile?.user?.fullName || "",
        nationality: userProfile.user.nationality || "",
        phone: userProfile.user.phone || "",
        dateOfBirth: userProfile.user.dateOfBirth
          ? userProfile.user.dateOfBirth.split("T")[0]
          : "",
        Gender: userProfile.user.Gender || "",
        address: userProfile.user.address || "",
      });
    }
  }, [userProfile]);

  const [credentials, setCredentials] = useState({
    email: "",
    currentPass: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleCredentials = (e) => {
    const { name, value } = e.target;
    setCredentials((p) => ({ ...p, [name]: value }));
    if (name === "password") setNewPassword(value);
  };

  /* ── mutations ── */
  const updateUser = async () => {
    const id = toast.loading("Saving profile…");
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (selectedFile) data.append("avatarUrl", selectedFile);
      await axios.put(`${API_URL}/api/auth/user_profile`, data, {
        withCredentials: true,
      });
      toast.success("Profile saved", { id });
    } catch {
      toast.error("Could not save profile", { id });
    }
  };

  const updateCredentials = async () => {
    const id = toast.loading("Updating password…");
    try {
      await axios.put(`${API_URL}/api/auth/user`, credentials, {
        withCredentials: true,
      });
      toast.success("Password updated", { id });
    } catch {
      toast.error("Could not update password", { id });
    }
  };

  const profileMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setPreview(null);
    },
  });

  const credentialsMutation = useMutation({
    mutationFn: updateCredentials,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
  });

  const avatarSrc = preview
    ? preview
    : userProfile?.user?.avatarUrl
    ? `${API_URL}/${userProfile.user.avatarUrl}`
    : "/Login.jpg";

  const userName = userProfile?.user?.fullName || "Your Name";
  const userEmail = userProfile?.user?.userId?.email || "";

  /* ---- nav tabs ---- */
  const navTabs = [
    { key: "profile", label: "Profile", icon: User },
    { key: "security", label: "Security", icon: Shield },
  ];

  return (
    <div
      className="min-h-screen text-[#f4f4f5] antialiased"
      style={{ background: "#0c0d0e" }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#18191c",
            color: "#f4f4f5",
            border: "1px solid #262729",
            fontSize: "13px",
          },
        }}
      />

      {/* ── subtle dot grid bg ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1f2023 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.5,
        }}
      />

      {/* ── top border accent ── */}
      <div className="fixed top-0 left-0 right-0 h-px z-50">
        <div className="h-full w-full bg-gradient-to-r from-[#FF7A00]/60 via-[#FF7A00]/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 lg:px-8 pt-10 pb-24">
        {/* ════════ PROFILE HERO HEADER ════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`relative rounded-2xl ${SURFACE} border ${BORDER} p-6 mb-6 overflow-hidden`}
        >
          {/* faint gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/[0.04] via-transparent to-transparent pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* ── Avatar + ring ── */}
            <div className="relative shrink-0">
              <CompletionRing progress={COMPLETION} size={88} stroke={3.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={avatarSrc}
                  alt={userName}
                  className="w-[72px] h-[72px] rounded-full object-cover"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-[#FF7A00] rounded-full flex items-center justify-center border-2 border-[#0c0d0e] shadow-lg"
              >
                <Camera size={11} className="text-black" />
              </motion.button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) {
                    setSelectedFile(f);
                    setPreview(URL.createObjectURL(f));
                  }
                }}
                className="hidden"
              />
            </div>

            {/* ── user meta ── */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-[#f4f4f5] truncate">
                {userName}
              </h1>
              <p className="text-[13px] text-[#6b7280] mt-0.5 truncate">
                {userEmail}
              </p>

              {/* verification badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: "Email verified", ok: true },
                  { label: "Phone verified", ok: true },
                ].map(({ label, ok }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md"
                    style={{
                      background: ok
                        ? "rgba(34,197,94,0.08)"
                        : "rgba(255,255,255,0.04)",
                      color: ok ? "#4ade80" : "#6b7280",
                      border: `1px solid ${
                        ok ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)"
                      }`,
                    }}
                  >
                    <CircleCheckBig size={11} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* ── completion text ── */}
            <div className="text-right shrink-0">
              <p className="text-[11px] text-[#6b7280] font-medium">
                Profile complete
              </p>
              <p className="text-2xl font-bold text-[#f4f4f5] mt-0.5">
                {COMPLETION}
                <span className="text-sm font-normal text-[#6b7280]">%</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* ════════ BODY: sidebar + content ════════ */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* ── SIDEBAR NAV ── */}
          <motion.nav
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className={`lg:w-48 shrink-0 rounded-2xl ${SURFACE} border ${BORDER} p-2 h-fit`}
          >
            <p className="px-4 py-2 text-[10px] font-semibold text-[#4b4d52] uppercase tracking-widest">
              Settings
            </p>
            {navTabs.map((t) => (
              <NavItem
                key={t.key}
                icon={t.icon}
                label={t.label}
                active={activeTab === t.key}
                onClick={() => setActiveTab(t.key)}
              />
            ))}
          </motion.nav>

          {/* ── CONTENT PANEL ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* ══ PROFILE TAB ══ */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`rounded-2xl ${SURFACE} border ${BORDER} p-7`}
                >
                  <SectionDivider
                    title="Personal Information"
                    description="Update your name, nationality, and contact details."
                  />

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      profileMutation.mutate();
                    }}
                    className="space-y-4"
                  >
                    {/* row 1: name + email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FloatingInput
                        label="Full Name"
                        name="fullName"
                        value={formData?.fullName}
                        onChange={handleChange}
                      />
                      <FloatingInput
                        label="Email Address"
                        name="email"
                        type="email"
                        value={userEmail}
                        readOnly
                        suffix={
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#262729] text-[#6b7280]">
                            Locked
                          </span>
                        }
                      />
                    </div>

                    {/* row 2: phone + nationality */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FloatingInput
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      <FloatingInput
                        label="Nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                      />
                    </div>

                    {/* row 3: DOB + gender */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FloatingInput
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />

                      {/* gender radio */}
                      <div>
                        <p className="text-[11px] font-medium text-[#6b7280] mb-3">
                          Gender
                        </p>
                        <div className="flex gap-3">
                          {["Male", "Female"].map((g) => {
                            const val = g.toLowerCase();
                            const checked = formData.Gender === val;
                            return (
                              <label
                                key={g}
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-[13px] font-medium ${
                                  checked
                                    ? "border-[#FF7A00]/50 bg-[#FF7A00]/08 text-[#FF7A00]"
                                    : "border-[#262729] bg-[#18191c] text-[#6b7280] hover:border-[#35373b]"
                                }`}
                                style={{
                                  background: checked
                                    ? "rgba(255,122,0,0.06)"
                                    : "",
                                }}
                              >
                                <input
                                  type="radio"
                                  name="Gender"
                                  value={val}
                                  checked={checked}
                                  onChange={handleChange}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                    checked
                                      ? "border-[#FF7A00]"
                                      : "border-[#4b4d52]"
                                  }`}
                                >
                                  {checked && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
                                  )}
                                </div>
                                {g}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* address */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#6b7280]">
                        Address
                      </label>
                      <textarea
                        name="address"
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Your address"
                        className={`${INPUT_BASE} resize-none`}
                      />
                    </div>

                    {/* save row */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1f2023]">
                      <button
                        type="button"
                        className="text-[13px] font-medium text-[#6b7280] hover:text-[#f4f4f5] transition-colors px-4 py-2 rounded-lg hover:bg-[#18191c]"
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="submit"
                        disabled={profileMutation.isPending}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-black bg-[#FF7A00] hover:bg-[#ff8f1f] disabled:opacity-50 transition-colors"
                      >
                        {profileMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : null}
                        Save changes
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ══ SECURITY TAB ══ */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-4"
                >
                  {/* ─ Update Email ─ */}
                  <div
                    className={`rounded-2xl ${SURFACE} border ${BORDER} p-7`}
                  >
                    <SectionDivider
                      title="Email Address"
                      description="Change the email associated with your account."
                    />
                    <form className="space-y-4">
                      <FloatingInput
                        label="New Email Address"
                        name="email"
                        type="email"
                        value={credentials.email}
                        onChange={handleCredentials}
                      />

                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#18191c] border border-[#262729]">
                        <AlertCircle
                          size={14}
                          className="text-[#f59e0b] shrink-0 mt-0.5"
                        />
                        <p className="text-[11.5px] text-[#9ca3af] leading-relaxed">
                          You'll receive a verification link at both your old
                          and new email address. Your email will only change
                          after you verify both links.
                        </p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-black bg-[#FF7A00] hover:bg-[#ff8f1f] transition-colors"
                        >
                          Update email
                        </motion.button>
                      </div>
                    </form>
                  </div>

                  {/* ─ Update Password ─ */}
                  <div
                    className={`rounded-2xl ${SURFACE} border ${BORDER} p-7`}
                  >
                    <SectionDivider
                      title="Password"
                      description="Choose a strong password to protect your account."
                    />
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        credentialsMutation.mutate();
                      }}
                      className="space-y-4"
                    >
                      <PasswordInput
                        label="Current Password"
                        name="currentPass"
                        value={credentials.currentPass}
                        onChange={handleCredentials}
                      />

                      <div>
                        <PasswordInput
                          label="New Password"
                          name="password"
                          value={credentials.password}
                          onChange={handleCredentials}
                        />
                        <StrengthMeter password={credentials.password} />
                      </div>

                      <PasswordInput
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={credentials.confirmPassword || ""}
                        onChange={handleCredentials}
                      />

                      <div className="flex justify-end pt-1 border-t border-[#1f2023]">
                        <motion.button
                          type="submit"
                          disabled={credentialsMutation.isPending}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-black bg-[#FF7A00] hover:bg-[#ff8f1f] disabled:opacity-50 transition-colors"
                        >
                          {credentialsMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Lock size={13} />
                          )}
                          Change password
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
