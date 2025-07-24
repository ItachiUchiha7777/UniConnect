import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function Login() {
  const { setAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post('/auth/login', {
        email,
        password,
      });

      if (res.status === 200) {
        localStorage.setItem('userId', res.data.userId);
        localStorage.setItem('name', res.data.name);

        setAuthenticated(true);
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  return (
    <section className="section is-flex is-justify-content-center is-align-items-center" style={{ height: '100vh' }}>
      <div className="box" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h1 className="title has-text-centered">Login to UniConnect</h1>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field mt-4">
            <label className="label">Password</label>
            <div className="control">
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field mt-5">
            <button type="submit" className="button is-primary is-fullwidth">
              Login
            </button>
          </div>
        </form>

        {/* Register link */}
        <div className="has-text-centered mt-4">
          <p className="is-size-7">
            Don't have an account?{' '}
            <Link to="/register" className="has-text-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
