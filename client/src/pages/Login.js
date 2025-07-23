import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        password
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
    <section className="section">
      <h1 className="title">Login</h1>
      <form onSubmit={handleLogin}>
        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="button is-primary">Login</button>
      </form>
    </section>
  );
}
