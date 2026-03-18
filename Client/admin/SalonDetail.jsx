import { PencilLine, Star } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTelegram,
} from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Portfolio from "./Portfolio";
import Service from "./Service";
import Verification from "./Verification";
import Review from "./Review";
import Performance from "./Performance";
import { AnimatePresence, motion } from "framer-motion";
import { useSalonContext } from "@/Context/salonContext";
const SalonDetail = () => {
  const navigate = useNavigate();
  const [isActive, setisActive] = useState("Portfolio");
  const { salonDetail } = useSalonContext();
  const registrationDate = new Date(
    salonDetail?.createdAt,
  ).toLocaleDateString();

  const handleisActive = (indx) => {
    setisActive((prev) => (prev === indx ? null : indx));
  };
  const pageVariants = {
    initial: { opacity: 0, x: 20, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.98 },
  };

  const pageTransition = {
    duration: 0.7,
    ease: [0.25, 0.1, 0.25, 1],
  };
  const PageWrapper = ({ children }) => (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );

  return (
    <div>
      <div className="w-[92%] space-y-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-semibold"> Salon Details </h1>
          <button
            onClick={() => navigate("/salon")}
            className="w-42 h-12 px-2 py-3 text-[#A61866] font-semibold bg-white  outline-1 outline-offset-0 border border-[#A61866] rounded-md cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 space-x-4"
          >
            Back to List
          </button>
        </div>
        <div className="mt-5 flex  flex-wrap gap-14">
          {/*Right Side */}
          <div className="w-[500px] h-[450px] px-8 py-4 rounded-lg shadow-sm">
            <div className="w-full flex justify-between">
              {/* info */}
              <div className="space-y-8 w-full">
                {/* Profile Image */}
                <div className="border w-22 h-22 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      salonDetail?.avatar ? salonDetail?.avatar : "/salons.jpeg"
                    }
                    alt="Salon Logo"
                  />
                </div>
                {/* Name */}
                <h1 className="text-2xl font-bold">{salonDetail?.name}</h1>
                {/* About  */}
                <div className="flex w-full items-center mb-5 justify-between">
                  <h1 className="text-lg font-semibold">About</h1>
                  <div className="flex  items-center space-x-1">
                    <Star className="w-4 h-4 fill-[#FFE500] text-[#FFE500]" />
                    <h1 className="text-lg ">{salonDetail?.rating}</h1>
                  </div>
                </div>
              </div>
              {/*button */}
              <div className="flex-1 mr-3 w-full">
                <button className="w-full   h-10 cursor-pointer">
                  <PencilLine strokeWidth={2} className="w-7 h-7" />
                </button>
              </div>
            </div>
            <div className="w-[95%] h-22 pt-8 flex flex-col space-y-6 border-t  border-t-gray-400">
              <div className="w-full text-gray-500">{salonDetail?.bio}</div>
              <div className="flex space-x-3">
                <FontAwesomeIcon
                  className="text-[#A61866] text-3xl"
                  icon={faFacebook}
                />
                <FontAwesomeIcon
                  className="text-[#A61866] text-3xl"
                  icon={faTelegram}
                />
                <FontAwesomeIcon
                  className="text-[#A61866] text-3xl"
                  icon={faInstagram}
                />
              </div>
            </div>
          </div>

          {/*Left Side */}
          <div className="flex-1 h-[450px] px-4 py-4 rounded-xl shadow-sm">
            <div className=" flex justify-between">
              {/*info */}
              <div className="text-lg space-y-10  mb-2 w-[450px]">
                <div className="flex space-x-2 border-b border-b-gray-400">
                  <h1 className="font-semibold">ID:</h1>
                  <p className="text-gray-600  mb-2 ">{salonDetail?.id}</p>
                </div>
                <div className="flex space-x-2 border-b border-b-gray-400">
                  <h1 className="font-semibold">Address:</h1>
                  <p className="text-gray-600 mb-2 ">{salonDetail?.address}</p>
                </div>
                <div className="flex space-x-2 border-b border-b-gray-400">
                  <h1 className="font-semibold">Email:</h1>
                  <p className="text-gray-600 mb-2">{salonDetail?.email}</p>
                </div>
                <div className="flex space-x-2 border-b border-b-gray-400">
                  <h1 className="font-semibold">Phone no:</h1>
                  <p className="text-gray-600 mb-2">
                    {salonDetail?.phoneNumber}
                  </p>
                </div>
                <div className="flex space-x-2 ">
                  <h1 className="font-semibold">Registration Date:</h1>
                  <p className="text-gray-600">{registrationDate}</p>
                </div>
              </div>
              {/*button */}
              <div className=" mr-12">
                <button className="w-22 h-10  px-2  py-2 text-[#A61866] font-semibold bg-white  outline-1 outline-offset-0 border border-[#A61866] rounded-full cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 space-x-4">
                  Edit
                </button>
              </div>
            </div>
            <div className="w-[95%] h-22  flex items-center border-t  border-t-gray-400">
              <div className="w-full text-lg flex justify-between">
                <h1 className="font-semibold">Verification Status</h1>
                <h1 className="text-[#49CBB7] mr-12 font-bold">Verified</h1>
              </div>
            </div>
          </div>
        </div>
        {/*footer section */}

        <div className="w-full flex  space-x-16 mt-10">
          <header
            onClick={() => handleisActive("Portfolio")}
            className={`w-42  flex justify-center ${isActive == "Portfolio" && "border-b-2 border-b-[#A61866] text-[#A61866]"}  pb-2 cursor-pointer transition duration-300 ease-in-out`}
          >
            <h1 className=" text-2xl font-semibold">Portfolio</h1>
          </header>
          {/*Service */}
          <header
            onClick={() => handleisActive("Service")}
            className={`w-42  flex justify-center ${isActive == "Service" && "border-b-2 border-b-[#A61866] text-[#A61866]"}  pb-2 cursor-pointer transition duration-300 ease-in-out`}
          >
            <h1 className="text-2xl font-semibold">Service</h1>
          </header>

          {/*Verification */}
          <header
            onClick={() => handleisActive("Verification")}
            className={`w-42  flex justify-center ${isActive == "Verification" && "border-b-2 border-b-[#A61866] text-[#A61866]"}  pb-2 cursor-pointer transition duration-300 ease-in-out`}
          >
            <h1 className="text-2xl font-semibold">Verification</h1>
          </header>

          {/*performance Matrics */}
          <header
            onClick={() => handleisActive("Performance")}
            className={`w-62  flex justify-center ${isActive == "Performance" && "border-b-2 border-b-[#A61866] text-[#A61866]"}  pb-2 cursor-pointer transition duration-300 ease-in-out`}
          >
            <h1 className="text-2xl font-semibold">Performance Matrics </h1>
          </header>

          {/* Review */}
          <header
            onClick={() => handleisActive("Review")}
            className={`w-42  flex justify-center ${isActive == "Review" && "border-b-2 border-b-[#A61866] text-[#A61866]"}  pb-2 cursor-pointer transition duration-300 ease-in-out`}
          >
            <h1 className="text-2xl font-semibold">Reviews</h1>
          </header>
        </div>
        {/*Main Contetn */}
        <AnimatePresence mode="wait">
          <div className="w-[105%] mt-16 mb-12">
            {isActive == "Portfolio" && (
              <PageWrapper>
                <Portfolio />
              </PageWrapper>
            )}

            {isActive == "Service" && (
              <PageWrapper>
                <Service />
              </PageWrapper>
            )}

            {isActive == "Verification" && (
              <PageWrapper>
                <Verification />
              </PageWrapper>
            )}

            {isActive == "Performance" && (
              <PageWrapper>
                <Performance />
              </PageWrapper>
            )}

            {isActive == "Review" && (
              <PageWrapper>
                <Review />
              </PageWrapper>
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SalonDetail;
