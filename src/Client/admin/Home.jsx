import { motion, AnimatePresence } from "framer-motion";
import SideIcons from "./SideIconMenue";
import { faClock, faUser, faBell } from "@fortawesome/free-regular-svg-icons";
import { faPenNib } from "@fortawesome/free-solid-svg-icons";
import { useService } from "../../Context/ServiceContext";
import Services from "./Services";
import Hour from "./Hour";
import Profile from './Profile';
import Notification from './Notification';
import Main from "./Main";

const Home = () => {
  const {
    service, setService,
    hour, setHour,
    notification, setNotification,
    profile, setProfile
  } = useService();

  const handleService = () => {
    setService(true);
    setHour(false);
    setProfile(false);
    setNotification(false);
  };
  
  const handleHour = () => {
    setHour(true);
    setProfile(false);
    setService(false);
    setNotification(false);
  };
  
  const handleProfile = () => {
    setProfile(true);
    setService(false);
    setNotification(false);
    setHour(false);
  };
  
  const handleNotificatio = () => {
    setNotification(true);
    setHour(false);
    setService(false);
    setProfile(false);
  };

  // Animation variants
  const variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="flex w-full h-screen">
      {/* Left Section */}
      <div className="flex h-full w-[30%]">
        {/* Sidebar */}
        <div className="flex pt-20 border-r w-[20%] bg-[#202020] flex-col space-y-5">
          <SideIcons action={handleService} icons={faPenNib} name="Service" />
          <SideIcons action={handleHour} icons={faClock} name="Hours" />
          <SideIcons action={handleProfile} icons={faUser} name="Profile" />
          <SideIcons action={handleNotificatio} icons={faBell} name="Notification" />
        </div>

        {/* Main content (inside left section) */}
        <div className="w-[70%] h-full bg-[#202020] relative overflow-hidden">
          <AnimatePresence exitBeforeEnter>
            {service && (
              <motion.div
                key="services"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="absolute w-full h-full"
              >
                <Services />
              </motion.div>
            )}
            {hour && (
              <motion.div
                key="hour"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="absolute w-full h-full"
              >
                <Hour />
              </motion.div>
            )}
            {profile && (
              <motion.div
                key="profile"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="absolute w-full h-full"
              >
                <Profile />
              </motion.div>
            )}
            {notification && (
              <motion.div
                key="notification"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="absolute w-full h-full"
              >
                <Notification />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 h-full">
        <Main />
      </div>
    </div>
  );
};

export default Home;
