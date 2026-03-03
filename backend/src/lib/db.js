import mongoose from "mongoose"

export const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.mongo_URI)
        console.log("mongoDB connected", conn.connection.host);
    }
    catch(error)
    {
        console.error("Error connection to mongoDB", error);
        process.exit(1); // 1 status code for fail and 0 for success
    }
}