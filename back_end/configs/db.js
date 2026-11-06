import mongoose from "mongoose";
const connectdb = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Mongodb connected");
  });
  await mongoose.connect(process.env.DB_URL);
};
export default connectdb;
