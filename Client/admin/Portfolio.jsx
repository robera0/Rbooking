import { useSalonContext } from "@/Context/salonContext";
const Portfolio = () => {
  const { salonDetail } = useSalonContext();
  return (
    <div className="w-full px-16 ">
      <div className="w-full space-y-8">
        <div className="flex justify-between">
          <h1 className="text-2xl font-semibold"> Portfolio </h1>
          <button className="w-42 h-12 px-2 py-3 text-[#A61866] font-semibold bg-white  outline-1 outline-offset-0 border border-[#A61866] rounded-full cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 space-x-4">
            Manage Gallery
          </button>
        </div>
        {/*images */}
        <div className="flex flex-wrap gap-14 ">
          {salonDetail?.portfolio[0]?.map((_, idx) => (
            <>
              <div
                key={idx}
                className=" w-44 h-44 rounded-md overflow-hidden flex items-center justify-center"
              >
                <img
                  className="w-full h-full object-cover"
                  src="/download.jpeg"
                  alt="download Logo"
                />
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
