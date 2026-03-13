import SideBar from "./SideBar";
import Header from "./Header";

const Home = ({ children }) => {
  return (
    <div className="flex  h-screen">
      {/* Sidebar */}
      <div className="w-1/7 bg-[#A61866]">
        <SideBar />
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div
            className={` font-popins w-full  min-h-screen pl-8 pt-8  bg-white  `}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Home;
