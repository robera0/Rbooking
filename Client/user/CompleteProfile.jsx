import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useService } from "@/Context/ServiceContext";

const CompleteProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { API_URL, setIsLoggedIn } = useService();
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    city: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/auth/complete-profile`, form, {
        withCredentials: true,
      });
      setIsLoggedIn(true);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0f0f0f" }}
    >
      <div className="flex flex-col gap-6 w-full max-w-md">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-white">
            Complete Your Profile
          </h2>
          <p className="text-[13px] text-white/40">
            Just a few more details to get started
          </p>
        </div>

        {error && (
          <div
            className="px-4 py-3 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest"
            style={{
              background: "rgba(255,59,48,0.10)",
              border: "1px solid rgba(255,59,48,0.20)",
              color: "#ff6b6b",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ color: "#c9a88a" }}
            >
              Full Name
            </label>
            <input
              placeholder="John Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none"
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
          <div className="flex flex-col gap-2">
            <label
              className="text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ color: "#c9a88a" }}
            >
              Phone Number
            </label>
            <input
              placeholder="+251 9xx xxx xxxx"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
              className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none"
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

          <div className="flex flex-col gap-2">
            <label
              className="text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ color: "#c9a88a" }}
            >
              City
            </label>
            <input
              placeholder="Addis Ababa"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none"
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

          <div className="flex flex-col gap-2">
            <label
              className="text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ color: "#c9a88a" }}
            >
              Date of Birth
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) =>
                setForm({ ...form, dateOfBirth: e.target.value })
              }
              className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                caretColor: "#FF7A00",
                colorScheme: "dark",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(255,122,0,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.08)")
              }
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-black text-base mt-1 transition-all active:scale-[0.97]"
            style={{
              background: "#FF7A00",
              color: "#000",
              boxShadow: "0 4px 24px rgba(255,122,0,0.35)",
            }}
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
