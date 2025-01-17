//http:localhost:8000/api/v1/users/registeruser
import {usermodel} from "../models/user.models.js"
import { upload_on_cloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
const generateaccessandrefreshtokens = async (user_id) => {
    try {
        const user = await usermodel.findById(user_id);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        
        // Debug log to check refreshToken
        console.log("Generated Refresh Token:", refreshToken);

        // Save the refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error(`Error generating tokens: ${error.message}`);
    }
}

const registerUser = async (req,res,next)=>{
    //get user data from frontend
    //validations of not empty
    //if user already exist
    //check for images and avatar
    //upload them to cloudinary
    //take url from cloudinary
    //create user object
    //create entry in database
    //remove password and response token from response
    //check for user creation
    //return response
    const {fullName,email,username,password}=req.body //user data from frontend.
    console.log("email:-"+email)
    console.log("name:-"+fullName)
    //validations of not empty
    if([fullName,email,username,password].map((item,index) => item.trim() === "").includes(true)){
        return res.status(400).json({ error: "field should not be empty" });
    }
    //if user already exist
    const existeduser=await usermodel.findOne({
        $or:[{username},{email}]
    })
    if (existeduser){
        return res.status(400).json({ error: "useralready exist" });
    }
    //check for images and avatar
    //req.body doesnot gives us the images but we use multer which will gives us required files
    console.log(req.files?.avatar)
    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    const coverImagelocalpath = req.files?.coverImage?.[0]?.path;

    if (!avatarlocalpath) {
        return res.status(400).json({"error":"avatar file is required"})
    }
    //upload to cloudinary
    const avatar = await upload_on_cloudinary(avatarlocalpath);
    const cover = coverImagelocalpath ? await upload_on_cloudinary(coverImagelocalpath) : null;
    if (!avatar?.url) {
        return res.status(400).json({"error":"avatar not uploaded plese refill form"})
    }
    const user=await usermodel.create({
        fullname:fullName,
        avatar:avatar.url,
        coverImage:cover?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    const user_created=await usermodel.findById(user._id) //it will check user is create dor not 
    if (!user_created) {
        return res.status(400).json({"error":"error in server user not created"})
    }
    
    return res.status(201).json({
        user_created
    })
}



const loginuser = async (req,res,next)=>{
    //get user username and password if username or email is null return
    //see if user exist or not in database
    //if password and username are correct
    //generate access token
    //generate refresh token
    //send cookies
    //send response 
    console.log(req.body)
    const {user,password}=req.body
    console.log(user,password)
    if(!user || !password){
        return  res.status(400).json({
            "error":"fields cannot be empty"
        })
    }
    // see if user exist or not
    const u= (await usermodel.findOne({username:user}) )|| (await usermodel.findOne({email:user}) )

    if(!u){
        return res.status(400).json({
            "error":"user does not exist"
        })
    }
    const is_pass =await u.isPasswordCorrect(password)
    if(!is_pass){
        return res.status(400).json({"error":"password is incorrect"})
    }


    //we have to generate refresh token and access token myultiple times so we will make a method of it so that it will be easier for us.
    const { accessToken, refreshToken } = await generateaccessandrefreshtokens(u._id);


    //calling user another time because generate access toke now users refresh token is filled 
    const user_updated= await usermodel.findById(u._id)
    // Log tokens for debugging
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);


    //send cookies
    const options={
        httpsOnly:true,
        secure:false //we have to make secure false because localhost send http ot https
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json({user:user_updated, accessToken,refreshToken})
}



const logoutUser= async(req,res,next)=>{
    //remove refresh token from db 
    //remove cookies
    await usermodel.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpsOnly:true,
        secure:false
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json({"user logged out successfully":""})
}

const refreshAccessToken = async (req,res)=>{
    const refresh_Token=req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearrer ","")
    console.log("refresh_Token:-"+refresh_Token)
    if(!refresh_Token){
        return res.status(400).json({"error":"no refresh token"})
    }
    const decodetoken = await jwt.verify(refresh_Token,process.env.REFRESH_TOKEN_SECRET)
    const user=await usermodel.findById(decodetoken?._id)
    if(!user){
        return res.status(400).json({"error":"user not found"})
    }
    if(refresh_Token!=user.refreshToken){
        return res.status(400).json({"error":"refresh token is expired or used"})
    }

    const { accessToken, refreshToken } = await generateaccessandrefreshtokens(user._id);

    if(!accessToken || !refreshToken){
        return res.status(400).json({"error":"faield internal server error"})
    }
    const options={
        httpsOnly:true,
        secure:false //we have to make secure false because localhost send http ot https
    }

    const updated_user=await usermodel.findById(user._id)// get updataed user details after saveing its new refresh token value

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json({user:updated_user, accessToken,refreshToken})
}


const ChangeUserPassword= async (req,res,next)=>{
    const {oldpassword,password}=req.body
    if (!password || !oldpassword){
        return res.status(400).json({"error":"fields cannot be empty"})
    }
    const user= await usermodel.findById(req.user._id)
    if(!user){
        return res.status(400).json({"error":"user not found"})
    }
    const is_old_password_correct=await user.isPasswordCorrect(oldpassword)
    if(!is_old_password_correct){
        return res.status(400).json({"error":"password is incorrect"})
    }
    user.password=password
    await user.save({validateBeforeSave:false})
    return res.status(200).json({"new":"new password changed successfully"})
}
const GetCurrentUser=async(req,res,next)=>{
    const user=await usermodel.findById(req.user._id);
    if(!user){
        return res.status(400).json({"error":"cannot get user user details"})
    }
    return res.status(200).json({"user":user})
}

const UpdateUserAvatar=async(req,res,next)=>{
    const user=await usermodel.findById(req.user?._id)
    console.log(user)
    if(!user){
        return res.status(400).json({"error":"user not found"})
    }
    const avatarlocalpath =req.files?.avatar?.[0]?.path
    if(!avatarlocalpath){
        return res.status(400).json({"error":"avatar file not found"})
    }
    const ava=await upload_on_cloudinary(avatarlocalpath);
    if(!ava?.url){
        return res.status(400).json({"error":"failed to save to server"})
    }
    user.avatar=ava.url 
    await user.save({validateBeforeSave:false})
    return res.status(200).json({"user":user})
}
const UpdateUserCoverImage=async(req,res,next)=>{
    const user=await usermodel.findById(req.user._id)
    if(!user){
        return res.status(400).json({"error":"user not found"})
    }
    const coverimagelocalpath =req.files?.coverImage?.[0]?.path
    if(!coverimagelocalpath){
        return res.status(400).json({"error":"coverimage file not found"})
    }
    const cov=await upload_on_cloudinary(coverimagelocalpath);
    if(!cov?.url){
        return res.status(400).json({"error":"failed to save to server"})
    }
    user.coverImage=cov.url 
    await user.save({validateBeforeSave:false})
    return res.status(200).json({"user":user})
}
const GetUserChannelProfile=async(req,res,next)=>{
    const {username}=req.params;
    if(!username){
        return res.status(400).json({"error":"provide username"})
    }
    const user_channel=await usermodel.aggregate([
        {
            $match:{
                username:username
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"Sucscribers_of_channel"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"sucscriber",
                as:"subscribed_to"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$Sucscribers_of_channel"
                },
                channel_subscribed_to_Count:{
                    $size:"$ubscribed_to"
                },
                is_subscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$Sucscribers_of_channel.sucscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },{
            $project:{
                fullname:1,
                username:1,
                avatar:1,
                coverimage:1,
                subscribersCount:1,
                channel_subscribed_to_Count:1,
                is_subscribed:1
            }
        }
    ])

    console.log(user_channel)
    if(!channel?.length){
        return res.status(400).json({"error":"channel does not exist"})
    }

    return res.status(200).json({"channel":channel[0]})
}
const VideoHistory=async(req,res,next)=>{
    const user_history=await usermodel.aggregate([
        {   
            $match:{
            _id:new mongoose.Types.ObjectId(req.user._id)
            //mongoose dont work directly in case of pipleline so we have to write like this 
        }},
        {
            $lookup:{
                from:"videos",
                localField:"videoHistory",
                foreignField:"_id",
                as:"videos_history",
                pipeline:[
                    {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"videos_owner"
                    }
                }
            ]
            },

        }
    ])
    return res.status(200).json({"watch_history":user_history})
}
export {registerUser,
    loginuser,
    logoutUser,
    refreshAccessToken,
    ChangeUserPassword,
    GetCurrentUser,
    UpdateUserAvatar,
    UpdateUserCoverImage,
    GetUserChannelProfile,
    VideoHistory,
}