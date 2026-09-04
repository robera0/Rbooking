import { useState } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useService } from "../src/Context/ServiceContext";
import api from "../src/Context/api/api.config";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setIsLoggedIn } = useService();

  const loginMutation = useMutation({
    mutationFn: async (userData) => {
      const res = await api.post(`/api/auth/login`, userData);
      return res.data;
    },
    onSuccess: async (data) => {
      if (data.role !== "admin") {
         toast.error("You are not authorized as an admin");
         return;
      }
      setIsLoggedIn(true);
      queryClient.removeQueries({ queryKey: ["user"] });
      await queryClient.refetchQueries({ queryKey: ["user"] });
      toast.success("Logged in successfully");
      navigate("/admin/home");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    }
  });

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-[#A61866] p-4">
      <div className="w-full max-w-lg min-h-[560px] flex flex-col bg-white rounded-xl space-y-8 py-8 shadow-2xl">
        {/* Header */}
        <div className="space-y-4 pt-4 sm:pt-8">
          <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-800">Login to Account</h1>
          <p className="text-gray-500 font-semibold text-center text-sm sm:text-base px-4">
            Please enter email and password to continue
          </p>
        </div>
        {/* Form */}
        <form
          className="space-y-8 px-6 sm:pl-14 sm:pr-8"
          onSubmit={(e) => {
            e.preventDefault();
            loginMutation.mutate({ email, password });
          }}
        >
          {/* Email */}
          <div className="flex flex-col space-y-2">
            <label className="font-bold text-gray-500" htmlFor="email">
              Email address :
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:w-5/6 px-3 py-3 bg-[#F1F4F9] border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#A61866]/50 transition-all text-black"
              required
            />
            {/* {inEmail && email.trim().toLowerCase() !== inEmail.trim().toLowerCase() &&
              <p className='text-[#F48467] font-semibold '>invalid Email</p>} */}
          </div>
          {/* Password */}
          <div className="flex flex-col space-y-2">
            <label className="font-bold text-gray-500" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full sm:w-5/6 px-3 py-3 bg-[#F1F4F9] border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#A61866]/50 transition-all text-black"
              required
            />
            {/* {iNpasssword && password.trim() !== iNpasssword.trim() &&
              <p className='text-[#F48467] font-semibold '>Wrong passsword</p>} */}
          </div>
          {/* checkbox */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full sm:w-5/6 -mt-4 gap-4 sm:gap-0">
            <div className="flex items-center space-x-2">
              <input
                id="checkbox"
                name="checkbox"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
              />
              <label htmlFor="checkbox" className="text-gray-600 font-medium">
                Remember Password
              </label>
            </div>
            <button
              type="button"
              className="text-[#88ACFF] font-semibold hover:underline"
            >
              Forget Password?
            </button>
          </div>
          {/* Sign in button */}
          <div className="flex w-full sm:w-5/6 pt-4">
            <Button width="w-full" bg="bg-[#AF2F75]" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
