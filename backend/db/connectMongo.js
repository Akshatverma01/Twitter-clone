import mongoose from "mongoose";

const connectMongo = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connection to mongoDB ${conn.connection.host} `)
    } catch (error) {
        console.log(`Error connection to mongoDB ${error.message}`)
        process.exit(1);
    }
}
export default connectMongo;