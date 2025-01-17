import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
)) //by default browser use same origin policy which restrict webpage to request resources from another domain. This is done to prevent malicious websites from reading sensitive data from another domain (for example, stealing data from a bank's website).However, many legitimate use cases require websites to access resources from different origins. CORS provides a safe way to allow such cross-origin requests.
app.use(express.json())
app.use(express.urlencoded({ extended: true }))//it is used to get the data from url after endcoding it for example aom kapadia--aom%20kapadia
app.use(express.static("public"))// a folder to keep files likes images,pdfs,etc in same server
app.use(cookieParser())//cookie parser used to acces and write user cookies

import userRouter from "./routes/user.routes.js";
//routes declaration

//here we previously simply write app.get but now we have to call use middleware as our routes is in different place
app.use("/api/v1/users",userRouter)

//http:localhost:8000/api/v1/users/
export {app}

