import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../src/Context/api/api.config";

const fieldStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  caretColor: "#FF7A00",
};

const buttonClass =
  "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-base cursor-pointer transition-all duration-150 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121417]";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetPage = location.pathname === "/reset-password";
  const token = new URLSearchParams(location.search).get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const emailMutation = useMutation({
    mutationFn: (value) => api.post("/api/auth/forgot-password", { email: value }),
    onSuccess: () => {
      setError("");
      setEmailSent(true);
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Unable to send the reset email.");
    },
  });

  const resetMutation = useMutation({
    mutationFn: (value) => api.post("/api/auth/reset-password", value),
    onSuccess: () => {
      setError("");
      setResetComplete(true);
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Unable to reset your password.");
    },
  });

  const submitEmail = (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    emailMutation.mutate(trimmedEmail);
  };

  const submitPassword = (event) => {
    event.preventDefault();
    if (!token) {
      setError("This reset link is missing or invalid.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    resetMutation.mutate({ token, password });
  };

  if (resetPage && resetComplete) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400"><Check size={24} /></div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">Password updated</h2>
          <p className="text-[13px] leading-relaxed text-white/40">Your password has been changed. You can now sign in.</p>
        </div>
        <button type="button" onClick={() => navigate("/login")} className={buttonClass} style={{ background: "#FF7A00", color: "#000" }}>
          Back to login <ArrowRight size={18} strokeWidth={3} />
        </button>
      </div>
    );
  }

  if (resetPage) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <button type="button" onClick={() => navigate("/login")} className="flex items-center gap-2 self-start text-[11px] font-bold text-white/45 hover:text-white transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] rounded-md cursor-pointer">
          <ArrowLeft size={15} /> Back to login
        </button>
        <div className="flex flex-col gap-2">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]"><LockKeyhole size={20} /></div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">Create a new password</h2>
          <p className="text-[13px] text-white/40 leading-relaxed">Choose a strong password for your PAYSSO account.</p>
        </div>
        {error && <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-xs text-red-300">{error}</p>}
        <form onSubmit={submitPassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="new-password" className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#c9a88a" }}>New password</label>
            <div className="relative">
              <input id="new-password" autoFocus type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="w-full px-5 py-4 pr-14 rounded-2xl text-white text-sm font-medium outline-none" style={fieldStyle} />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer" aria-label="Show or hide password">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#c9a88a" }}>Confirm password</label>
            <div className="relative">
              <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" className="w-full px-5 py-4 pr-14 rounded-2xl text-white text-sm font-medium outline-none" style={fieldStyle} />
              <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer" aria-label="Show or hide confirmation password">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="submit" disabled={resetMutation.isPending} className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-60`} style={{ background: "#FF7A00", color: "#000", boxShadow: "0 4px 24px rgba(255,122,0,0.35)" }}>
            {resetMutation.isPending ? "Saving..." : <>Save new password <ArrowRight size={18} strokeWidth={3} /></>}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <button type="button" onClick={() => navigate("/login")} className="flex items-center gap-2 self-start text-[11px] font-bold text-white/45 hover:text-white transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] rounded-md cursor-pointer"><ArrowLeft size={15} /> Back</button>
      <div className="flex flex-col gap-2">
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]"><Mail size={20} /></div>
        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">Forgot password?</h2>
        <p className="text-[13px] text-white/40 leading-relaxed">Enter your email address and we’ll send you a password reset link.</p>
      </div>
      {error && <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-xs text-red-300">{error}</p>}
      {emailSent ? (
        <div className="rounded-2xl border border-[#FF7A00]/20 bg-[#FF7A00]/10 px-5 py-4 text-center text-sm text-white/70">Check your email for a password reset link.</div>
      ) : (
        <form onSubmit={submitEmail} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="recovery-email" className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#c9a88a" }}>Email</label>
            <input id="recovery-email" autoFocus type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@domain.com" className="w-full px-5 py-4 rounded-2xl text-white text-sm font-medium outline-none" style={fieldStyle} />
          </div>
          <button type="submit" disabled={emailMutation.isPending} className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-60`} style={{ background: "#FF7A00", color: "#000", boxShadow: "0 4px 24px rgba(255,122,0,0.35)" }}>
            {emailMutation.isPending ? "Sending..." : <>Send reset link <ArrowRight size={18} strokeWidth={3} /></>}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
