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
    folder: "animehub", // 你的文件夹名称
    allowed_formats: ["jpg", "jpeg", "png", "gif"], // 允许的文件格式
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
