import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedUserName = await AsyncStorage.getItem('name');
        if (storedUserId && storedUserName) {
          setUser({ userId: storedUserId, name: storedUserName });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  const signIn = async (userData) => {
    try {
      await AsyncStorage.setItem('userId', userData.userId);
      await AsyncStorage.setItem('name', userData.name);
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
