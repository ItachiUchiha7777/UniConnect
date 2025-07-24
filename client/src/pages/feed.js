import React, { useEffect, useState } from 'react';
import API from '../api';
import { useTheme } from '../context/ThemeContext';

export default function Feed() {
  const { dark } = useTheme();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load posts
  useEffect(() => {
    API.get('/feed').then(res => setPosts(res.data));
  }, []);

  // Post creation
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
      setText('');
      setImage(null);
    } catch (err) {
      alert('Could not post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await API.post(`/feed/${postId}/like`);
      setPosts(posts =>
        posts.map(post =>
          post._id === postId
            ? { ...post, likes: Array(res.data.likes).fill('') }
            : post
        )
      );
    } catch {}
  };

  return (
    <section className={`section ${dark ? 'has-background-dark has-text-white' : ''}`}>
      <div className="container" style={{ maxWidth: 600 }}>
        {/* Post Composer */}
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
            <div className="field is-grouped mt-2">
              <div className="control">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImage(e.target.files[0])}
                  disabled={submitting}
                  style={{ maxWidth: 260 }}
                />
              </div>
              <div className="control">
                <button className={`button is-link ${submitting ? 'is-loading' : ''}`} disabled={!(text || image)}>
                  Post
                </button>
              </div>
            </div>
            {image && (
              <figure className="image mt-2" style={{ maxWidth: 180 }}>
                <img src={URL.createObjectURL(image)} alt="preview" style={{ borderRadius: 8 }} />
              </figure>
            )}
          </form>
        </div>
        {/* Feed */}
        {posts.map(post => (
          <div className="box mb-4" key={post._id}>
            <div className="is-flex is-align-items-center mb-1">
              <img
                src={post.user.avatar || `https://ui-avatars.com/api/?name=${post.user.name}`}
                alt=""
                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, objectFit: 'cover' }}
              />
              <span className="has-text-weight-bold">{post.user.name}</span>
              <span className="is-size-7 has-text-grey ml-3">
                {new Date(post.createdAt).toLocaleString()}
              </span>
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
              className="button is-small is-rounded"
              onClick={() => handleLike(post._id)}
              style={{ marginTop: 4 }}
            >
              <span className="icon is-small">
                <i className="fas fa-heart"></i>
              </span>
              <span>
                {post.likes ? post.likes.length : 0}
              </span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
