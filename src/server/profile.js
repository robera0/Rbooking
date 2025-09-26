import express from "express";
import { profileModel } from "./profileModel.js";
const profilerouter = express.Router()


profilerouter.get('/profileinfo',async(req,res)=>{
   
    //get profile infos
    try{
        const profiledata= await profileModel.find()
        res.status(200).json(profiledata)
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})

export default  profilerouter