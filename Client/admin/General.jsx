import { Save,Check,ChevronDown} from 'lucide-react';
import { useState } from 'react';
const General = () => {
   const [checkedItems, setCheckedItems] =useState(false)
   const handleChecking=()=>{
    setCheckedItems(prev=>!prev)
   }
  return (
    <div className='space-y-8'>
       <div className='flex justify-between'>
          <div className='space-y-2'> 
            <h1 className='text-xl font-semibold'>General Settings</h1>
            <p className='text-gray-500 text-sm'>Customize basic behavior and display settings.</p>
          </div>

       <button className="w-48 h-12 mr-12 px-2  py-3 flex justify-center  items-center text-white hover:scale-98  bg-[#A61866] rounded-full cursor-pointer transition-all ease-in duration-300 space-x-3">
        <span className="flex-shrink-0 transform transition-transform duration-200 group-hover:scale-110">
          <Save  className=' w-5 h-5 '/>
        </span>

        <h1 className="text-md ">Save changes</h1>
        </button>
       </div>

        <div className='space-y-4'>
           {/*Language */}
         <div className='relative space-y-2'> 
            <h1 className=''>Language</h1>
             <select className='appearance-none w-[70%] h-10 px-4 bg-gray-200 rounded-lg outline-none' name="" id="">
              <option value="En">English</option>
             </select>
               <ChevronDown className=' absolute right-75 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer pointer-events-none'/>
              <p className='text-gray-500 text-sm'>Change the language you would like to use.</p>
          </div>

           {/*Time */}
         <div className='relative space-y-2'> 
            <h1 className=''>Time Zone</h1>
            <div className='space-x-8'>
              <label className="relative cursor-pointer" htmlFor="check-box-1">
               <input
               id="check-box-1"
               type="checkbox"
               className={`w-4 h-4 absolute top-0.5 appearance-none rounded-md border-2 border-black transform transition-transform duration-200
                ${checkedItems && 'bg-[#A61866] border-none'}
                `}
              checked={checkedItems}
              onChange={handleChecking}
                 />
                  <Check
                 strokeWidth={3}
                            className={`absolute bottom-1.5 left-1 w-2 h-2 text-black transition-opacity ${
                              checkedItems ? 'opacity-100 text-white' : 'opacity-0'
}`}
                            />
               </label>

            <span className='text-gray-500 text-sm bottom-2'>Set timezone automatically</span>
            </div>
             <select className='appearance-none  w-[70%] h-10 px-4 bg-gray-200 rounded-lg outline-none' name="" id="">
              <option value="En">(GMT+3),Addis Ababa,Ethiopia</option>
             </select>
              <ChevronDown className=' absolute right-75 bottom-6 -translate-y-1/2 w-4 h-4 cursor-pointer pointer-events-none '/>
              <p className='text-gray-500 text-sm'>use your timezone to see summary data.</p>
          </div>
        </div>
      

    </div>
  )
}

export default General