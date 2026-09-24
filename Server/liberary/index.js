import cloudinary from "./cloudinaryClient.js";
import ImageUploader from "./ImageUploader.js";

const imageUploader = new ImageUploader(cloudinary);

export { cloudinary, ImageUploader, imageUploader };
