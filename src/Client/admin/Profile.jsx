import { useState } from 'react';
import { useService } from "../../Context/ServiceContext";
import Toggle from '../../components/Toggle'
import { Phone,Instagram ,MapPin,Mail} from 'lucide-react';
import {  useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Loader from '../../components/Loader';

export const Info=({header,icon,infos,action})=>{
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
              <input value={infos} onChange={action} className='text-white w-60 h-full outline-none bg-transparent '/>
          </div>
         </div>
      </div>
    </div>
  )
}
const Profile = () => {
const {businessname,setBusinessname,businessDescription,setBusinessDescription,
    cover,setCover,logo,setlogo,
    phone,setphone,instagram,setInstagram,location,setlocation,
    email,setEmail,website,setWebsite}=useService()

    const [loader,setLoader]=useState(false)

const addprofile_info=(profileData)=>{

    const res = axios.post('http://localhost:5000/api/profile',profileData)
    return res.data
   }

   const queryClient =useQueryClient()
const mutation = useMutation({
  mutationFn: addprofile_info,
  onSuccess: () => {
    queryClient.invalidateQueries(['profile_info']);
    setLoader(true)
      setTimeout(()=>{
    setLoader(false)
  },3000)


  },
  onError: (error) => {
    console.error('Error creating profile:', error);
    alert('Failed to create profile: ' + (error.response?.data?.message || error.message));
  }
});



   const handleSubmit = () => {
    const formData = new FormData();
    formData.append('name', businessname);
    formData.append('description', businessDescription);
    formData.append('phone', phone);
    formData.append('instagram', instagram);
    formData.append('location', location);
    formData.append('email', email);
    formData.append('website', website);
    
    if (cover) formData.append('cover', cover);
    if (logo) formData.append('logo', logo);

    mutation.mutate(formData);
  };


  const [coverPreview, setCoverPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCover(file);

      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setlogo(file);
   
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };
  
  return (
      <div className=' scroll-hidden h-screen  overflow-auto '>
        {loader ?
        <div className=' flex justify-center items-center'>
        <Loader/>
        </div>
        :
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
            value={businessname}
            onChange={(e)=>setBusinessname(e.target.value)}
            className="border border-[#2A2A2A] w-full h-16 border-b outline-none pl-4 text-white"
            type="text" 
          />
          <input
            placeholder="Description"
            value={businessDescription}
            onChange={(e)=>setBusinessDescription(e.target.value)}
            className="border border-[#2A2A2A] w-full h-16 border-b outline-none pl-4 text-white"
            type="text"
          />
       <div className="relative flex h-16 w-full justify-between items-center pr-4 border-b border-[#2A2A2A]">
            <label className="text-md pl-4 text-white flex justify-center items-center font-semibold cursor-pointer">
              Cover
              <input 
                onChange={handleCoverChange} 
                type="file" 
                className="hidden" 
                accept="image/*"
              />
            </label>
            <div className="w-12 h-12 mr-2 rounded-md bg-gray-400 bg-center bg-cover overflow-hidden">
              {coverPreview ? (
                <img 
                  src={coverPreview} 
                  alt="Cover preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center  text-gray-600">
                  No cover
                </div>
              )}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="relative flex h-16 w-full justify-between items-center pr-4 border-b border-[#2A2A2A]">
            <label className="text-md pl-4 text-white flex justify-center items-center font-semibold cursor-pointer">
              Logo
              <input 
                onChange={handleLogoChange} 
                type="file" 
                className="hidden" 
                accept="image/*"
              />
            </label>
            <div className="w-12 h-12 mr-2 rounded-md bg-gray-400 bg-center bg-cover overflow-hidden">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  No logo
                </div>
              )}
            </div>
          </div>
        </div>


        {/*Socials*/}
          <div className="w-[90%] h-full  ml-4 bg-[#343434] rounded-md">
          <Info
          header="Phone"
          icon={<Phone/>}
          infos={phone}
          action={(e)=>setphone(e.target.value)}
          />
            <Info
          header="instagram"
          icon={<Instagram/>}
          infos={instagram}
          action={(e)=>setInstagram(e.target.value)}
          />
            <Info
          header="Address"
          icon={<MapPin/>}
          infos={location}
          action={(e)=>setlocation(e.target.value)}
          />
           <Info
          header="Email"
          icon={<Mail/>}
          infos={email}
           action={(e)=>setEmail(e.target.value)}
          />
           <Info
          header="Website"
          infos={website}
          action={(e)=>setWebsite(e.target.value)}
          />
         </div>
          <div  className='flex mb-12 justify-center items-center'>
           <button onClick={handleSubmit}
            disabled={mutation.isLoading}
            className='w-56 h-12 text-center text-white font-semibold bg-[#343434] cursor-pointer rounded hover:bg-[#404040] disabled:opacity-50'
          >
            {mutation.isLoading ? 'Creating...' : 'Done'}</button>
             </div>
          
         
         </div>
}
    
         </div>
  )
}

export default Profile