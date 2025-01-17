import { Mongoose, Schema } from "mongoose";
import { videomodels } from "./videos.models.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true //for making searching easy
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true
    },
    avatar:{
        type:String,//cloudanary
        required:true,
    },
    coverimage:{
        type:String,//cloudnary
    },
    videoHistory:{
        type:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
    refreshToken:{
        type:String
    }
},{timestamps:true});

userSchema.pre("save",async function (next){
    if(!this.isModified("password")){
        return next()
    }
    this.password=await bcrypt.hash(this.password,10)
    next()
}) //in this we dont use arrow function because arrow function dont gives us context

userSchema.methods.isPasswordCorrect=async function(password) {
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = async function() {
    const token = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username, // Add more fields as needed
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
    return token; // Return the generated token
}
userSchema.methods.generateRefreshToken=async function(){
    const token=jwt.sign({_id:this._id, //this is refreshing many times so we uswed only one field
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    );
    return token
}
export const usermodel=mongoose.model("User",userSchema)