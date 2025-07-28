import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import debounce from 'lodash.debounce';

export default function SearchUserScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage
  const addToRecent = (user) => {
    const updated = [user, ...recentSearches.filter((u) => u._id !== user._id)].slice(0, 10); // Keep 10 max
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Clear recent search
  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const handleUserClick = (user) => {
    addToRecent(user);
    navigate(`/user/${user._id}`);
  };

  const performSearch = async (text) => {
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
      console.error('Search error:', err);
      setError('Failed to search users');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(debounce(performSearch, 500), []);

  const handleInputChange = (text) => {
    setQuery(text);
    debouncedSearch(text);
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
                  onChange={(e) => handleInputChange(e.target.value)}
                  autoCorrect="off"
                  autoCapitalize="words"
                />
                <span className="icon is-left">
                  <i className="fas fa-search"></i>
                </span>
              </div>
            </div>

            {/* Clear Recent */}
            {recentSearches.length > 0 && !query && (
              <div className="mb-4">
                <div className="is-flex is-justify-content-space-between is-align-items-center">
                  <p className="subtitle is-6 mb-1 has-text-grey">Recent Searches</p>
                  <button className="button is-small is-text has-text-danger" onClick={clearRecentSearches}>
                    Clear all
                  </button>
                </div>
                <div className="box" style={{ borderRadius: '10px' }}>
                  {recentSearches.map((user) => (
                    <div
                      key={user._id}
                      className="media is-clickable p-3"
                      onClick={() => handleUserClick(user)}
                      style={{ cursor: 'pointer', transition: 'background 0.3s' }}
                      // onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                      // onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="media-left">
                        <figure className="image is-48x48">
                          <img
                            className="is-rounded"
                            src={
                              user.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`
                            }
                            alt="avatar"
                          />
                        </figure>
                      </div>
                      <div className="media-content">
                        <p className="title is-6 mb-0">{user.name}</p>
                        {user.registrationNumber && (
                          <p className="subtitle is-7 has-text-info">{user.registrationNumber}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="has-text-centered mt-4">
                <button className="button is-loading is-white is-large is-rounded" disabled>
                  Searching...
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="notification is-danger is-light mt-3">
                <button className="delete" onClick={() => setError(null)}></button>
                {error}
              </div>
            )}

            {/* No Results */}
            {/* {!loading && query.length > 0 && results.length === 0 && (
              <div className="notification  mt-4 has-text-centered">
                <p>No users found matching your search.</p>
              </div>
            )} */}

            {/* Search Results */}
            {!loading && results.length > 0 && (
              <div className="box mt-4" style={{ borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                {results.map((user, index) => (
                  <div
                    key={user._id}
                    className="media is-clickable p-4"
                    onClick={() => handleUserClick(user)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background 0.3s',
                    }}
                    // onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')} 
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
