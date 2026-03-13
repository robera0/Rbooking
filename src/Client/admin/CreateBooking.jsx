import { useNavigate } from 'react-router-dom';
import {useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import {CalendarDays,Clock,Check} from 'lucide-react'
import { TimeSlots } from './Cards';

const CreateBooking = () => {
    const navigate = useNavigate()
    const[fullname,setFullNaem]=useState('Jhon Smith')
    const [phone,setPhone]=useState('0987654321')
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

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat","Sun"];
const time = ["8:00", "10:00", "12:00", "2:00", "4:00", "6:00", "8:00"];
const providers = ['Dagi Beauty & Salon', 'Elgant', 'Heaven Beauty and Salon', 'Grace'];
const services = ['All Package', 'Hair', 'Nail', 'Massage', 'Makeup', 'Waxing', 'Face', 'Bridal'];
const [selectedProviders, setSelectedProviders] = useState([]);

  const handleProviderChange = (provider) => {
    if (selectedProviders.includes(provider)) {
      setSelectedProviders(selectedProviders.filter((p) => p !== provider));
    } else {
      setSelectedProviders([...selectedProviders, provider]);

    }
  };

  const handleServiceChange = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };
const [selectedServices, setSelectedServices] = useState([]);


  const handleChange = (e) => {
    setIsChecked(e.target.checked); 
  };
  return (
   <div>
       <div className='w-[98%] space-y-7'>
          <div className='flex justify-between'>
            <h1 className="text-3xl font-semibold">Create Booking </h1> 
              <button onClick={()=>navigate('/booking/bookingdetail')} className="w-42 h-12 px-2 py-3 text-[#A61866] font-semibold bg-white  outline-1 outline-offset-0 border border-[#A61866] rounded-md cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 space-x-4">
                Back to List
           </button>
        </div>
         <div className='flex px-6 justify-between'>
          <h1 className="text-2xl font-bold"> Custome Detail </h1> 
           <div className='className="w-82 h-12  gap- text-lg flex justify-center items-center  text-gray-500 font-bold bg-white  transition-all ease-in duration-300 space-x-4'> 
              <div className='flex space-x-2'>
                 <CalendarDays className='w-6 h-6 text-gray-700 '/>
             <    h1> Booking Date: 30 July 2025</h1>
              </div>
             <button className="w-[160px] h-10 px-6 font-semibold  bg-[#F5F6FA] rounded-full border border-gray-200 cursor-pointer">
                   Change
                    </button>
           </div>
        </div>
         {/*booking time */}
           <div className='flex px-8 gap-6'>
             <div className=' px-8  space-y-4'>
                <h1 className="text-xl text-gray-500 font-semibold">Full Name </h1> 
               <input  value={fullname} className="w-[400px] h-11 px-6 flex items-center justify-between bg-[#F5F6FA] rounded-full border border-gray-200 outline-none"/>                
          </div>

           <div className=' px-8  space-y-4'>
              <h1 className="text-xl text-gray-500 font-semibold">Phone Number </h1> 
               <input value={phone} className="w-[400px] h-11 px-6 flex items-center justify-between bg-[#F5F6FA] rounded-full border border-gray-200 outline-none"/>                 
            </div> 
        </div>

     <div className="mt-5 w-full mt-12 flex px-8 flex-wrap gap-14">
        {/*Right Side */}
         <div className='w-[400px] h-[740px] flex flex-col gap-8 px-8 py-4 rounded-lg shadow-md'>
           <div className='space-y-4'>
              <h1 className='w-full text-2xl font-bold'>Provide & Service </h1>
          <p className='text-gray-500'>Select who will Provide and services found in the salon.</p>
           </div>
           {/*Provider */}
             {/* Providers */}
            <div className="space-y-4 font-semibold">
              <h1>Select Provider</h1>
              {providers.map((provider, index) => (
                      <div key={index} className=" flex items-center space-x-3">
            <label className="relative flex items-center space-x-3 cursor-pointer select-none">
              <input
                id="check-box-1"
                type="checkbox"
                checked={selectedProviders.includes(provider)}
                onChange={() => handleProviderChange(provider)}
                className="peer w-5 h-5 appearance-none rounded-md border-2 border-gray-400 checked:bg-[#A61866] checked:border-none transition-all"
              />

              <Check
                onClick={() => handleProviderChange(provider)}
                strokeWidth={3}
                className={`absolute left-1 w-3 h-3 text-white transition-all duration-200 pointer-events-none
                  ${selectedProviders.includes(provider) ? 'opacity-100 top-[6px]' : 'opacity-0 top-[-6px]'}
                `}
              />
              <p className="">{provider}</p>
            </label>
            </div>
              ))}
            </div>

           {/*Select Service */}

          <div className=' w-full   space-y-4 font-semibold'>
              <h1 className=''>Select Service</h1>
              <div className="flex flex-wrap gap-4 w-full">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center w-[calc(50%-8px)]"> 
                      <label className="relative flex items-center space-x-3 cursor-pointer select-none">
                        <input
                          id={`check-box-${index}`}
                          type="checkbox"
                          checked={selectedServices.includes(service)}
                          onChange={() => handleServiceChange(service)}
                          className="peer w-5 h-5 appearance-none rounded-md border-2 border-gray-400 checked:bg-[#A61866] checked:border-none transition-all"
                        />

                        <Check
                          strokeWidth={3}
                          className={`absolute left-1 w-3 h-3 text-white transition-all duration-200 pointer-events-none
                            ${selectedServices.includes(service) ? 'opacity-100 top-[6px]' : 'opacity-0 top-[-6px]'}
                          `}
                        />
                        <p className="">{service}</p>
                      </label>
                    </div>
                  ))}
                </div>
           </div>
  
             {/*Time */}
              <div className=' w-full   space-y-4 font-semibold'>
                <h1 className=''>Time Estimated</h1>
                 <div className='flex  space-x-4'>
                   <Clock/>
                  <p className='mr-8 '>30 min</p>
             </div>
         </div>
       
         
         </div>


          {/*Left Side */}
    <div className='flex-1 h-[740px] space-y-4  px-8 py-4 rounded-lg shadow-md'>
       <h1 className='w-full text-2xl font-bold'>Available Time Slot </h1>
         <p className='text-gray-500'>Choose the avilable time slots from the booking heat-map</p>
          <div className="flex flex-col justify-around items-center space-y-8 mt-10">        
            <div className='flex gap-6'>
               <div className="  pt-14 space-y-1">
                  {time.map((t,index)=>(
                     <div key={index} className='flex flex-col  items-center pt-4 w-[50px] h-[60px]'>   
                     {t}             
                 </div>
                  ))}
               </div>
              <div className='space-y-6'>
                <div  className="flex flex-wrap w-118 gap-1">
                  {weekDays.map((week,index)=>(
                    <div key={index} className='w-[60px] flex justify-center'>
                    <h1 className=''>{week} </h1>
                    </div>
                  ))}
              </div>
              <TimeSlots />
              </div>
            
            </div>

            <div className='flex w-2/3 pl-20'>
              {/*available slots */}
               <div  className="w-full flex space-x-2 justify-center items-center">
                <div className="w-2 h-2 flex  rounded-full bg-[#A61866]"></div>
               <p className='  text-[#5F6367]'>Available Slot</p>
               </div>
               {/*limited slots */}
                 <div  className="w-full flex space-x-2 justify-center items-center">
                <div className="w-2 h-2 flex  rounded-full bg-[#E4BAD1]"></div>
               <p className='text-[#5F6367]'>limited Slot</p>
               </div>

                 {/*unavilable slots */}
                 <div  className="w-full flex space-x-2 justify-center items-center">
                <div className="w-2 h-2 flex  rounded-full bg-[#B3B3B3]"></div>
               <p className=' text-[#5F6367]'>unavilable Slot</p>
               </div>
            </div>
          </div>

         </div>
        </div>
        
        {/*footer section */}
        <div className=' mt-19 mb-10 '>
          <h1 className='font-bold  text-xl'>Booking Summary</h1>
           <div className='w-full flex  flex-col  space-y-2 pt-8 text-lg'>          
              <div className='flex justify-between space-x-4'>
                <h1 className=''>Service(s):</h1>
                <p className='mr-8'>Hair</p>
             </div>

              
              <div className='flex justify-between space-x-4'>
                <h1 className='  '>Provider:</h1>
                <p className='mr-8 '>Dagi beauty Art</p>
             </div>


              <div className='flex justify-between space-x-4'>
                <h1 className='  '>Customer:</h1>
                <p className=' mr-8'>Jhon Smith</p>
             </div>

              <div className='flex justify-between space-x-4'>
                <h1 className=''>Date & Time:</h1>
                <p className='mr-8'>2:00, 30 July 2025</p>
             </div>


              <div className='flex justify-between space-x-4'>
                <h1 className='font-bold '>Total Cost:</h1>
                <p className='font-bold mr-8'>1500 ETB</p>
             </div>

            </div>

        <div className=' flex mt-4 mr-6 justify-end  '>        
          <button  className="w-72 h-12 text-md px-2 py-2 text-white font-semibold bg-[#A61866]  outline-1 outline-offset-0 border border-[#A61866] rounded-full cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 ">
              Confirm Booking
            </button>  

                  </div> 
          </div>
     </div>
     </div>
  )
}

export default CreateBooking