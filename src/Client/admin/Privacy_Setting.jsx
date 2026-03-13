import { Save,ToggleRight,ToggleLeft,ChevronDown} from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import { useState } from 'react';
import { icon } from '@fortawesome/fontawesome-svg-core';

const PrivacyToggles=({header,paragraph,idx})=>{

  const [alltoggled,setAllToggled]=useState([])
  const handleToogle=(idx)=>{
      if(alltoggled.includes(idx)){
    setAllToggled(alltoggled.filter((i) => i !== idx));
  }

  else {
    setAllToggled([...alltoggled,idx])
  }
  }

  return(
        <div className='flex justify-between'>
          <div className='space-y-2'> 
            <h1 className=' font-semibold'>{header}</h1>
            <p className='text-gray-500 text-sm'>{paragraph}</p>
          </div>

       <button onClick={()=>handleToogle(idx)} className="w-48 h-12 mr-12 px-2  py-3 flex justify-center  items-center text-white space-x-3">
         <AnimatePresence mode="wait" initial={false}>
                    {alltoggled.includes(idx) ? (
                      <motion.div
                        key="on"
                        initial={{ opacity: 0, scale: 0.9   }}
                        animate={{ opacity: 1, scale: 1  }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ToggleRight className="w-8 h-8 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="off"
                        initial={{ opacity: 0, scale: 0.9  }}
                        animate={{ opacity: 1, scale: 1  }}
                        exit={{ opacity: 0, scale: 0.9  }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ToggleLeft className="w-8 h-8 text-gray-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
        </button>
       </div>
  )
}
const Privacy_Setting = () => {
   const [activeToggles, setActiveToggles] = useState([]);
    const[activeRefund,setActiveRefund]=useState(false)
   const handleToogle=(idx)=>{
    if(activeToggles.includes(idx)){
       setActiveToggles(activeToggles.filter((i) => i !== idx));
    }
    else {

      setActiveToggles([...activeToggles,idx])

    }
   }

  
const ToggledParts=[
  {header:"Require phone for create order",paragraph:"choose whethe require phone for creating an order for the customers" },
   {header:"Enable Auto refresh orders" ,paragraph:"you can enable or disable auto referesh orders"},
   {header:"Enable Auto refresh orders" ,paragraph:"you can enable or disable auto referesh orders"},
   {header:"Enable Auto refresh orders" ,paragraph:"you can enable or disable auto referesh orders"}
  
]

  return (
    <div>
    <div className='space-y-8'>
       <div className='flex justify-between'>
          <div className='space-y-2'> 
            <h1 className='text-xl font-semibold'>Privacy & Permissions</h1>
            <p className='text-gray-500 text-sm'>Customize basic behavior and display settings.</p>
          </div>

       <button className="w-48 h-12 mr-12 px-2  py-3 flex justify-center  items-center text-white hover:scale-98  bg-[#A61866] rounded-full cursor-pointer transition-all ease-in duration-300 space-x-3">
        <span className="flex-shrink-0 transform transition-transform duration-200 group-hover:scale-110">
          <Save  className=' w-5 h-5 '/>
        </span>

        <h1 className="text-md ">Save changes</h1>
        </button>
       </div>

         <div className='flex justify-between'>
          <div className='space-y-2'> 
            <h1 className=' font-semibold'>System Refund</h1>
            <p className='text-gray-500 text-sm'>Customize basic behavior and display settings.</p>
          </div>

       <button onClick={()=>setActiveRefund(prev=>!prev)} className="w-48 h-12 mr-12 px-2  py-3 flex justify-center  items-center text-white space-x-3">
         <AnimatePresence mode="wait" initial={false}>
                    {activeRefund ? (
                      <motion.div
                        key="on"
                        initial={{ opacity: 0, scale: 0.9   }}
                        animate={{ opacity: 1, scale: 1  }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ToggleRight className="w-8 h-8 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="off"
                        initial={{ opacity: 0, scale: 0.9  }}
                        animate={{ opacity: 1, scale: 1  }}
                        exit={{ opacity: 0, scale: 0.9  }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ToggleLeft className="w-8 h-8 text-gray-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
        </button>
       </div>

       {/*admin members */}
           <div className='flex justify-between'>
          <div className='space-y-2'> 
            <h1 className=' font-semibold'>Admin Members</h1>
            <p className='text-gray-500 text-sm'>The administrator can change the members persmission</p>
          </div>

       <button className="w-48 h-12 mr-12 px-2  py-3 flex  justify-center  items-center text-[#A61866] font-semibold  border-2 border-[#A61866]  hover:text-white hover:bg-[#A61866]  rounded-full cursor-pointer transition-all ease-in duration-300 space-x-3">
        <span className="flex-shrink-0 transform transition-transform duration-200 group-hover:scale-110">
          <Save  className=' w-5 h-5 '/>
        </span>

        <h1 className="text-md ">Add Members</h1>
        </button>
       </div>
       
       {/*Table */}
      
       <div className='w-[90%]  rounded-full'>
            <table
              border="1"
              className="w-full table-fixed text-md border-separate border-spacing-0 rounded-t-2xl text-left overflow-hidden"
            >  
          <thead className="bg-[#E3D0DA]">
            <tr>
              <th className="px-6 py-4 w-[300px] text-center">NAME</th>
              <th className="px-6 py-4 w-[200px] text-center">DATE</th>
              <th className="px-6 py-4 w-[140px] text-center">ACTIVATION</th>
              <th className="px-6 py-4 w-[150px] text-center">ACCESS</th>
            
            </tr>
          </thead>
            <tbody className="text-gray-800 font-medium">
          {Array(4).fill(null).map((_, idx) => (
            <tr key={idx} className="bg-white">
              <td className="px-6 py-4 border-b-2 border-gray-300">
                <div className="flex items-center gap-8">
                  <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-full">
                    <img
                      className="w-full h-full object-cover"
                      src="/commentProgile.jpg"
                      alt="User profile"
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <h1 className="text-md font-bold">John Smith</h1>
                    <p className="text-sm text-gray-500">jhonsmith@gmail.com</p>
                  </div>
                </div>
              </td>
            <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-2 text-center"> Aug 1 2025  </td>
              <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-2 text-center">
                  <div className="flex justify-center items-center">
                    <button 
                      onClick={() => handleToogle(idx)}  
                      className="flex flex-wrap justify-center items-center"
                    >
                    <AnimatePresence mode="wait" initial={false}>
                      {activeToggles.includes(idx) ? (
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
              </td>
            <td className="px-6 py-4 border-y  text-center border-gray-300 border-0 border-b-2 ">
             
              <button className="  flex gap-2 items-center justify-center  text-black bg-[#F5F6FA] text-sm w-26 h-10  font-semibold rounded-xl border border-[#C8C8CA]">
                 <span>Editor</span>
              <ChevronDown className='w-4 h-4'/>
              </button>
              
            </td>
          </tr>
        ))}
      </tbody>
    </table>
       </div>

       {/*toggled parts */}
       <div className='mb-8 space-y-4 '>
         {ToggledParts.map((h,indx)=>(
          <div key={indx} className=' pl-3'>
           <PrivacyToggles
           header={h.header}
           paragraph={h.paragraph}
           indx={indx}
          />
          </div>
        ))}
       </div>

      
      

    </div>
    </div>
  )
}

export default Privacy_Setting


