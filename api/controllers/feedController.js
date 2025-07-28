const Post = require('../models/Post');

// Get all posts (global feed, newest first)
exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort('-createdAt')
      .populate('user', 'name avatar');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load feed', error: err.message });
  }
};

// Create a post (image + text)
exports.createPost = async (req, res) => {
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
};

// Get all posts by a specific user
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort('-createdAt')
      .populate('user', 'name avatar');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load posts' });
  }
};

// Like/unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Not found' });
    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);
    await post.save();
    res.json({ likes: post.likes }); // send likes array, not just length
  } catch (err) {
    res.status(500).json({ message: "Can't like/unlike", error: err.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
