import SideBar from "./SideBar";
import Header from "./Header";

const Home = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#121417] text-white selection:bg-[#FF7A00]/20 font-onest overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 lg:w-[280px] shrink-0 bg-[#1C1F22] border-r border-white/[0.06] z-20">
        <SideBar />
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        <Header />
        <main className="flex-1 overflow-y-auto scroll-hidden relative">
          <div className="w-full min-h-full px-6 md:px-10 py-8 lg:py-10 max-w-[1600px] mx-auto pb-32">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Home;
