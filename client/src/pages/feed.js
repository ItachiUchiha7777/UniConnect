import React, { useEffect, useState } from 'react';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Feed() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [localLikes, setLocalLikes] = useState({}); // Track likes locally
  const currentUserId = localStorage.getItem('userId')?.trim();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get('/feed');
        console.log('Fetched posts:', res.data);
        setPosts(res.data);
        
        // Initialize local likes state
        const initialLikes = {};
        res.data.forEach(post => {
          initialLikes[post._id] = post.likes?.includes(currentUserId) || false;
        });
        setLocalLikes(initialLikes);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    
    fetchPosts();
  }, [currentUserId]);

  const handlePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData();
      if (text) form.append('text', text);
      if (image) form.append('image', image);

      const res = await API.post('/feed', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPosts([res.data, ...posts]);
      setLocalLikes(prev => ({
        ...prev,
        [res.data._id]: false // New post starts with no likes
      }));
      setText('');
      setImage(null);
    } catch (err) {
      console.error('Post error:', err);
      alert('Could not post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      // Optimistic UI update
      setLocalLikes(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
      
      const res = await API.post(`/feed/${postId}/like`);
      console.log('Like response:', res.data);
      
      // Update posts with fresh data from server
      setPosts(posts =>
        posts.map(post =>
          post._id === postId
            ? { ...post, likes: res.data.likes }
            : post
        )
      );
    } catch (err) {
      console.error('Like error:', err);
      // Revert optimistic update if failed
      setLocalLikes(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
      alert("Couldn't like the post");
    }
  };

  return (
    <section className={`section ${dark ? 'has-background-dark has-text-white' : ''}`}>
      <div className="container" style={{ maxWidth: 600 }}>
        {/* Post Box */}
        <div className="box mb-5">
          <form onSubmit={handlePost}>
            <textarea
              className="textarea"
              placeholder="What's happening? (Text or news, up to 280 chars)"
              maxLength={280}
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={submitting}
            />
            <div className="field is-grouped mt-3 is-align-items-center is-flex-wrap-wrap">
              <div className="control">
                <div className="file is-success has-name">
                  <label className="file-label">
                    <input
                      className="file-input"
                      type="file"
                      accept="image/*"
                      onChange={e => setImage(e.target.files[0])}
                      disabled={submitting}
                    />
                    <span className="file-cta">
                      <span className="file-icon">
                        <i className="fas fa-upload"></i>
                      </span>
                      <span className="file-label">Select Image</span>
                    </span>
                    <span className="file-name">{image ? image.name : 'No file selected'}</span>
                  </label>
                </div>
              </div>
              <div className="control">
                <button
                  className={`button is-success ${submitting ? 'is-loading' : ''}`}
                  disabled={!(text || image)}
                >
                  Post
                </button>
              </div>
            </div>
            {image && (
              <figure className="image mt-3" style={{ maxWidth: 180 }}>
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  style={{ borderRadius: 8, border: '1px solid #ddd' }}
                />
              </figure>
            )}
          </form>
        </div>

        {/* Posts */}
        {posts.map(post => {
          const isLiked = localLikes[post._id] || false;
          const likeCount = post.likes?.length || 0;
          
          return (
            <div className="box mb-4" key={post._id}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/user/${post.user?._id}`);
                }}
                className="is-flex is-align-items-center mb-1"
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={post.user.avatar || `https://ui-avatars.com/api/?name=${post.user.name}`}
                  alt=""
                  style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, objectFit: 'cover' }}
                />
                <span className="has-text-weight-bold">{post.user.name}</span>
                <span className="is-size-7 has-text-grey ml-3">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <div>
                {post.text && <p style={{ marginBottom: post.image ? 12 : 0 }}>{post.text}</p>}
                {post.image && (
                  <figure className="image mb-2">
                    <img src={post.image} alt="" style={{ borderRadius: 12, maxWidth: '100%' }} />
                  </figure>
                )}
              </div>
              <button
                className={`button is-small is-rounded ${isLiked ? 'has-background-danger has-text-white' : ''}`}
                onClick={() => handleLike(post._id)}
                style={{ marginTop: 4 }}
              >
                <span className="icon is-small">
                  <i className={`fas fa-heart ${isLiked ? 'has-text-white' : ''}`}></i>
                </span>
                <span>{likeCount}</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}