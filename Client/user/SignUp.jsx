import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useService } from "@/Context/ServiceContext";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import api from "../src/Context/api/api.config";

const SignUp = () => {
  const navigate = useNavigate();
  const { API_URL } = useService();
  const [roleSelection, setRoleSelection] = useState(null); // null, 'user', or 'admin'

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdminSelect = () => {
    navigate("/admin/register");
  };

  const registerUserMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/api/auth/signup/user`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully!");
      setFormData({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
        rememberMe: false,
      });
      setTimeout(() => navigate("/login"), 1500);
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullname || !formData.email || !formData.password) {
      return toast.error("Please fill in all required fields");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    registerUserMutation.mutate({
      fullname: formData.fullname,
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });
  };

  // If role is not selected, show the two cards
  if (!roleSelection) {
    return (
      <div className="w-full flex flex-col items-center pt-8 px-6">

        <div className="text-white w-full flex flex-col items-center justify-center mb-10">
          <h1 className="text-2xl font-semibold mb-2">Join Paysso</h1>
          <p className="text-[#808080] text-center text-sm">
            How would you like to use our platform?
          </p>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={() => setRoleSelection("user")}
            className="w-full bg-[#323232] hover:bg-[#404040] transition-colors border border-transparent hover:border-[#FF7800] p-6 rounded-2xl flex items-center space-x-4 group text-left"
          >
            <div className="bg-[#1C1F22] p-4 rounded-full group-hover:text-[#FF7800] text-gray-400 transition-colors">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">As a User</h2>
              <p className="text-[#808080] text-sm mt-1">
                Discover and book tickets for amazing events.
              </p>
            </div>
          </button>

          <button
            onClick={handleAdminSelect}
            className="w-full bg-[#323232] hover:bg-[#404040] transition-colors border border-transparent hover:border-[#FF7800] p-6 rounded-2xl flex items-center space-x-4 group text-left"
          >
            <div className="bg-[#1C1F22] p-4 rounded-full group-hover:text-[#FF7800] text-gray-400 transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">As an Admin</h2>
              <p className="text-[#808080] text-sm mt-1">
                Create and manage your own events and tickets.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-8">
          <p className="text-[#808080] text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#FF8D28] font-semibold cursor-pointer hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  // If user is selected, show the User Registration Form
  return (
    <>

      <div className="text-white w-full h-[98px] flex flex-col items-center justify-center pt-8 relative">
        <button
          onClick={() => setRoleSelection(null)}
          className="absolute left-6 top-8 text-gray-400 hover:text-white transition-colors"
          title="Back to selection"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold">User Sign Up</h1>
        <p className="text-[#808080] mt-1 text-sm">
          Already have an account ?{" "}
          <span>
            <button
              onClick={() => navigate("/login")}
              className="text-[#FF8D28] font-semibold cursor-pointer"
            >
              Login
            </button>
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 w-full space-y-6 mt-4">
        {/* fullname */}
        <div className="relative flex items-center justify-center">
          <span className="absolute left-4">
            <User className="text-[#808080] w-5 h-5" />
          </span>
          <input
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="placeholder-[#808080] placeholder:text-sm text-white w-full bg-[#323232] pl-12 h-12 rounded-xl outline-none border border-transparent focus:border-[#FF7800]"
            placeholder="Enter your full name"
            type="text"
            required
          />
        </div>

        {/* email */}
        <div className="relative flex items-center justify-center">
          <span className="absolute left-4">
            <Mail className="text-[#808080] w-5 h-5" />
          </span>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="placeholder-[#808080] placeholder:text-sm text-white w-full bg-[#323232] pl-12 h-12 rounded-xl outline-none border border-transparent focus:border-[#FF7800]"
            placeholder="Enter your email"
            type="email"
            required
          />
        </div>

        {/* password */}
        <div className="relative flex items-center justify-center">
          <span className="absolute left-4">
            <Lock className="w-5 h-5 text-[#808080]" />
          </span>
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="placeholder-[#808080] placeholder:text-sm text-white w-full bg-[#323232] pl-12 pr-12 h-12 rounded-xl outline-none border border-transparent focus:border-[#FF7800]"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 cursor-pointer"
          >
            {showPassword ? (
              <Eye className="w-4 h-4 text-[#808080] hover:text-white" />
            ) : (
              <EyeOff className="w-4 h-4 text-[#808080] hover:text-white" />
            )}
          </button>
        </div>

        {/* confirm password */}
        <div className="relative flex items-center justify-center">
          <span className="absolute left-4">
            <Lock className="w-5 h-5 text-[#808080]" />
          </span>
          <input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="placeholder-[#808080] placeholder:text-sm text-white w-full bg-[#323232] pl-12 pr-12 h-12 rounded-xl outline-none border border-transparent focus:border-[#FF7800]"
            placeholder="Confirm your password"
            type={showConfirmPassword ? "text" : "password"}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-4 cursor-pointer"
          >
            {showConfirmPassword ? (
              <Eye className="w-4 h-4 text-[#808080] hover:text-white" />
            ) : (
              <EyeOff className="w-4 h-4 text-[#808080] hover:text-white" />
            )}
          </button>
        </div>

        {formData.confirmPassword &&
          formData.password !== formData.confirmPassword && (
            <p className="text-xs text-red-400 -mt-4">Passwords do not match</p>
          )}

        {/* remember me box */}
        <div className="w-full flex justify-between items-center text-[#b3b3b3] mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 accent-[#FF8D28] rounded"
            />
            <span className="text-sm font-semibold text-[#b3b3b3]">
              Remember me
            </span>
          </label>
        </div>

        <div className="w-full flex justify-center pt-2">
          <button
            type="submit"
            disabled={registerUserMutation.isPending}
            className="flex items-center justify-center bg-[#FF7800] hover:bg-[#ff8c28] transition-colors text-white w-full h-12 text-md font-semibold rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {registerUserMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default SignUp;
