import {Cards,SearchInput,SalonTable, BookingTable} from './Cards';
import { CalendarDays,CalendarCheck,
  CalendarClock,CalendarCheck2,CirclePlus,Funnel,CloudUpload,
  ChevronsRight,ChevronsLeft,
 } from 'lucide-react';
 import { useRef } from 'react';

const Booking = () => {
   const startRef = useRef(null);
    const endRef=useRef(null)

  return (
    <div>
         <div className='w-[98%] space-y-8'>
          <div>
          <h1 className="text-3xl font-semibold"> Booking Management </h1> 
        </div>
     <div className="mt-10 flex  flex-wrap gap-10">
        {/*users */}
         <Cards
         header='Total Booking'
         num= "150"       
         topicons={ <CalendarDays strokeWidth={2} className=' w-9 h-9  text-[#A61866]'/>}
         daily_diff="Booking on Platform"
         /> 
          
        {/*Verified Users */}
         <Cards
         header='Approved Booking '
         num="120"   
         topicons={ <CalendarCheck strokeWidth={1} className=' w-12 h-12 text-white fill-[#09244B]'/>}
         daily_diff="Approved for booking"
         />
         {/*Active Users */}
         <Cards
         header='Pending Booking '
         num= "25"    
         topicons={ <CalendarClock strokeWidth={2} className=' w-9 h-9  text-[#FC8A16]'/>}
         daily_diff="Awaiting for the time"
         />
          {/*Deleted Users */}
         <Cards
         header='Completed Booking '
         num= "5"
         topicons={ <CalendarCheck2 strokeWidth={3} className=' w-9 h-9 text-[#52B141]'/>}
         daily_diff="Booking Completed"
         />

     </div>
      <div className='flex justify-end mr-4'>
         <button className="w-46 h-12 px-2  py-3 flex justify-center  items-center text-white  bg-[#A61866] rounded-full cursor-pointer  hover:bg-white hover:text-[#A61866] transition-all ease-in duration-300 space-x-3">
        <span className="flex-shrink-0 transform transition-transform duration-200 group-hover:scale-110">
          <CirclePlus  className=' w-5 h-5 '/>
        </span>

        <h1 className="text-md ">New Booking</h1>
        </button>
      </div>
        {/*Table of customers */}
        <div className='w-full flex flex-wrap  gap-8'>
        <SearchInput
         w="w-140"
         h="h-14"
         top="top-4" 
         left="left-3"
        placeholder="Search user name, email..."
        />
        {/*filter */}
          <button className=' w-42 h-12 flex justify-center items-center  bg-[#F5F6FA] rounded-full gap-2 '>
              <Funnel className='text-gray-500'/>
              <select className='text-gray-500 w-24 rounded-xl  outline-none' name="" id="">
              <option  value="">Filter By</option> 
                </select>
           </button>
           
           {/*date */}
                <div className="w-92 h-12 px-3 flex items-center bg-[#F5F6FA] rounded-full gap-3">
           {/* Start date */}
                <div className="w-40 h-8 px-2 bg-white rounded-lg flex items-center gap-2">
                    <button
                    type="button"
                    onClick={() => startRef.current?.showPicker()}
                    className="text-gray-500 cursor-pointer"
                    >
                    <CalendarDays size={18} />
                    </button>
                    <input
                    ref={startRef}
                    type="date"
                    className="no-calendar outline-none w-24 bg-transparent"
                    />
                </div>

                <span className="text-gray-600">to</span>

                {/* End date */}
                <div className="w-40 h-8 px-2 bg-white rounded-lg flex items-center gap-2">
                    <button
                    type="button"
                    onClick={() => endRef.current?.showPicker()}
                    className="text-gray-500 cursor-pointer"
                    >
                    <CalendarDays size={18} />
                    </button>
                    <input
                    ref={endRef}
                    type="date"
                    className="no-calendar outline-none w-24 bg-transparent"
                    />
                </div>
                </div>
           {/*Export */}
            <button className=' w-42 h-12 flex justify-center items-center  bg-[#F5F6FA] rounded-full gap-2 cursor-pointer '>
              <h1 className='text-gray-500'>Export</h1> 
                  <CloudUpload className='text-gray-500 '/>
           </button>
   <div className="overflow-hidden rounded-t-2xl ">
       <BookingTable/>
        </div>
         <div className='w-full mb-4 flex flex-wrap justify-between'>
           <p className="text-gray-500 text-md font-semibold pl-4 ">showing 10 from 160 entries</p> 
            <div className='  flex flex-wrap gap-6' >
                 <button
                 className=' w-38 h-10 flex justify-center items-center  text-lg text-[#BD5990]  bg-[#E7D6DF] hover:bg-[#A61866]  cursor-pointer hover:text-white transition duration-300 rounded-xl gap-2 '>
                <ChevronsLeft strokeWidth={2}/>
                  Previous
                </button>
                
                 <div className=' w-62 h-11 flex bg-white rounded-2xl'>
                    <div className={`w-15 h-full flex justify-center items-center text-white font-bold bg-[#A61866] font-bold rounded-2xl`}>
                     <h1 className='text-center'>1</h1>
                   </div>
                   <div className={`w-15 h-full flex justify-center items-center text-[#A61866] font-bold  font-bold rounded-2xl`}>
                     <h1 className='text-center'>2</h1>
                   </div>
                   <div className={`w-15 h-full flex justify-center items-center text-[#A61866] font-bold  font-bold rounded-2xl`}>
                     <h1 className='text-center'>3</h1>
                   </div>
                   <div className={`w-15 h-full flex justify-center items-center text-[#A61866] font-bold font-bold rounded-2xl`}>
                     <h1 className='text-center'>4</h1>
                   </div>
                </div>
                 <button 
                 className=' w-24 h-10  flex justify-center items-center  text-lg text-[#BD5990]  bg-[#E7D6DF] rounded-2xl hover:bg-[#A61866] cursor-pointer hover:text-white transition duration-300 gap-2 '> 
                    Next
                 <ChevronsRight strokeWidth={2}/>
                </button>
            </div>
         </div>      
      </div>
     </div>
        </div>
  )
}

export default Booking