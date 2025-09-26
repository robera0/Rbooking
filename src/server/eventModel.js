import mongoose from "mongoose";

const EventSchema= new mongoose.Schema ({

    name:{type:String ,required:true},
    description:{type:String ,required:true},
    picture:{type:String ,required:false},
    duration:{type:Number,required:true},
    price:{type:Number,required:true},
    age:{type:String,required:false},
    hour:[{
        start_time:{type:Number,required:true},
        end_time:{type:Number,required:true}
    }],
    header:{type:String,required:true}     

})

export const EventModuel=mongoose.model('event',EventSchema)