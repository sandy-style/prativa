import { v2 as cloudinary } from "cloudinary";
const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true, // Click 'View API Keys' above to copy your API secret
  });
  console.log("cloudinary configured");
  return cloudinary;
};

export default connectCloudinary;
