import {
  Scissors,
  Menu,
  Bell,
  CircleUser,
  House,
  Ticket,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Facebook,
  CircleX,
} from "lucide-react";
import { EditMenuBar, MenuBar } from "../../components/Reusable";
import { AccountSideMenu } from "../../components/Reusable";
import { motion, AnimatePresence } from "framer-motion";
import { useService } from "../../Context/ServiceContext";

const Main = ({ children }) => {
  const {
    isAccountActive,
    setIsAccountActive,
    isEditMenuActive,
    setEditMenuActive,
  } = useService();

  return (
    <div onClick={() => setIsAccountActive(false)} className="h-auto">
      <div className="relative flex h-screen overflow-hidden bg-[#222529] flex-col ">
        <div className="flex justify-between lg:hidden text-white mt-2  p-6">
          <div className="flex  space-x-2">
            <Scissors className="text-[#B3B3B3] mt-2 w-8 h-8" />
            <h1 className="font-irish text-xl w-12 text-white font bold">
              Kuretegn Event
            </h1>
          </div>

          <div className="flex justify-center items-center space-x-3">
            {/*menu */}
            <button>
              <span>
                <Menu />
              </span>
            </button>
            {/*notification */}
            <button className="relative flex justify-center items-center w-8 h-8 bg-[#3F454B] rounded-sm">
              {/*PING */}
              <div className="absolute top-0 left-6 w-2 h-2 rounded-full  animate-ping bg-red-400"></div>
              <span>
                <Bell className="w-4 h-4" />
              </span>
            </button>
            {/*profile */}
            <button className="relative flex justify-center items-center w-8 h-8 bg-[#3F454B] rounded-sm">
              <div className=" w-4 h-4 rounded-full absolute ping-red-400"></div>
              <span>
                <CircleUser className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>

        {/*EDIT MENU BAR */}
        <AnimatePresence>
          {isEditMenuActive && (
            <motion.div
              className="fixed inset-0 z-[200] w-full h-screen bg-black/40 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditMenuActive(false)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="w-full  bg-[#1F2227] pt-4 shadow-2xl space-y-8 "
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
              >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5">
                  <span className="text-white font-semibold text-lg">
                    Edit Search
                  </span>

                  <CircleX
                    onClick={() => setEditMenuActive(false)}
                    className="w-6 h-6 text-white/70 cursor-pointer hover:text-white"
                  />
                </div>

                {/* Card */}
                <div className=" w-full px-5 pb-6">
                  <div className="bg-[#2A2C31] w-full rounded-xl pt-6">
                    <EditMenuBar />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/*ACCOUNT MENU BAR */}

        <AnimatePresence>
          {isAccountActive && (
            <motion.div
              className="fixed inset-0 z-[200] bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAccountActive(false)}
            >
              <motion.div
                className="absolute top-0 right-0 w-[80%] h-full pt-2 pb-8 bg-[#222529] shadow-2xl space-y-4"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Close button */}
                <div className="flex justify-end p-4">
                  <CircleX
                    onClick={() => setIsAccountActive(false)}
                    className="w-8 h-8 text-white cursor-pointer"
                  />
                </div>

                <AccountSideMenu />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-y-auto flex-1 scroll-hidden pt-6 pb-18">
          <div>{children}</div>

          {/*Footer */}
          <div className="  w-full h-96 pt-8 pl-4 bg-[#0B0A12]">
            <div className=" space-y-8">
              <div className="space-y-2">
                <div className="flex flex-cols space-x-2">
                  <Scissors className="text-[#B3B3B3] mt-2 w-8 h-8" />
                  <h1 className="font-irish text-xl w-12 text-white font bold">
                    Kuretegn Event
                  </h1>
                </div>

                <p className=" pl-8 w-[95%] text-[#B3B3B3]">
                  Flawed plans, but full support everyone believed in him!
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-cols pl-4 mt-4 space-x-3">
                  <Phone className=" text-white  mt-2 w-5 h-5" />
                  <h1 className="text-lg w-12 text-[#B3B3B3] font bold">
                    +25181234567
                  </h1>
                </div>
                <div className="flex flex-cols items-center   pl-4 space-x-3">
                  <Mail className=" text-white  mt-2 w-5 h-5" />
                  <h1 className="text-lg w-12 text-[#B3B3B3] font bold">
                    kuretegnevents@gmail.con
                  </h1>
                </div>
              </div>

              {/*SOCIAL MEDIA */}
              <div className="flex flex-col mt-8  mr-12  items-end text-white  space-y-3">
                <h1 className="text-lg font-semibold ">Follow Us on</h1>
                <div className="flex items-center pl-4 space-x-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-6 h-6 cursor-pointer" />
                  </a>

                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="w-6 h-6 cursor-pointer" />
                  </a>

                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-6 h-6 cursor-pointer" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*menu Bar */}
        <AnimatePresence>
          {!isAccountActive && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="lg:hidden fixed bottom-0 left-0 flex w-full justify-around bg-[#191B1D] py-4 z-[100] rounded-t-3xl"
            >
              <MenuBar icon={<House />} header="Home" path="/" />
              <MenuBar
                icon={<Ticket />}
                header="My Ticket"
                path="/tickets_home"
              />
              <MenuBar icon={<CircleUser />} header="Account" path="/account" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Main;
