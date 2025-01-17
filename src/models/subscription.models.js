import mongoose from "mongoose";
const SubscriptionSchema=mongoose.Schema({
    sucscriber:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },

},{timestamps:true});

export const Subscription=mongoose.model("Subscription",SubscriptionSchema)