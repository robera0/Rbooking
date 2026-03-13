import {Star,ThumbsUp ,ThumbsDown} from 'lucide-react'
import { useState } from 'react'
import { RatingBreakdown } from './Cards'
const Review = () => {

  const[likeBtn,setLikeBtn]=useState(15)
  const[dislikeBtn,setDisLikeBtn]=useState(2)
  
  return (
    <div className='space-y-4 pt-4  px-6'>
      <div className='w-full space-x-4 flex border-b-2 pb-18 border-b-gray-300'>
         <div className='w-[200px] h-20 px-12  space-y-4 i'>
              <h1 className='text-4xl font-bold'>4.9</h1>
                 <div className='flex gap-1'>
              {Array(5).fill(null).map((_,idx)=>(          
                  <Star className="w-4 h-4 fill-[#FFE500] text-[#FFE500]" />    
              ))}
                 </div>
               <p className=''>120 reviews</p> 
         </div>
        

          <div className='flex-1 px-8 '>
              <RatingBreakdown/>
          </div>
       </div>

        {/*comments */}
          <div className='w-full  space-y-8'>
             <div className='pt-4 space-y-4'>
             <div className='flex gap-4'>
                 <div className='w-12 h-12 flex items-center justify-center  overflow-hidden rounded-full'>
                   <img 
                   className='w-full h-full object-cover'
                   src="/commentProgile.jpg" 
                   alt="" />
                 </div>

                 <div>
                     <h1 className='font-bold'>Christian Brooks</h1>
                     <p className='text-sm text-gray-400'>2 days ago</p>
                 </div>
             </div>

              <div className='flex gap-1'>
              {Array(5).fill(null).map((_,idx)=>(          
                  <Star className="w-5 h-5 fill-[#FFE500] text-[#FFE500]" />    
              ))}
                 </div>

                 <div>
                  <p>The Salon is thorough.compassionate and truly cares about the patients.i highly recommend this salon! </p>
                 </div>

                 {/*like and unlike icons */}
             <div className="flex gap-6">
              <button 
                 onClick={()=>setLikeBtn(c=>c+1)} 
                  className="flex space-x-2 text-gray-400 hover:text-[#A61866] items-center justify-center transition">
                <ThumbsUp className="w-5 h-5" />
                <span className="font-semibold">{likeBtn}</span>
              </button>

              <button 
               onClick={()=>setDisLikeBtn(c=>c+1)} 
               className="flex space-x-2 text-gray-400 hover:text-red-500 items-center justify-center transition">
                <ThumbsDown className="w-5 h-5" />
                <span className="font-semibold">{dislikeBtn}</span>
              </button>
            </div>
             </div>

           <div className='pt-4 space-y-4'>
             <div className='flex gap-4'>
                 <div className='w-12 h-12 flex items-center justify-center  overflow-hidden rounded-full'>
                   <img 
                   className='w-full h-full object-cover'
                   src="/commentProgile.jpg" 
                   alt="" />
                 </div>

                 <div>
                     <h1 className='font-bold'>Christian Brooks</h1>
                     <p className='text-sm text-gray-400'>1 month ago</p>
                 </div>
             </div>

              <div className='flex gap-1'>
              {Array(5).fill(null).map((_,idx)=>(          
                  <Star className="w-5 h-5 fill-[#FFE500] text-[#FFE500]" />    
              ))}
                 </div>

                 <div>
                  <p>The Salon is thorough.compassionate and truly cares about the patients.i highly recommend this salon! </p>
                 </div>

                 {/*like and unlike icons */}
             <div className="flex gap-6">
              <button 
                 onClick={()=>setLikeBtn(c=>c+1)} 
                  className="flex space-x-2 text-gray-400 hover:text-[#A61866] items-center justify-center transition">
                <ThumbsUp className="w-5 h-5" />
                <span className="font-semibold">{likeBtn}</span>
              </button>

              <button 
               onClick={()=>setDisLikeBtn(c=>c+1)} 
               className="flex space-x-2 text-gray-400 hover:text-red-500 items-center justify-center transition">
                <ThumbsDown className="w-5 h-5" />
                <span className="font-semibold">{dislikeBtn}</span>
              </button>
            </div>
             </div>

          </div>
    </div>
  )
}

export default Review