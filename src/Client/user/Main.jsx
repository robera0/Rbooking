import { Scissors, Menu, Lock } from "lucide-react";

const Main = ({ children }) => {
  return (
    <div>
      <div className="flex h-screen bg-[#222529] flex-col  justify-between">
        <div className="flex justify-between lg:hidden text-white mt-2  p-6">
          <div className="flex  space-x-2">
            <Scissors className="text-[#B3B3B3] mt-2 w-8 h-8" />
            <h1 className="font-irish text-xl w-12 text-white font bold">
              Kuretegn Event
            </h1>
          </div>

          <div className="flex justify-center">
            <button>
              <span>
                <Menu />
              </span>
            </button>
          </div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default Main;
