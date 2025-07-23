import React, { useEffect, useState } from 'react';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import { useParams } from 'react-router-dom';

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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getProfile() {
      try {
        // If userId is present in URL, fetch that user's profile, else fallback to logged-in user
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
    <>
     
      
      <section className={`section ${dark ? 'has-background-dark' : ''}`} style={{ fontFamily: "'Roboto', sans-serif" }}>
        <div className="container">
          <div className={`box ${dark ? 'has-background-grey-darker' : ''}`} style={{ borderRadius: '10px' }}>
            <div className="columns is-centered">
              <div className="column is-three-quarters">
                <div className="has-text-centered mb-6">
                  <figure className="image is-128x128 is-inline-block">
                    <img
                      className="is-rounded"
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=512`}
                      alt="avatar"
                      style={{ border: dark ? '3px solid #444' : '3px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                    />
                  </figure>
                  <h1 
                    className={`title mt-4 ${dark ? 'has-text-white' : ''}`} 
                    style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
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
                          <strong className={dark ? 'has-text-white' : ''}>Email:</strong> 
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}