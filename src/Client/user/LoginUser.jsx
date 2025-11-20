import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
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

  const sendUsers = (userData) => {
    const res = axios.post("http://localhost:5000/api/login", userData);
    return res.data;
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: sendUsers,
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      setAddservice(false);
    },
  });

  const handleSignin = () => {
    const formData = new FormData();

    formData.append("username", username);
    formData.append("password", password);

    mutation.mutate(formData);
  };
  return (
    <div
      style={{ backgroundImage: 'url("/Login.jpg")' }}
      className="bg-center bg-cover min-h-screen flex items-center pl-20 p-6"
    >
      <div className="w-full max-w-xl bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10">
        <h1 className="text-4xl font-extrabold mb-10 text-[#FF7800] tracking-tight text-left">
          Welcome Back To Kuretugn
        </h1>

        {/* Form */}
        <form className="space-y-6">
          {/* Username */}
          <div className="flex items-center bg-white/20 backdrop-blur-md rounded-xl px-4 py-3 shadow-md focus-within:ring-2 focus-within:ring-[#FF7800] transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-300 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M19 21v-2a4 4 0 0 0-4-4H9a4 
                  4 0 0 0-4 4v2"
              ></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input
              type="text"
              onChange={handleusername}
              placeholder="Enter username"
              className="flex-1 bg-transparent text-white focus:outline-none placeholder-gray-300"
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-white/20 backdrop-blur-md rounded-xl px-4 py-3 shadow-md focus-within:ring-2 focus-within:ring-[#FF7800] transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-300 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              type="password"
              onChange={handlePassword}
              placeholder="Password"
              className="flex-1 bg-transparent text-white focus:outline-none placeholder-gray-300"
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            onClick={handleSignin}
            className="w-full bg-[#FF7800] text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition"
          >
            Sign in
          </button>
        </form>

        {/* Sign in as Student */}
        <Link to="/" className="mt-5 w-full block">
          <button className="w-full bg-[#FF7800] text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition">
            Sign in as Student
          </button>
        </Link>

        <p className="text-center text-sm text-gray-300 mt-6">
          © 2025 Kuretugn Event handling. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginUser;
