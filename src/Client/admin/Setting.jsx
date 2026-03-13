import { SlidersVertical,UsersRound ,CalendarCheck,BellRing} from 'lucide-react';
import { useState } from 'react';
import General from './General';
import User_Setting from './User_Setting'
import Salon_Setting from './Salon_Setting';
import Book_Setting from './Book_Setting'
import Notification_Setting from './Notification_Setting';
import Privacy_Setting from './Privacy_Setting'
import Configuration_Setting from './Configuration_Setting'
import { AnimatePresence, motion } from "framer-motion";

const SettingMenu = ({ name, icon,index,activeIndex,setActiveIndex }) => {
const isActive = activeIndex== name
  return (
    <div className="flex  justify-center ">
      <button
        onClick={() =>setActiveIndex(prev => (prev === index ? null : name))}
        className={` group flex w-74 h-14 text-xl px-6 py-3 space-x-4 items-center
          transition-colors duration-200 rounded-xl cursor-pointer mb-4
          ${
            isActive  
              ? "bg-[#A61866] text-white "
              : "bg-inherit text-black hover:bg-[#A61866] hover:text-white"
          }
        `
        }
      >
        <div className="flex-shrink-0 transform transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>

        <h1 className="text-md">{name}</h1>
      </button>
    </div>
  );
};


const Setting = () => {
     const[activeIndex,setActiveIndex]=useState('General Setting')
        
    
 const pageVariants = {
      initial: { opacity: 0, x: 20, scale: 0.98 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -20, scale: 0.98 },
    };

    const pageTransition = {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1], 
    };
    const PageWrapper=({children}) =>(
    
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

 const menus = [
    { name: "General Setting", icon: <SlidersVertical />, component: <General /> },
    { name: "User Setting", icon: <UsersRound />, component: <User_Setting /> },
    { name: "Salon Setting", icon: <SlidersVertical />, component: <Salon_Setting /> },
    { name: "Book Setting", icon: <CalendarCheck />, component: <Book_Setting /> },
    { name: "Notification Setting", icon: <BellRing />, component: <Notification_Setting /> },
    { name: "Privacy & Permission", icon: <SlidersVertical />, component: <Privacy_Setting /> },
    { name: "Configuration", icon: <SlidersVertical />, component: <Configuration_Setting /> },
  ];

  return (
  <div className='' >
       <div className='w-full  space-y-12'>
          <div>
          <h1 className="text-4xl font-semibold">Settings </h1> 
         </div>

         <div className='flex gap-24 pl-4'>
           <div className="w-[25%] gap-  h-full ">
           {menus.map((menu, idx) => (
          <SettingMenu
            key={idx}
            name={menu.name}
            icon={menu.icon}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        ))}
        </div>

        <div className='flex-1 flex justify-center items-center'>
             {/*Main Contetn */}
       <AnimatePresence mode="wait">
          {menus.map(
            (menu, idx) =>
              activeIndex === menu.name && (
                <PageWrapper key={idx}>{menu.component}</PageWrapper>
              )
          )}
        </AnimatePresence>
        </div> 
         </div>
   
     </div> 
    </div>
  )
}

export default Setting