import { Router } from "express";
import { ChangeUserPassword, GetCurrentUser, GetUserChannelProfile, loginuser, logoutUser, refreshAccessToken, registerUser, UpdateUserAvatar, UpdateUserCoverImage,VideoHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer. middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router(); 
// Route for user registration
router.route("/register").post(
    upload.fields([                         //middleware to upload files
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser);
    router.route("/login").post(loginuser)
router.route("/logout").post(verifyjwt, logoutUser)
router.route("/refreshaccesstoken").post(refreshAccessToken)
router.route("/ChangeUserPassword").post(verifyjwt,ChangeUserPassword)
router.route("/GetCurrentUser").post(verifyjwt, GetCurrentUser)
router.route("/UpdateUserAvatar").post(upload.fields([                         //middleware to upload files
    { name: "avatar", maxCount: 1 }
]),verifyjwt,  UpdateUserAvatar)
router.route("/UpdateUserCoverImage").post(upload.fields([                         //middleware to upload files
    { name: "coverImage", maxCount: 1 }
]),verifyjwt,  UpdateUserCoverImage)
router.route("/GetUserChannelProfile/:username").post(verifyjwt,GetUserChannelProfile)
router.route("/VideoHistory").post(verifyjwt, VideoHistory)



// registerUser,
//     loginuser,
//     logoutUser,
//     refreshAccessToken,
//     ChangeUserPassword,
//     GetCurrentUser,
//     UpdateUserAvatar,
//     UpdateUserCoverImage,
//     GetUserChannelProfile,
//     VideoHistory,
export default router; 