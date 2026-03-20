import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
<<<<<<< HEAD

dotenv.config();

// Configure Cloudinary
=======
dotenv.config();

>>>>>>> 539544f362f62255fd334c789173601b3328f803
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

<<<<<<< HEAD
// Upload function
export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",        // VERY IMPORTANT for PDFs
      folder: "pdf_uploads",
      use_filename: true,
      unique_filename: false,
      access_mode: "public",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
=======
export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "chatpdf_uploads",
      resource_type: "auto",
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    console.error("CLOUDINARY UPLOAD ERROR:", err);
    throw err;
>>>>>>> 539544f362f62255fd334c789173601b3328f803
  }
};
