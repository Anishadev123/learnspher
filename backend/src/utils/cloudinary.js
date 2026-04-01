import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload function
export const uploadToCloudinary = async (filePath, folder = "pdf_uploads") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",        // VERY IMPORTANT for PDFs
      folder: folder,
      use_filename: true,
      unique_filename: false,
      access_mode: "public",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
