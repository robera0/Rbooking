import Toggle from "../../components/Toggle"
const Notification = () => {
  return (
      <div className=' scroll-hidden h-screen  overflow-auto '>
       <div className='  space-y-8 '>
         <h1 className="text-xl text-white pt-8 font-semi-bold text-center ">Notification</h1>
            <div className='pl-4  space-y-4  w-[90%] '>
               <div className="  flex h-12 bg-[#343434] hover:bg-[#323232] cursor-pointer rounded-sm">
             <Toggle
               name="Booking Confirmation to Client"
          />
           </div>
             <p  className='text-[#8C8484]'>Sends a confirmation email to clients with appointment details upon booking.</p>
            </div>
            <div className='pl-4  space-y-4  w-[90%] '>
               <div className="  flex h-12 bg-[#343434] hover:bg-[#323232] cursor-pointer rounded-sm">
             <Toggle
               name="Owner Booking to Notification"
          />
           </div>
             <p  className='text-[#8C8484]'>Notifies the business owner via email when a new appointment is booked.</p>
            </div>
             <div className="mb-4 space-y-2">
            <input
              className="w-[90%] ml-4 mt-3 text-white bg-[#3C3C3C] h-12 outline-none px-4"
              placeholder="Owner Email..."
              type="text"
            />
          </div>
             

          </div>
          </div>
  )
}

export default Notification