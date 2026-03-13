import { useNavigate } from 'react-router-dom';
import {useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import {CalendarCheck,ChevronDown} from 'lucide-react'
import {BookedServiceTable} from './Cards'
const BookingDetail = () => {
    const navigate = useNavigate()

    const pageVariants = {
      initial: { opacity: 0, x: 20, scale: 0.98 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -20, scale: 0.98 },
    };

    const pageTransition = {
      duration: 0.7,
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

  return (
   <div>
       <div className='w-[98%] space-y-7'>
          <div className='flex justify-between'>
            <h1 className="text-3xl font-semibold"> Booking Details </h1> 
              <button onClick={()=>navigate('/booking')} className="w-42 h-12 px-2 py-3 text-[#A61866] font-semibold bg-white  outline-1 outline-offset-0 border border-[#A61866] rounded-md cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 space-x-4">
                Back to List
           </button>
        </div>
         <div className='flex px-6 justify-between'>
          <h1 className="text-2xl font-bold"> Booking: BK 0001 </h1> 
           <div className='className="w-82 h-12 px-2 py-3 gap- text-lg flex justify-center items-center  text-gray-500 font-bold bg-white  transition-all ease-in duration-300 space-x-4'> 
             <CalendarCheck className='w-5 h-5 '/>
             <h2> Booking Date: 30 July 2025</h2>
           </div>
        </div>
         {/*booking time */}
           <div className='flex justify-between px-8 s'>
             <div className=' px-8  space-y-4'>
                <h1 className="text-xl text-gray-500 font-semibold"> Booking Status </h1> 
                <div className="relative w-[400px] h-11 px-6 flex items-center bg-[#F5F6FA] rounded-full border border-gray-200">
                 
                  <span className="absolute left-1/2 transform -translate-x-1/2 font-bold text-lg">
                    Approved
                  </span>
            
                  <button className="absolute right-12 cursor-pointer">
                    <ChevronDown strokeWidth={3} className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
          </div>

           <div className=' px-8  space-y-4'>
              <h1 className="text-xl text-gray-500 font-semibold"> Scheduled Time </h1> 
                <div className="w-[400px] h-11 px-6 flex items-center justify-center bg-[#F5F6FA] rounded-full border border-gray-200">
                  <span className="font-bold text-lg">10:30PM</span>
                </div>
            </div> 


                <div className=' flex justify-center items-end '>        
                   <button onClick={()=>navigate('/booking/createbooking')} className="w-36 h-12 text-lg px-2 py-2 text-[#A61866] font-semibold bg-white  outline-1 outline-offset-0 border border-[#A61866] rounded-full cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 ">
                           Edit Booking
                       </button>           
                  </div> 
        </div>

     <div className="mt-5 w-full mt-12 flex px-8 flex-wrap gap-14">
        {/*Right Side */}
         <div className='w-[600px] h-[350px] flex flex-col justify-between px-8 py-4 rounded-lg shadow-sm'>
           <div className='w-full flex pt-6 justify-between'>
           {/* info */}
                <div className="space-y-8 w-full">           
            {/* header */}    
                 <h1 className='font-bold  text-2xl'>Customer Detail</h1>
                    {/* Profile Image */}
                  <div className='flex flex-wrap  items-center justify-between'>
                     <div className=" w-22 h-22 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                    className="w-full h-full object-cover"
                    src="/commentProgile.jpg"
                    alt="Salon Logo"
                    />           
                </div>
                   <h1 className="text-4xl mr-4 text-[#36383A] font-semibold">Christian Brooks</h1>
                  </div>
                </div>
         </div>
       {/*info */}
         <div className='space-y-4 text-xl'>
             <div className='flex space-x-2'>
               <h1 className='font-semibold  text-[#36383A] '>Email:</h1>
               <p className='text-gray-600 mb-2'>christianbrooks@gmail.com</p>
             </div>
            
              <div className='flex space-x-2'>
                <h1 className='font-semibold  text-[#36383A] '>Phone no:</h1>
                <p className='text-gray-600 mb-2'>+251912345678</p>
             </div>

         </div>

         </div>

          {/*Left Side */}
    <div className='w-[600px] h-[350px] flex flex-col justify-between px-8 py-4 rounded-lg shadow-sm'>
         
           {/* info */}
              <div className='w-full flex pt-6 justify-between'>
                                <div className="space-y-8 w-full">           
            {/* header */}    
                 <h1 className='font-bold text-2xl'>Salon Detail</h1>
                    {/* Profile Image */}
                  <div className='flex flex-wrap  items-center justify-between'>
                     <div className=" w-22 h-22 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                    className="w-full h-full object-cover"
                    src="/commentProgile.jpg"
                    alt="Salon Logo"
                    />           
                </div>
                   <h1 className="text-4xl mr-4  text-[#36383A] font-semibold">Dagi Spa & Salon</h1>
                  </div>
                </div>
              </div>


                 {/*info */}
         <div className='space-y-4 text-xl'>
             <div className='flex space-x-2'>
             <h1 className='font-semibold  text-[#36383A] '>Email:</h1>
           <p className='text-gray-600 mb-2'>dagispa@gmail.com</p>

             </div>
            
              <div className='flex space-x-2'>
                <h1 className='font-semibold  text-[#36383A] '>Phone no:</h1>
                <p className='text-gray-600 mb-2'>+251912345678</p>
             </div>
            </div>
         </div>
        </div>
        
        {/*footer section */}
        <div className=' mt-6 mb-10 space-y-12 '>
           <div className=' space-y-8'>
                 <h1 className='font-bold  text-2xl'>Service Booked</h1>
             <div className='overflow-hidden rounded-t-2xl'>
               <BookedServiceTable/>
             </div>
           </div>
        
            {/*buttons and info */}

            <div className='flex'>
               <div className='w-[50%] space-y-2 pt-16 text-xl'>
                    
              <div className='flex space-x-4'>
                <h1 className='font-bold '>Payment Status:</h1>
                <p className=' font-light text-green-600 mb-2'>Completed</p>
             </div>

              
              <div className='flex space-x-4'>
                <h1 className='font-bold  '>Payment Option:</h1>
                <p className='font-light text-gray-600 mb-2'>telebirr</p>
             </div>


              <div className='flex space-x-4'>
                <h1 className='font-bold  text-[] '>Total Amount:</h1>
                <p className='font-light text-gray-600 mb-2'>1500 ETB</p>
             </div>

              <div className='flex space-x-4'>
                <h1 className='font-bold '>Transaction ID:</h1>
                <p className='font-light text-gray-600 mb-2'>TXN789012345</p>
             </div>

               </div>
               
               <div className=' w-[50%] flex  justify-between'>
                    <div className=' flex justify-center  '>        
                       <button className="w-42 h-12 text-md px-2 py-2 text-white font-semibold bg-[#EF3826]  outline-1 outline-offset-0 border border-[#A61866] rounded-full cursor-pointer transition-all ease-in duration-300 ">
                           Cancel Booking
                       </button>  
                  </div> 

                  <div className=' flex justify-center  '>        
                       <button  className="w-42 h-12 text-md px-2 py-2 text-[#A61866] font-semibold bg-white  outline-1 outline-offset-0 border border-[#A61866] rounded-full cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 ">
                           Invoice
                       </button>  

                  </div> 

                  <div className=' flex justify-center  '>        
                       <button  className="w-42 h-12 text-md px-2 py-2 text-white font-semibold bg-[#A61866]  outline-1 outline-offset-0 border border-[#A61866] rounded-full cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 ">
                           Save Changes
                       </button>  

                  </div> 
               </div>
            </div>
          </div>
     </div>
     </div>
  )
}

export default BookingDetail