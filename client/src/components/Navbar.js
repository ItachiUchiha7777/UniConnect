import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

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
      <div className="navbar-brand">
        <Link className="navbar-item has-text-weight-bold" to="/dashboard">
          UniConnect
        </Link>
      </div>

      <div className="navbar-end">
        <div className="navbar-item buttons">
          {authenticated && (
            <>
              <Link to="/feed" className="button is-light mr-2">
                <span className="icon">
                  <i class="fa-solid fa-newspaper"></i>
                </span>
                <span>Feed</span>
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
                {/* <span>Settings</span> */}
              </Link>

              <button onClick={handleLogout} className="button is-danger">
                <span className="icon">
                  <i className="fas fa-sign-out-alt"></i>
                </span>
                {/* <span>Logout</span> */}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
