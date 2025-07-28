import React, { useEffect, useState } from 'react';
import API from '../api'; // Your API utility for backend calls
import { useTheme } from '../context/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';

const socialIcons = {
  instagram: 'fab fa-instagram',
  telegram: 'fab fa-telegram',
  twitter: 'fab fa-twitter',
  linkedin: 'fab fa-linkedin',
  github: 'fab fa-github',
  website: 'fas fa-globe',
};

export default function UserProfile() {
  const { dark } = useTheme();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Posts and their loading state
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Logged-in user ID to compare for delete buttons
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch logged-in user profile to get ID
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const res = await API.get('/user/profile');
        setCurrentUserId(res.data._id);
      } catch {
        setCurrentUserId(null);
      }
    }
    fetchCurrentUser();
  }, []);

  // Fetch viewed user profile
  useEffect(() => {
    async function getProfile() {
      try {
        const res = await API.get(userId ? `/user/${userId}` : '/user/profile');
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert('Failed to load profile');
      }
    }
    getProfile();
  }, [userId]);

  // Fetch posts for user
  useEffect(() => {
    if (!userId && !user) return;
    async function getPosts() {
      setPostsLoading(true);
      try {
        const id = userId || (user && user._id);
        if (!id) return;
        // Use your actual API path:
        const res = await API.get(`/feed/user/${id}`);
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to load posts', err);
      } finally {
        setPostsLoading(false);
      }
    }
    getPosts();
  }, [userId, user]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/feed/${postId}`);
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error('Failed to delete post', err);
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <section className={`section ${dark ? 'has-background-dark' : ''}`}>
        <div className="container">
          <div className="has-text-centered py-6">
            <div className={`loading-spinner ${dark ? 'dark-spinner' : ''}`}></div>
            <p className={`mt-4 ${dark ? 'has-text-light' : ''}`}>Loading profile...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className={`section ${dark ? 'has-background-dark' : ''}`} style={{ fontFamily: "'Roboto', sans-serif" }}>
      <div className="container">
        <div className={`box ${dark ? 'has-background-grey-darker' : ''}`} style={{ borderRadius: '10px' }}>
          <div className="columns is-centered">
            <div className="column is-three-quarters">
              {/* Profile header */}
              <div className="has-text-centered mb-6">
                <figure className="image is-128x128 is-inline-block" style={{ cursor: 'pointer' }} onClick={() => navigate(`/user/${user._id}`)}>
                  <img
                    className="is-rounded"
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=512`}
                    alt="avatar"
                    style={{
                      border: dark ? '3px solid #444' : '3px solid #fff',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      objectFit: 'cover',
                      width: '128px',
                      height: '128px',
                    }}
                  />
                </figure>
                <h1
                  className={`title mt-4 ${dark ? 'has-text-white' : ''}`}
                  style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => navigate(`/user/${user._id}`)}
                >
                  {user.name}
                </h1>
                {user.bio && (
                  <p
                    className={`subtitle is-5 ${dark ? 'has-text-light' : 'has-text-grey-dark'}`}
                    style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}
                  >
                    {user.bio}
                  </p>
                )}
              </div>

              <hr className={dark ? 'has-background-grey-light' : ''} />

              {/* Academic & Basic Info */}
              <div className="columns is-multiline">
                <div className="column is-half">
                  <div className="mb-5">
                    <h2
                      className={`subtitle is-4 mb-3 ${dark ? 'has-text-white' : ''}`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      <i className="fas fa-user-graduate mr-2"></i> Academic Details
                    </h2>
                    <div className="content">
                      <p className={dark ? 'has-text-light' : ''}>
                        <strong className={dark ? 'has-text-white' : ''}>Course:</strong> {user.course || 'Not specified'}
                      </p>
                      <p className={dark ? 'has-text-light' : ''}>
                        <strong className={dark ? 'has-text-white' : ''}>Passing Year:</strong> {user.passingYear || 'Not specified'}
                      </p>
                      <p className={dark ? 'has-text-light' : ''}>
                        <strong className={dark ? 'has-text-white' : ''}>Registration No:</strong> {user.registrationNumber || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="column is-half">
                  <div className="mb-5">
                    <h2
                      className={`subtitle is-4 mb-3 ${dark ? 'has-text-white' : ''}`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      <i className="fas fa-info-circle mr-2"></i> Basic Information
                    </h2>
                    <div className="content">
                      <p className={dark ? 'has-text-light' : ''}>
                        <strong className={dark ? 'has-text-white' : ''}>Email:</strong>{' '}
                        <a href={`mailto:${user.email}`} className={`ml-2 ${dark ? 'has-text-info-light' : 'has-text-link'}`}>
                          {user.email}
                        </a>
                      </p>
                      <p className={dark ? 'has-text-light' : ''}>
                        <strong className={dark ? 'has-text-white' : ''}>Location:</strong> {user.state || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Connect */}
              {user.socialMedia?.length > 0 && (
                <>
                  <hr className={dark ? 'has-background-grey-light' : ''} />
                  <h2
                    className={`subtitle is-4 mb-3 ${dark ? 'has-text-white' : ''}`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <i className="fas fa-share-alt mr-2"></i> Connect
                  </h2>
                  <div className="buttons are-medium">
                    {user.socialMedia.map(({ type, url }, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`button is-rounded ${dark ? 'is-dark' : 'is-light'}`}
                      >
                        <span className="icon">
                          <i className={`${socialIcons[type] || 'fas fa-link'}`}></i>
                        </span>
                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </a>
                    ))}
                  </div>
                </>
              )}

              {/* Posts */}
              <hr className={dark ? 'has-background-grey-light' : ''} />
              <h2
                className={`subtitle is-4 mb-3 ${dark ? 'has-text-white' : ''}`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Posts by {user.name}
              </h2>

              {postsLoading ? (
                <p className={dark ? 'has-text-light' : ''}>Loading posts...</p>
              ) : posts.length === 0 ? (
                <p className={dark ? 'has-text-light' : ''}>No posts yet.</p>
              ) : (
                posts.map((post) => (
                  <div
                    className={`box mb-4 ${dark ? 'has-background-grey-dark' : ''}`}
                    key={post._id}
                    style={{ position: 'relative' }}
                  >
                    {/* Delete Button Top Right */}
                    {currentUserId === user._id && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="button is-danger is-small is-rounded"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          lineHeight: 1,
                          zIndex: 10,
                        }}
                        title="Delete post"
                      >
                        <span className="icon is-small">
                          <i className="fas fa-trash"></i>
                        </span>
                      </button>
                    )}

                    <div className="is-flex is-align-items-center mb-1">
                      <img
                        src={
                          post.user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&background=random&size=128`
                        }
                        alt="avatar"
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
                        <figure className="image mb-2" style={{ maxWidth: '50%', margin: 'auto' }}>
                          <img
                            src={post.image}
                            alt=""
                            style={{
                              borderRadius: 12,
                              width: '50%',
                              minwidth: '50%',
                              maxHeight: '400px',
                              objectFit: 'cover',
                            }}
                          />
                        </figure>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
