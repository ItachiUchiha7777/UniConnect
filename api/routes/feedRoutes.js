const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });
const Post = require('../models/Post');
const auth = require('../middleware/authMiddleware');

// Get all posts (global feed, newest first)
router.get('/', async (req, res) => {
  const posts = await Post.find({})
    .sort('-createdAt')
    .populate('user', 'name avatar');
  res.json(posts);
});

// Create a post (image + text)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const post = new Post({
      user: req.user._id,
      text: req.body.text,
      image: req.file ? req.file.path : undefined,
    });
    await post.save();
    const populated = await post.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Post failed', error: err.message });
  }
});

// Like/unlike a post
router.post('/:postId/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Not found' });
  const idx = post.likes.indexOf(req.user._id);
  if (idx === -1) post.likes.push(req.user._id);
  else post.likes.splice(idx, 1);
  await post.save();
  res.json({ likes: post.likes.length });
});
module.exports = router;
