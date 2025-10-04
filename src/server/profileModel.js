import { Instagram } from "lucide-react";
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  name: {type:String, required:true},
  description: {type:String, required:true},
  cover: {type:String},
  logo: {type:String},
  info: [{
     Phone:{type:String, required:true},
     Instagram: {type:String, required:false},
     location: {type:String, required:true},
     email: {type:String, required:false},
     website: {type:String, required:false}
    }]
});


export const  profileModel = mongoose.model('profile_infos',profileSchema)