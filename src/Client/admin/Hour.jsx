import AvailableHrs from './HourMenue'
const Hour = () => {
  return (
       <div>
         <h1 className="text-xl text-white pt-8 font-semi-bold text-center ">Available Hours</h1>
           <div className="w-full h-full flex flex-col flex-wrap space-y-8 items-center mt-8">
             <AvailableHrs/>
            </div>
        </div>
  )
}

export default Hour