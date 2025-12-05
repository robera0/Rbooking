import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Scissors, User, Lock } from "lucide-react";

const LoginUser = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleusername = (e) => {
    setUsername(e.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const sendUsers = async (userData) => {
    const res = await axios.post("http://localhost:5000/api/login", userData);
    return res.data;
  };

  const mutation = useMutation({
    mutationFn: sendUsers,
    onSuccess: (data) => {
      if (data.message === "Login successful") {
        navigate("/event_home");
      }
    },
  });

  const handleSignin = (e) => {
    e.preventDefault();
    const userData = {
      username,
      password,
    };

    mutation.mutate(userData);
  };
  return (
    <div
      style={{ backgroundImage: 'url("/Login.jpg")' }}
      className="bg-center  overflow-hidden  bg-cover min-h-screen lg-flex lg:items-center lg:pl-20 lg-p-6"
    >
      <div className="flex h-screen  flex-col justify-between">
        <div className="lg:hidden text-white  space-y-6 p-6">
          <div className="flex  space-x-2">
            <Scissors className="text-[#B3B3B3] mt-4 w-14 h-14" />
            <h1 className="font-irish text-4xl w-12 text-white font bold">
              Kuretegn Event
            </h1>
          </div>
          <p className="text-xl font-semibold ">
            Login in to see the best of Events and Exhibitions
          </p>
        </div>
        {/*to login page */}
        <div class="lg:hidden flex flex-col  w-screen h-100 bg-[#191B1D] rounded-t-[50px] space-y-12">
          <div className="text-white  w-full h-[88px] flex flex-col items-center justify-center  pt-8">
            <h1 className="text-2xl font-semibold">Login</h1>
            <p className="text-[#808080] ">
              Dont have an account yet ?{" "}
              <span>
                <button className="text-[#FF8D28] font-semibold cursor-pointer">
                  Sign up
                </button>
              </span>
            </p>
          </div>
          {/*inputs */}

          <div className="pl-6 w-full space-y-8">
            {/*username */}
            <div className=" relative flex space-x-8 ">
              <span className="absolute left-4 top-2">
                <User className="text-white" />
              </span>
              <input
                className="placeholder-[#808080] placeholder:text-sm w-[90%] bg-[#323232] pl-12 h-10 rounded-xl outline-none"
                placeholder="Enter your username"
                type="text"
              />
            </div>

            {/*passwords */}
            <div className=" relative flex space-x-8 ">
              <span className="absolute left-4 top-2">
                <Lock className=" w-5 h-5 text-white" />
              </span>
              <input
                className="placeholder-[#808080] placeholder:text-sm w-[90%] bg-[#323232] pl-12 h-10 rounded-xl outline-none"
                placeholder="Enter your password"
                type="text"
              />
            </div>
            {/*remember me box */}
            <label class="flex items-center -mt-4 pl-4 gap-2 cursor-pointer">
              <input
                type="checkbox"
                class="w-4 h-4 accent-[#FF8D28] accent-[#D9D9D9]"
              />
              <span class="text-sm text-white">Remember me</span>
            </label>
          </div>
        </div>
      </div>

      <div className="hidden md:block w-full max-w-xl bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10">
        <div>
          <h1 className="text-white font-bold text-xl lg:text-4xl">
            Welcome To Kuretegn
          </h1>
        </div>
      </div>
    </div>
  );
};

export default LoginUser;
