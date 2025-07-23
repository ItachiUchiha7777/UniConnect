const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary config:');
console.log('cloud_name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Loaded' : 'Missing');
console.log('api_key:', process.env.CLOUDINARY_API_KEY ? 'Loaded' : 'Missing');
console.log('api_secret:', process.env.CLOUDINARY_API_SECRET ? 'Loaded' : 'Missing');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uniconnect_avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

module.exports = { cloudinary, storage };
