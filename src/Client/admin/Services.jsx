import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useService } from "../../Context/ServiceContext";
import AddService from "./AddService";
import EditService from "./EditService";
import { EllipisMenue } from "./AddServiceMenue";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
const Services = () => {
  const {
    ellipis,
    setEllipis,
    addservice,
    header,
    setHeader,
    setAddservice,
    edit,
    selectedEvent, setSelectedEvent
  } = useService();

  const buttonRefs = useRef([]);

  // Fetch events
  const fetchEvents = async () => {
    const res = await fetch("http://localhost:5000/api/events");
    return res.json();
  };

  const { data: events, isLoading, error } = useQuery({
    queryFn: fetchEvents,
    queryKey: ["event"],
  });

  const handleAddservice = () => setAddservice(true);
  

  const handleEllipis = async(index) => { 
    setEllipis(ellipis === index ? null : index);
    const event = events?.find((e) => e._id === index);
    setSelectedEvent(event);
 }



  // Motion variants for sliding
  const panelVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: "-100%" },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      <AnimatePresence exitBeforeEnter>
        {/* Add Service Panel */}
        {addservice ? (
          <motion.div
            key="addService"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute w-full h-full top-0 left-0"
          >
            <AddService />
          </motion.div>
        ) : edit ? (
          // Edit Service Panel
          <motion.div
            key="editService"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute bottom-40 w-full h-full flex justify-center items-center"
          >
            <EditService />
          </motion.div>
        ) : (
          // Service List Panel
          <motion.div
            key="serviceList"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute w-full h-full top-0 left-0 bg-[#202020] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-6"
          >
            <h1 className="text-xl text-white font-semibold text-center mb-6">
              Services
            </h1>

            {/* Add Service Button */}
            <div className="w-full max-w-[18rem] h-12 bg-[#343434] rounded-lg mb-6 mx-auto">
              <button
                onClick={handleAddservice}
                className="flex space-x-2 justify-center items-center w-full h-full hover:bg-gray-700 duration-300 rounded-md"
              >
                <FontAwesomeIcon
                  className="text-lg text-[#168FF4]"
                  icon={faPlus}
                />
                <h3 className="text-[#168FF4] text-md">Add Service</h3>
              </button>
            </div>

            {/* Event List */}
            <div className="relative w-full max-w-[18rem] bg-[#343434] rounded-lg p-2 mx-auto mb-6">
              {isLoading ? (
                <p className="text-gray-400 text-center py-4">Loading...</p>
              ) : error ? (
                <p className="text-red-400 text-center py-4">
                  Failed to load events
                </p>
              ) : (
                <AnimatePresence>
                  {events?.map((e, index) => (
                    <motion.div
                      key={e._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="relative flex items-center justify-between px-3 border-b border-gray-600 h-16 hover:bg-[#2A2A2A] transition-all rounded-md"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Image */}
                        <div className="w-12 h-12 bg-gray-500 flex justify-center items-center rounded">
                          <img
                            className="w-full h-full object-cover rounded"
                            src={e.picture || "/defaultAvater.jpg"}
                            alt={e.name}
                          />
                        </div>

                        {/* Event Info */}
                        <div>
                          <h4 className="text-white text-sm">{e.name}</h4>
                          <p className="text-gray-400 text-sm">${e.price}</p>
                        </div>
                      </div>

                      {/* Ellipsis Button */}
                      <button
                        ref={(el) => (buttonRefs.current[e._id] = el)}
                        onClick={() => handleEllipis(e._id)}
                        className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-500 duration-300 ${
                          ellipis === e._id && "bg-gray-500"
                        }`}
                      >
                        <FontAwesomeIcon
                          className="text-lg text-[#168FF4]"
                          icon={faEllipsis}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {ellipis === e._id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-10 top-12 z-20"
                        >
                          <div className="  py-2 px-3 w-32">
                            <EllipisMenue
                            eventId={e._id }
                            />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Header Input */}
            <div className="w-full max-w-[18rem] h-16 bg-[#343434] rounded-lg px-4 py-2 mx-auto">
              <h3 className="text-gray-300 text-sm mb-1">Header title</h3>
              <input
                value={header}
                onChange={(e) => setHeader(e.target.value)}
                className="w-full bg-transparent text-white outline-none border-none text-sm"
                type="text"
                placeholder="Enter a title..."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
