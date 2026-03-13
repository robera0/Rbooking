import { ChevronDown ,ToggleRight,ToggleLeft,Plus} from 'lucide-react';
import { useState } from 'react';
import { BusinessCards } from './Cards';
import { AnimatePresence, motion } from "framer-motion";

const Verification = () => {
    const [toggleOn,setToogleOn]=useState(true)
  
     const handleToogle=()=>{
      setToogleOn(prev =>!prev)
     }
  return (
    <div className=' w-full flex gap-12 px-6'>
      <div className='w-[40%] space-y-8'>
        <div className='w-full border-b-2 border-b-gray-300'>
          <h1 className='text-2xl font-semibold mb-6'>Verification Status</h1>
      </div>
          <div className='flex items-center space-x-10'>
          <h1 className="font-semibold"> Current Status : </h1> 
          <div className='w-42 h-8 flex flex-wrap justify-center items-center bg-[#FEE0C0] space-x-4 rounded-md'>
                <h1 className='text-[#FC9933] font-semibold text-sm'>Pending Review</h1>
                <button className=' cursor-pointer'>
                   <ChevronDown strokeWidth={3} className='w-5 h-5 text-[#FC9933]'/>
                </button>
               
          </div>
        </div>

         <div className='flex justify-between'>
           <div className='space-y-2'>
             <h1 className="font-semibold"> Varification Status  </h1>
             <p className='text-sm text-gray-400'>Change the varification status</p> 
           </div>

          <button   onClick={handleToogle} className='w-42 h-8 flex flex-wrap justify-center items-center ] space-x-4 rounded-md'>
             <AnimatePresence mode="wait" initial={false}>
                    {toggleOn ? (
                      <motion.div
                        key="on"
                        initial={{ opacity: 0, scale: 0.9   }}
                        animate={{ opacity: 1, scale: 1  }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ToggleRight className="w-10 h-10 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="off"
                        initial={{ opacity: 0, scale: 0.9  }}
                        animate={{ opacity: 1, scale: 1  }}
                        exit={{ opacity: 0, scale: 0.9  }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ToggleLeft className="w-10 h-10 text-gray-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
          </button>
        </div>

        {/*Note */}
           <div className='space-y-2'>
             <h1 className="font-semibold">Admin Note </h1>
             <input 
             className='w-[80%] h-[120px] pb-20 pl-4 border-2 border-gray-400 bg-gray-100 outline-none  rounded-xl'
             type="text"
             placeholder='Enter a note for varification status' />
            <p className='text-md font-semibold text-gray-400'> maximum 120 characters</p> 
           </div>
      </div>

        <div className='w-[55%] space-y-8'>
          <div className='flex justify-between  border-b-2 border-b-gray-300'>
          <h1 className="text-2xl font-semibold"> Upload Documents </h1> 
             <button className="w-62 h-12 px-2  py-3 flex cursor-pointer hover:scale-95  transition-all duration-300 mb-2 space-x-2">
              <span className="flex-shrink-0 flex items-center transform transition-transform duration-200 group-hover:scale-110">
                 <Plus className=' w-4 h-4 text-[#A61866]'/>
        </span>
           <h1 className="text-md text-[#A61866] font-semibold ">Upload New Documents</h1>
        </button>
        </div>
         {/*cards */}
           <div className='w-full gap-6 space-x-4 px-18 flex flex-wrap'>
            {Array(4).fill(null).map((_,idx)=>(
              <>
                   <BusinessCards/>
              </>
            ))}
          
           </div>
       </div>
    </div>
  )
}

export default Verification