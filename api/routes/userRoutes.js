const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });
const userController = require('../controllers/userController');

router.get('/profile', auth, userController.getProfile);
router.get('/search', userController.searchUsers);
router.put('/profile', auth, userController.updateProfile);
router.post('/avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.get('/:id', userController.getUserById);

module.exports = router;
