import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function SearchUserScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API.get(`/user/search?q=${encodeURIComponent(text)}`);
      setResults(response.data);
    } catch (err) {
      setError('Failed to search users');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="title has-text-centered is-3 mb-5">🔍 Search Users</h1>

        <div className="columns is-centered">
          <div className="column is-full-mobile is-two-thirds-tablet is-half-desktop">
            {/* Search Input */}
            <div className="field has-addons has-addons-centered">
              <div className="control has-icons-left is-expanded">
                <input
                  className="input is-medium"
                  type="text"
                  placeholder="Search by name or registration number"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoCorrect="off"
                  autoCapitalize="words"
                />
                <span className="icon is-left">
                  <i className="fas fa-search"></i>
                </span>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="has-text-centered mt-4">
                <button className="button is-loading is-white is-large is-rounded" disabled>
                  Searching...
                </button>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="notification is-danger is-light mt-3">
                <button className="delete" onClick={() => setError(null)}></button>
                {error}
              </div>
            )}

            {/* No Results */}
            {!loading && query.length > 0 && results.length === 0 && (
              <div className="notification is-warning is-light mt-4 has-text-centered">
                <p>No users found matching your search.</p>
              </div>
            )}

            {/* Search Results */}
            {!loading && results.length > 0 && (
              <div className="box mt-4" style={{ borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                {results.map((user, index) => (
                  <div
                    key={user._id}
                    className={`media is-clickable p-4 ${index < results.length - 1 ? 'mb-4' : ''}`}
                    onClick={() => handleUserClick(user._id)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background 0.3s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="media-left">
                      <figure className="image is-64x64">
                        <img
                          className="is-rounded"
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`
                          }
                          alt="User avatar"
                        />
                      </figure>
                    </div>
                    <div className="media-content">
                      <div className="content">
                        <p className="title is-5 mb-1">{user.name}</p>
                        {user.registrationNumber && (
                          <p className="subtitle is-6 has-text-info mb-1">{user.registrationNumber}</p>
                        )}
                        {user.bio && (
                          <p className="is-size-7 has-text-grey">
                            {user.bio.length > 100 ? `${user.bio.substring(0, 100)}...` : user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
