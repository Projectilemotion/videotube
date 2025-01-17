import { app } from "./app.js";
import database_connection from "./db/index.js";
import dotenv from 'dotenv';  // If using ES Modules
dotenv.config();
database_connection()
.then(()=>{
    console.log("databse successfully connected")
    app.on("error",(error)=>{
        console.log("error in app:-"+error);
        process.exit(1)
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log("server is running at port:-"+process.env.PORT)
    })
})
.catch((err)=>{
    console.log("error-" +err);
})

