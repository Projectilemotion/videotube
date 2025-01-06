import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const database_connection = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n mongodb connected Host:-${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection error:-"+error)
        process.exit(1)
    }
}
export default database_connection