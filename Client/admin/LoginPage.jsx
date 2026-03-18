import { useState } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import LoginUser from "../user/LoginUser";
import { useMutation } from "@tanstack/react-query";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate("/dashboard");
    },
  });

  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#A61866]">
      <div className="w-[560px] h-[560px] flex flex-col bg-white rounded-xl space-y-8">
        {/* Header */}
        <div className="space-y-4 pt-16">
          <h1 className="text-center text-3xl font-bold">Login to Account</h1>
          <p className="text-gray-500 font-semibold text-center">
            Please enter email and password to continue
          </p>
        </div>
        {/* Form */}
        <form
          className="space-y-8 pl-14"
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
              className="w-5/6 px-3 py-3 bg-[#F1F4F9] border border-gray-300 rounded-lg outline-none"
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
              className="w-5/6 px-3 py-3 bg-[#F1F4F9] border border-gray-300 rounded-lg outline-none"
              required
            />
            {/* {iNpasssword && password.trim() !== iNpasssword.trim() &&
              <p className='text-[#F48467] font-semibold '>Wrong passsword</p>} */}
          </div>
          {/* checkbox */}
          <div className="flex items-center justify-between w-5/6 -mt-4">
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
          <div className="flex ">
            <Button width="w-5/6" bg="bg-[#AF2F75]" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
