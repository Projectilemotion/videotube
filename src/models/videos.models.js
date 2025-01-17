import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new mongoose.Schema({
    videofile:{
        type:String, //Cloudnary URL
        required:true,
    },
    thumbnail:{
        type:String,//Cloudnary
        required:true,
    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    desc:{
        type:String,
        required:true,
        trim:true
    },
    duration:{
        type:Number,
        reqired:true
    },
    views:{
        type:Number,
        default:0,
        required:true
    },
    is_published:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
videoSchema.plugin(mongooseAggregatePaginate)
export const videomodels=mongoose.model("Video",videoSchema)