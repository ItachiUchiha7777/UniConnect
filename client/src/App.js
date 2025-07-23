import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserProfile from './pages/UserProfile';
import Register from './pages/Register';
import Login from './pages/Login';
import ChatLayout from './pages/ChatLayout'; // ✅ Use this for both dashboard & chat
import Navbar from './components/Navbar';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes() {
  const { authenticated, loading } = useAuth();

  if (loading) return <p className="section">Loading...</p>;

  return (
    <Routes>
      <Route
        path="/login"
        element={authenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={authenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={authenticated ? <ChatLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/chat/:chatId"
        element={authenticated ? <ChatLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/"
        element={<Navigate to={authenticated ? '/dashboard' : '/login'} replace />}
      />
      <Route path="/settings" element={authenticated ? <Settings /> : <Navigate to="/login" />} />
      <Route path="/user/:userId" element={authenticated ? <UserProfile /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
