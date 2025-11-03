import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Optionally, validate token with backend here
          setUser({ token });
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (token, userData) => {
    try {
      await AsyncStorage.setItem('token', token);
      setUser({ token, ...userData });
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      // Optionally clear other stored data if any
      setUser(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
