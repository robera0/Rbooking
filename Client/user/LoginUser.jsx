import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { EyeOff, Eye, User, Lock, Loader2, ArrowRight } from "lucide-react";
import { useService } from "@/Context/ServiceContext";
import { motion, AnimatePresence } from "framer-motion";

const LoginUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const queryClient = useQueryClient();

  const [useremail, setUseremail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { setIsLoggedIn, API_URL } = useService();

  const mutation = useMutation({
    mutationFn: async (userData) => {
      const res = await axios.post(`${API_URL}/api/auth/login`, userData, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.message === "Logged in successfully") {
        setIsLoggedIn(true);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        navigate(from, { replace: true });
      }
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Something went wrong.");
    },
  });

  const handleSignin = (e) => {
    e.preventDefault();
    if (!useremail || !password) return setError("All fields are required");
    setError("");
    mutation.mutate({ email: useremail, password });
  };

  // Logic for Google Redirect (Commonly handled via Backend redirect)
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Error Message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] py-3 rounded-xl text-center font-black uppercase tracking-widest"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form className="space-y-4" onSubmit={handleSignin}>
        {/* Email Input */}
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FF7800] transition-colors">
            <User size={18} />
          </span>
          <input
            autoFocus
            onChange={(e) => setUseremail(e.target.value)}
            className="w-full bg-[#323232]/30 border border-white/[0.05] focus:border-[#FF7800]/50 text-white pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-600 text-sm font-medium"
            placeholder="Email address"
            type="email"
          />
        </div>

        {/* Password Input */}
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FF7800] transition-colors">
            <Lock size={18} />
          </span>
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#323232]/30 border border-white/[0.05] focus:border-[#FF7800]/50 text-white pl-12 pr-12 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-600 text-sm font-medium"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {/* Action Links */}
        <div className="flex justify-between items-center px-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#FF7800] rounded bg-[#323232] border-none"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-400">
              Remember
            </span>
          </label>
          <button
            type="button"
            className="text-[10px] font-black uppercase tracking-widest text-[#FF8D28] hover:text-white"
          >
            Forgot?
          </button>
        </div>

        <div className="pt-4 space-y-4">
          {/* Primary Login Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#FF7800] hover:bg-white text-black h-14 text-xs font-black uppercase tracking-[0.25em] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Login <ArrowRight size={16} strokeWidth={3} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
              OR
            </span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-white h-14 text-xs font-black uppercase tracking-[0.25em] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginUser;
