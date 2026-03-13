import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloudUpload, Check, Save, Send, CalendarClock } from "lucide-react";

const CreateNotification = () => {
  const navigate = useNavigate();

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
  const [notificationImage, setNotificationImage] = useState("");
  const [selectedProviders, setSelectedProviders] = useState([]);
  const providers = [
    "All Users",
    "Customer only",
    "Salon only",
    "Customer selection",
  ];
  const handleProviderChange = (provider) => {
    if (selectedProviders.includes(provider)) {
      setSelectedProviders(selectedProviders.filter((p) => p !== provider));
    } else {
      setSelectedProviders([...selectedProviders, provider]);
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setNotificationImage(objectUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setNotificationImage(file);
  };
  const handleDragOver = (e) => e.preventDefault();

  const ActionButton = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-72 h-12 px-4 py-3 text-[#A61866] font-bold 
               bg-white border-2 border-[#A61866] rounded-full cursor-pointer 
               hover:bg-[#A61866] hover:text-white transition-all duration-300 ease-in-out space-x-2"
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div>
      <div className="w-[98%] space-y-5">
        <div className="flex justify-between">
          <h1 className="text-3xl font-semibold">Create Notification </h1>
          <button
            onClick={() => navigate("/marketing")}
            className="w-42 h-12 px-2 py-3 text-[#A61866] font-semibold bg-white  outline-1 outline-offset-0 border border-[#A61866]
                 rounded-md cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 space-x-4"
          >
            Back to List
          </button>
        </div>

        <div className="mt-5 w-full mt-12 flex px- flex-wrap gap-8">
          {/*Right Side */}
          <div className="w-[950px] h-[800px] bg-white  mb-10 flex flex-col space-y-4 px-8 py-6 rounded-xl shadow-sm">
            <div className="space-y-3">
              <h1 className="font-semibold text-2xl">Notificaion Detials</h1>
              <p className="w-full text-gray-500">
                Create a new notification to send for users
              </p>
            </div>

            {/*Notificaion input */}
            <div className="w-[98%] space-y-2">
              <h1 className="font-semibold">Notificaion Title </h1>
              <input
                className="w-full h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-lg"
                type="text"
                placeholder="Enter a short title"
              />
              <p className="text-md  text-gray-400"> maximum 120 characters</p>
            </div>

            {/*Notificaion Message */}
            <div className=" w-[98%] space-y-2">
              <h1 className="">Notificaion Message </h1>
              <input
                className="w-full h-[180px] pb-30 pl-4 border border-gray-400 bg-gray-100 outline-none  rounded-lg"
                type="text"
                placeholder="Enter notification message here"
              />
              <p className="text-md text-gray-400"> maximum 1000 characters</p>
            </div>

            {/*image upload */}

            <div className="w-[98%] space-y-2">
              <div className="flex justify-between">
                <h1 className="">Image (optional)</h1>

                {notificationImage && (
                  <button
                    onClick={() => setNotificationImage(null)}
                    className="text-red-600 font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div
                className="w-full h-[250px] pl- flex flex-col justify-center items-center 
                        border border-gray-400 bg-gray-100 outline-none rounded-lg relative overflow-hidden"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {notificationImage ? (
                  <>
                    <img
                      src={notificationImage}
                      className=" w-full h-full object-cover  object-center "
                      alt=""
                    />
                  </>
                ) : (
                  <label
                    htmlFor="fileUpload"
                    className="flex flex-col items-center justify-center p-4 cursor-pointer"
                  >
                    <CloudUpload
                      strokeWidth={2}
                      className="w-10 h-10 mb-2 text-[#A61866]"
                    />
                    <p className="text-sm font-bold text-gray-600 mb-2">
                      <span className="text-[#A61866]">Click to upload</span> or{" "}
                      <span className="text-gray-600">Drag and drop</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported: JPEG, PNG, WebP (5MB max)
                    </p>
                    <input
                      id="fileUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Left Side */}
          <div className="flex-1 h-[800px] w-full flex flex-col bg-white gap-8 px-8 py-6 rounded-xl shadow-sm">
            {/* Recipients Section */}
            <div className="space-y-3">
              <h1 className="font-semibold text-2xl">Recipients</h1>
              <p className="text-gray-500">
                Select who will receive the notification
              </p>
            </div>

            {/* Providers List */}
            <div className="space-y-4 font-semibold">
              <h1>Select</h1>
              {providers.map((provider, index) => (
                <label
                  key={index}
                  className="relative flex items-center space-x-3 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(provider)}
                    onChange={() => handleProviderChange(provider)}
                    className="peer w-5 h-5 appearance-none rounded-md border-2 border-gray-400 checked:bg-[#A61866] checked:border-none transition-all"
                  />

                  <Check
                    strokeWidth={3}
                    className={`absolute left-1 w-3 h-3 text-white transition-all duration-200 pointer-events-none ${
                      selectedProviders.includes(provider)
                        ? "opacity-100 top-[6px]"
                        : "opacity-0 top-[-6px]"
                    }`}
                  />
                  <p>{provider}</p>
                </label>
              ))}
            </div>
            <div className="w-full flex flex-col justify-center items-center ">
              {/* Action Buttons */}
              <div className="flex  flex-col justify-center items-center gap-4 w-full mt-6">
                <ActionButton
                  icon={<CalendarClock strokeWidth={2} className="w-6 h-6" />}
                  label="Schedule"
                />
                <ActionButton
                  icon={<Save strokeWidth={2} className="w-6 h-6" />}
                  label="Save Draft"
                />
              </div>

              {/* Send Button */}
              <div className=" mt- mt-12">
                <button
                  className="flex items-center justify-center w-72 h-12 px-4 py-3 font-bold text-white 
                                bg-[#A61866] rounded-full cursor-pointer hover:scale-95 
                                transition-all duration-300 ease-in-out space-x-2"
                >
                  <span>Send</span>
                  <Send strokeWidth={2} className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNotification;
