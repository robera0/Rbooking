import { ServiceTable } from './Cards'
import {Plus} from 'lucide-react'
const Service = () => {
  return (
    <div className='-mt-4'>
       <div className='w-full space-y-4'>
          <div className='flex justify-end mr-4'>
         <button className="w-46 h-12 px-2  py-3 flex text-white  bg-[#A61866] rounded-md cursor-pointer hover:scale-95  transition-all duration-300 space-x-2">
        <span className="flex-shrink-0 flex items-center transform transition-transform duration-200 group-hover:scale-110">
          <Plus className=' w-4 h-4'/>
        </span>

        <h1 className="text-md ">Add New Service</h1>
        </button>
      </div>
        <div className="overflow-hidden rounded-t-2xl ">
             <ServiceTable/>
              </div>
          </div>
    </div>
  )
}

export default Service