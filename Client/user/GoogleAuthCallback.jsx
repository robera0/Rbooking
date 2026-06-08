// Client/src/pages/GoogleAuthCallback.jsx
import { useSearchParams, Navigate } from "react-router-dom";
import { useService } from "@/Context/ServiceContext";
import { useQueryClient } from "@tanstack/react-query";
const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { setIsLoggedIn } = useService();
  const queryClient = useQueryClient();

  const isNewUser = searchParams.get("isNewUser");

  // force refetch user query
  queryClient.invalidateQueries({ queryKey: ["user"] });
  queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  setIsLoggedIn(true);

  if (isNewUser === "true") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Navigate to="/" replace />;
};

export default GoogleAuthCallback;
