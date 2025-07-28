import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import logoSrc from './icon.png'; // Make sure this path is correct

export default function Navbar() {
  const { authenticated, setAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

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

  return (
    <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          {/* Logo on the far left */}
          <Link to="/dashboard" className="navbar-item">
            <img 
              src={logoSrc} 
              alt="UniConnect Logo" 
              style={{ 
                // maxHeight: '20px',
                // marginRight: '0.5rem'
              }} 
            />
            <span className="has-text-weight-bold is-size-4">UniConnect</span>
          </Link>
        </div>

        {authenticated && (
          <div className="navbar-menu">
            <div className="navbar-end">
              <div className="navbar-item">
                <div className="buttons">
                  <Link to="/feed" className="button is-light mr-2">
                    <span className="icon">
                      <i className="fa-solid fa-newspaper"></i>
                    </span>
                    <span>Feed</span>
                  </Link>
                  <Link to="/search" className="button is-light mr-2">
                    <span className="icon">
                      <i className="fas fa-search"></i>
                    </span>
                  </Link>
                  <Link to={`/user/${userId}`} className="button is-light mr-2">
                    <span className="icon">
                      <i className="fa-solid fa-user"></i>
                    </span>
                  </Link>
                  <Link to="/settings" className="button is-light mr-2">
                    <span className="icon">
                      <i className="fas fa-cog"></i>
                    </span>
                  </Link>
                  <button onClick={handleLogout} className="button is-danger">
                    <span className="icon">
                      <i className="fas fa-sign-out-alt"></i>
                    </span>
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