import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import logoSrc from './icon.png'; // Ensure this path is correct

// Import Font Awesome globally in your app, usually in App.js or index.js:
// import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Navbar() {
  const { authenticated, setAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [isActive, setIsActive] = useState(false);

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
      setAuthenticated(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Failed to logout');
    }
  };

  const toggleMenu = () => {
    setIsActive((prev) => !prev);
  };

  return (
    <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          {/* Logo and text */}
          <Link to="/dashboard" className="navbar-item">
            <img src={logoSrc} alt="UniConnect Logo" style={{ marginRight: '0.5rem' }} />
            <span className="has-text-weight-bold is-size-4">UniConnect</span>
          </Link>
          {/* Burger menu for mobile */}
          {authenticated && (
            <a
  role="button"
  className={`navbar-burger burger ${isActive ? 'is-active' : ''}`}
  aria-label="menu"
  aria-expanded={isActive ? 'true' : 'false'}
  onClick={toggleMenu}
  href="#!"
  tabIndex={0}
  style={{ color: '#171717' }} 
>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
</a>

          )}
        </div>

        {authenticated && (
          <div className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
            <div className="navbar-end">
              <div className="navbar-item">
                <div className="buttons">
                  <Link to="/feed" className="button is-light mr-2">
                    <span className="icon"><i className="fas fa-newspaper"></i></span>
                    <span>Feed</span>
                  </Link>
                  <Link to="/search" className="button is-light mr-2">
                    <span className="icon"><i className="fas fa-search"></i></span>
                  </Link>
                  <Link to={`/user/${userId}`} className="button is-light mr-2">
                    <span className="icon"><i className="fas fa-user"></i></span>
                  </Link>
                  <Link to="/settings" className="button is-light mr-2">
                    <span className="icon"><i className="fas fa-cog"></i></span>
                  </Link>
                  <button onClick={handleLogout} className="button is-danger">
                    <span className="icon"><i className="fas fa-sign-out-alt"></i></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
