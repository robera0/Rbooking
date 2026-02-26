import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EyeOff, Eye, User, Lock } from "lucide-react";
import { useService } from "@/Context/ServiceContext";
const LoginUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const from = location.state?.from?.pathname || "/";

  const [useremail, setUseremail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { setIsLoggedIn } = useService();
  const handleEmail = (e) => {
    setUseremail(e.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const sendUsers = async (userData) => {
    const res = await axios.post(
      "http://localhost:5000/api/auth/login",
      userData,
      { withCredentials: true },
    );
    return res.data;
  };

  const mutation = useMutation({
    mutationFn: sendUsers,
    onSuccess: (data) => {
      if (data.message === "Logged in successfully") {
        setIsLoggedIn(true);
        queryClient.invalidateQueries({ queryKey: ["tickets"] });

        navigate(from, { replace: true });
      }
    },
    onError: (error) => {
      setError(error.response?.data?.message || "Login failed");
    },
  });

  const handleSignin = (e) => {
    e.preventDefault();
    setError("");
    const userData = {
      email: useremail,
      password,
    };

    mutation.mutate(userData);
  };
  return (
    <>
      {/*to login page */}

      <div className="text-white  w-full h-[88px] flex flex-col items-center justify-center  pt-8">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-[#808080] ">
          Dont have an account yet ?{" "}
          <span>
            <button
              onClick={() => navigate("/sign_up")}
              className="text-[#FF8D28] font-semibold cursor-pointer"
            >
              Sign up
            </button>
          </span>
        </p>
      </div>
      {/*inputs */}

      <div className="pl-6 w-full space-y-6">
        {error && <div className="text-red-500 text-sm pl-4">{error}</div>}
        {/*username */}
        <div className=" relative flex space-x-8 ">
          <span className="absolute left-4 top-2">
            <User className="text-white" />
          </span>
          <input
            onChange={(e) => handleEmail(e)}
            className="placeholder-[#808080] placeholder:text-sm text-white w-[90%] bg-[#323232] pl-12 h-10 rounded-xl outline-none"
            placeholder="Enter your email"
            type="text"
          />
        </div>

        {/*passwords */}
        <div className=" relative flex space-x-8 ">
          <span className="absolute left-4 top-2">
            <Lock className=" w-5 h-5 text-white" />
          </span>
          <input
            onChange={(e) => handlePassword(e)}
            className="placeholder-[#808080] placeholder:text-sm text-white w-[90%] bg-[#323232] pl-12 h-10 rounded-xl outline-none"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
          />
          <span
            className="absolute right-16 top-3 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Eye className=" w-4 h-4 text-white" />
            ) : (
              <EyeOff className=" w-4 h-4 text-white" />
            )}
          </span>
        </div>
        {/*remember me box */}
        <div className="w-full -mt-2 pl-4 flex justify-between items-center text-[#b3b3b3]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#FF8D28] rounded"
            />
            <span className="text-sm font-semibold text-[#b3b3b3]">
              Remember me
            </span>
          </label>

          <button className="mr-8 text-sm text-[#FF8D28] hover:underline">
            Forget password?
          </button>
        </div>
      </div>

      {/*Login button */}
      <div className="w-full flex justify-center">
        <button
          onClick={(e) => {
            handleSignin(e);
          }}
          className=" flex  items-center  justify-center bg-[#FF7800] text-white w-[70%] h-10 text-md font-semibold rounded-xl cursor-pointer "
        >
          Login
        </button>
      </div>
    </>
  );
};

export default LoginUser;
