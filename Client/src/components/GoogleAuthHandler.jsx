import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useService } from "../Context/ServiceContext";

export const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsLoggedIn } = useService();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("access_token", token);
      setIsLoggedIn(true);
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [location, navigate, setIsLoggedIn]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#121417]">
      <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin" />
          <span className="text-white font-black uppercase tracking-widest text-xs">Authenticating Terminal...</span>
      </div>
    </div>
  );
};
