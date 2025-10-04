import mongoose from "mongoose";

const EventSchema= new mongoose.Schema ({

    name:{type:String ,required:true},
    description:{type:String ,required:true},
    picture:{type:String },
    duration:{type:Number},
    price:{type:Number,required:true},
    age:{type:String},
    hour:[{
        start_time:{type:Number},
        end_time:{type:Number}
    }],
    header:{type:String}     

})

export const EventModuel=mongoose.model('event',EventSchema)