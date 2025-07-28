const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });
const auth = require('../middleware/authMiddleware');
const feedController = require('../controllers/feedController');

router.get('/', feedController.getFeed);
router.post('/', auth, upload.single('image'), feedController.createPost);
router.get('/user/:userId', feedController.getUserPosts);
router.post('/:postId/like', auth, feedController.likePost);
router.delete('/:postId', auth, feedController.deletePost);

module.exports = router;
