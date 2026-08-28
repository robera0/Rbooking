import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../src/Context/api/api.config";
import { useNavigate, useLocation } from "react-router-dom";
import { EyeOff, Eye, Loader2, ArrowRight } from "lucide-react";
import { useService } from "@/Context/ServiceContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

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
      const res = await api.post(`/api/auth/login`, userData);
      return res.data;
    },
    onSuccess: async (data) => {
      if (data.message === "Logged in successfully") {
        setIsLoggedIn(true);
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        toast.success("Logged in successfully");
        if (data.role == "admin") return navigate("/dashboard");
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

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-6 w-full"
    >
      {/* ── HEADING ── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
          Welcome Back
        </h2>
        <p className="text-[13px] text-white/40 leading-snug">
          Log in to your Paysso account
        </p>
      </div>

      {/* ── ERROR BANNER ── */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest"
            style={{
              background: "rgba(255,59,48,0.10)",
              border: "1px solid rgba(255,59,48,0.20)",
              color: "#ff6b6b",
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSignin} className="flex flex-col gap-4">
        {/* EMAIL */}
        <div className="flex flex-col gap-2">
          <label
            className="text-[10px] font-black uppercase tracking-[0.2em] ml-0.5"
            style={{ color: "#c9a88a" }}
          >
            Email
          </label>
          <input
            autoFocus
            type="email"
            value={useremail}
            onChange={(e) => setUseremail(e.target.value)}
            placeholder="name@domain.com"
            className="w-full px-5 py-4 rounded-2xl text-white text-sm font-medium outline-none transition-all placeholder:text-white/20"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              caretColor: "#FF7A00",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(255,122,0,0.5)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(255,255,255,0.08)")
            }
          />
        </div>

        {/* PASSWORD */}
        <div className="flex flex-col gap-2">
          <label
            className="text-[10px] font-black uppercase tracking-[0.2em] ml-0.5"
            style={{ color: "#c9a88a" }}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 pr-14 rounded-2xl text-white text-sm font-medium outline-none transition-all placeholder:text-white/20"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                caretColor: "#FF7A00",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(255,122,0,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.08)")
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "rgba(201,168,138,0.5)" }}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {/* REMEMBER + FORGOT */}
        <div className="flex items-center justify-between px-0.5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              style={{ accentColor: "#FF7A00" }}
            />
            <span
              className="text-[11px] font-semibold"
              style={{ color: "#9a8070" }}
            >
              Remember me
            </span>
          </label>
          <button
            type="button"
            className="text-[11px] font-bold transition-colors hover:text-white"
            style={{ color: "#FF7A00" }}
          >
            Forgot password?
          </button>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-base transition-all active:scale-[0.97] disabled:opacity-50 mt-1"
          style={{
            background: "#FF7A00",
            color: "#000",
            boxShadow: "0 4px 24px rgba(255,122,0,0.35)",
          }}
        >
          {mutation.isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Login
              <ArrowRight size={18} strokeWidth={3} />
            </>
          )}
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3">
          <div
            className="h-px flex-1"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
          <span
            className="text-[9px] font-black uppercase tracking-[0.25em] shrink-0"
            style={{ color: "rgba(154,128,112,0.7)" }}
          >
            or continue with
          </span>
          <div
            className="h-px flex-1"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
        </div>

        {/* GOOGLE BUTTON */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-sm transition-all active:scale-[0.97]"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.09)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
          }
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              d="M12 5.04c1.94 0 3.68.67 5.05 1.97l3.77-3.77C18.54 1.25 15.52 0 12 0 7.31 0 3.32 2.69 1.4 6.65L5.64 9.92C6.65 6.94 9.59 5.04 12 5.04z"
              fill="#EA4335"
            />
            <path
              d="M24 12.27c0-.88-.08-1.74-.21-2.58H12v4.88h6.75c-.29 1.56-1.17 2.89-2.5 3.77l4.03 3.13C22.65 19.34 24 16.03 24 12.27z"
              fill="#FBBC05"
            />
            <path
              d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-4.03-3.13c-1.11.75-2.52 1.19-3.92 1.19-3.02 0-5.58-2.04-6.49-4.79L1.31 17.61C3.21 21.36 7.29 24 12 24z"
              fill="#4285F4"
            />
            <path
              d="M5.51 14.35c-.24-.71-.38-1.47-.38-2.26s.14-1.55.38-2.26L1.31 6.65C.47 8.27 0 10.08 0 12s.47 3.73 1.31 5.35l4.2-3z"
              fill="#34A853"
            />
          </svg>
          Continue with Google
        </button>
      </form>

      {/* FOOTER */}
      <p className="text-sm text-center" style={{ color: "#9a8070" }}>
        New to Paysso?{" "}
        <a
          href="/sign_up"
          className="font-bold hover:underline transition-all"
          style={{ color: "#FF7A00" }}
        >
          Create account
        </a>
      </p>
    </motion.div>
  );
};

export default LoginUser;
