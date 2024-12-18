const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "animehub/avatars", // 专门存储头像的文件夹
    allowed_formats: ["jpg", "jpeg", "png", "gif"], // 允许的文件格式
    transformation: [{ width: 200, height: 200, crop: "fill" }], // 统一头像尺寸
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
