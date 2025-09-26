import Toggle from '../../components/Toggle'
import { Phone,Instagram ,MapPin,Mail} from 'lucide-react';

const Info=({header,icon,infos})=>{
  return(
    <div className='border-b'>
      <div className='flex gap-3 '>
        {/*icon */}
         <div className='w-12  flex text-[#168FF4] justify-center items-center'>
           {icon} 
         </div>
         {/*infos */}

         <div className='flex-1 space-y-2 '>
           <div>
              <h1  className='text-[#8C8484] text-light pt-2'>{header}</h1>
           </div>
          <div className=' mb-4 '>
              <p className='text-white'>{infos}</p>
          </div>
         </div>
      </div>
    </div>
  )
}
const Profile = () => {
  
  return (
      <div className=' scroll-hidden h-screen  overflow-auto '>
       <div className='  space-y-8 '>
         <h1 className="text-xl text-white pt-8 font-semi-bold text-center ">Business Profile</h1>
            <div className='pl-4  space-y-4  w-[90%] '>
               <div className="  flex h-12 bg-[#343434] hover:bg-[#323232] cursor-pointer rounded-sm">
             <Toggle
               name="Show Business Profile"
          />
           </div>
             <p  className='text-[#8C8484]'>Display your business information and provide customers with additional contact options. Also, business information can be used in email notifications.</p>
            </div>

         <div className="w-[90%] ml-4 bg-[#343434] rounded-md">
          <input 
            placeholder="Business  Name"
            className="border border-[#2A2A2A] w-full h-16 border-b outline-none pl-4 text-white"
            type="text"
          />
          <input
            placeholder="Description"
            className="border border-[#2A2A2A] w-full h-16 border-b outline-none pl-4 text-white"
            type="text"
          />
            <div className="relative flex h-16 w-full justify-between mr-4">
             <input type="file" id="fileUpload" class="file-input" />
             <label for="fileUpload" class="file-label"  className="text-md w-20 pl-3 text-white flex justify-center items-center font-semibold">
              Cover
            </label>
             {/* Image box */}
           <div
            className="w-12 h-12 mr-2 mt-2 rounded-md bg-gray-400 bg-center bg-cover"
            style={{ backgroundImage: "url('Event-Booking-1.jpg')" }}
            >
            </div>
          </div>
          <div className="relative flex h-16 w-full justify-between mr-4">
            <input type="file" id="logoUpload" class="logo-input" />
            <label for="logoUpload" class="logo-label"  className="text-md w-20 pl-3 text-white flex justify-center items-center font-semibold">
              Logo
            </label>
             {/* Image box */}
           <div
            className="w-12 h-12 mr-2 mt-2 rounded-md bg-gray-400 bg-center bg-cover"
            style={{ backgroundImage: "url('Event-Booking-1.jpg')" }}
            ></div>
          </div>
        </div>

        {/*Socials*/}
          <div className="w-[90%] h-full  ml-4 bg-[#343434] rounded-md">
          <Info
          header="Phone"
          icon={<Phone/>}
          infos="+251935385438"
          />
            <Info
          header="instagram"
          icon={<Instagram/>}
          infos="+251935385438"
          />
            <Info
          header="Address"
          icon={<MapPin/>}
          infos="+251935385438"
          />
           <Info
          header="Email"
          icon={<Mail/>}
          infos="+251935385438"
          />
           <Info
          header="Website"
          />
         </div>
          <div  className='flex mb-12 justify-center items-center'>
                <button className=' w-56 h-12 text-center text-white font-semibold bg-[#343434] cursor-pointer rounded'> Done </button>
             </div>
          
         
         </div>
         </div>
  )
}

export default Profile