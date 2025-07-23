import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function Navbar() {
  const { dark, setDark } = useTheme();
  const { authenticated, setAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      <div className="navbar-brand">
        <Link className="navbar-item" to="/dashboard">UniConnect</Link>
      </div>

      <div className="navbar-end">
        <div className="navbar-item buttons">
          <button
            className="button is-light"
            onClick={() => setDark(prev => !prev)}
          >
            <span className="icon">
              <i className={`fas ${dark ? 'fa-sun' : 'fa-moon'}`}></i>
            </span>
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {authenticated && (
            <button
              className="button is-danger ml-2"
              onClick={handleLogout}
            >
              <span className="icon">
                <i className="fas fa-sign-out-alt"></i>
              </span>
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
