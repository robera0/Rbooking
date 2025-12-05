import { User, Lock, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  return (
    <>
      {/*to login page */}

      <div className="text-white  w-full h-[98px] flex flex-col items-center justify-center  pt-8">
        <h1 className="text-2xl font-semibold">Sign Up</h1>
        <p className="text-[#808080] ">
          Already have an account ?{" "}
          <span>
            <button
              onClick={() => navigate("/")}
              className="text-[#FF8D28] font-semibold cursor-pointer"
            >
              Login
            </button>
          </span>
        </p>
      </div>
      {/*inputs */}

      <div className="pl-6 w-full space-y-6">
        {/*username */}
        <div className=" relative flex space-x-8 ">
          <span className="absolute left-4 top-2">
            <User className="text-white" />
          </span>
          <input
            className="placeholder-[#808080] placeholder:text-sm text-white w-[90%] bg-[#323232] pl-12 h-10 rounded-xl outline-none"
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
            className="placeholder-[#808080] placeholder:text-sm text-white w-[90%] bg-[#323232] pl-12 h-10 rounded-xl outline-none"
            placeholder="Enter your password"
            type="password"
          />
          <span className="absolute right-16 top-3">
            <EyeOff className=" w-4 h-4 text-white" />
          </span>
        </div>
        {/* confirm passwords */}
        <div className=" relative flex space-x-8 ">
          <span className="absolute left-4 top-2">
            <Lock className=" w-5 h-5 text-white" />
          </span>
          <input
            className="placeholder-[#808080] placeholder:text-sm text-white w-[90%] bg-[#323232] pl-12 h-10 rounded-xl outline-none"
            placeholder="Enter your password"
            type="password"
          />
          <span className="absolute right-16 top-3">
            <EyeOff className=" w-4 h-4 text-white" />
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
        <button className=" flex  items-center  justify-center bg-[#FF7800] text-white w-[70%] h-10 text-md font-semibold rounded-xl cursor-pointer ">
          Sign Up
        </button>
      </div>
    </>
  );
};

export default SignUp;
