// Client/src/pages/GoogleAuthCallback.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import api from "@/Context/api/api.config";

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("pending"); // pending | error

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
        // Full reload instead of a client-side route change: the backend
        // here can take a second or two per request, so a client-side
        // navigation can land on the home page before the "user" query
        // has actually resolved with the newly-set cookie, making it look
        // like sign-in silently failed until something else (e.g.
        // clicking profile, or a manual refresh) re-fetches it. A full
        // reload re-runs everything fresh against the cookie that's
        // already set by this point, same as what manually refreshing
        // was already fixing.
        const redirectTo = sessionStorage.getItem("postLoginRedirect");
        sessionStorage.removeItem("postLoginRedirect");
        window.location.href =
          isNewUser === "true" ? "/complete-profile" : redirectTo || "/";
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (status === "error") {
    return <Navigate to="/login?error=OAuthFail" replace />;
  }

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
};

export default GoogleAuthCallback;
