// Client/src/pages/GoogleAuthCallback.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useService } from "@/Context/ServiceContext";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/Context/api/api.config";

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { setIsLoggedIn } = useService();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pending"); // pending | done | error

  const isNewUser = searchParams.get("isNewUser");
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      return;
    }

    api
      .post("/api/auth/google/exchange", { code })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        setIsLoggedIn(true);
        setStatus("done");
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (status === "pending") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121417]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin" />
          <span className="text-white font-black uppercase tracking-widest text-xs">
            Signing you in...
          </span>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return <Navigate to="/login?error=OAuthFail" replace />;
  }

  if (isNewUser === "true") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Navigate to="/" replace />;
};

export default GoogleAuthCallback;
