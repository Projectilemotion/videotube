import jwt from "jsonwebtoken"
import { usermodel } from "../models/user.models.js"

const verifyjwt=async (req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearrer ","")
        if(!token){
            res.status(400).json({"error":"unauthorised request"})
        }
        const decodetoken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await usermodel.findById(decodetoken?._id)
        if (!user) {
            res.status(400).json({"error":"token is invalid"})
            
        }
        req.user=user 
        next()
    } catch (error) {
        return res.status(400).json({"error":"failed to get user from jwt token"})
    }
}

export {verifyjwt}