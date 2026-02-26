import { Scissors, User, Lock } from "lucide-react";

const AccountPage = ({ children, pa, h }) => {
  return (
    <div
      style={{ backgroundImage: 'url("/Login.jpg")' }}
      className="bg-center  overflow-hidden  bg-cover min-h-screen lg-flex lg:items-center lg:pl-20 lg-p-6"
    >
      <div className="flex h-screen  flex-col  justify-between">
        <div className="lg:hidden text-white mt-12  space-y-6 p-6">
          <div className="flex  space-x-2">
            <Scissors className="text-[#B3B3B3] mt-2 w-12 h-12" />
            <h1 className="font-irish text-3xl w-12 text-white font bold">
              Vibein Pass
            </h1>
          </div>
          <p className="text-xl font-semibold ">{pa}</p>
        </div>

        <div
          className={`lg:hidden flex flex-col  w-screen ${h} bg-[#191B1D] rounded-t-[50px] space-y-12`}
        >
          {children}
        </div>
      </div>
      {/*web view */}
      <div className="hidden md:block w-full max-w-xl bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10">
        <div>
          <h1 className="text-white font-bold text-xl lg:text-4xl">
            Welcome To Vibein Pass
          </h1>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
