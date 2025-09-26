import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  name: {type:String, required:true},
  description: {type:String, required:true},
  cover: {type:String, required:false},
  logo: {type:String, required:false},
  info: [
    {
      info_type: {type:String, required:true},
      value: {type:String, required:true},
    }
  ]
});


export const  profileModel = mongoose.model('profile',profileSchema)