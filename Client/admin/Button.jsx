const Button=({width,bg,action})=>{
   return (
        <button
              type="submit"
              onClick={action}
              className={`${width} py-4 font-bold ${bg} text-white rounded-lg hover:bg-[#A54278] cursor-pointer`}>
              Sign in
            </button>
   )
   
}
export default Button