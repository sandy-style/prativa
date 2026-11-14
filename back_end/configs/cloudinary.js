import { v2 as cloudinary } from "cloudinary";

export const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.cloud_name,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.api_key,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.api_secret,
    secure: true,
  });
  console.log("Cloudinary configured");
  return cloudinary;
};

// Also configure immediately on import if env is already loaded
if (process.env.CLOUDINARY_CLOUD_NAME || process.env.cloud_name) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.cloud_name,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.api_key,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.api_secret,
    secure: true,
  });
}

export { cloudinary };
export default connectCloudinary;
