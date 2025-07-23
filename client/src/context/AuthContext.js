import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Run once on mount
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      await API.get('/chats/user'); 
      setAuthenticated(true);
    } catch {
      setAuthenticated(false);
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
