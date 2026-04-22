import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const readStoredUser = () => {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (err) {
    console.error('Failed to parse stored user', err);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = readStoredUser();

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(storedUser);
        }
        
        try {
          // Validate token seamlessly in the background and hydrate fresh user data
          const response = await authAPI.getProfile();
          if (response.data?.user) {
            setUser(response.data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
          }
        } catch (error) {
          // Interceptor will automatically dispatch 'auth:logout' on 401/403
          console.error('Session validation failed during initialization');
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);


  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setToken(null);
    };

    const handleStorageChange = (event) => {
      if (event.key === TOKEN_KEY || event.key === USER_KEY) {
        setToken(localStorage.getItem(TOKEN_KEY));
        setUser(readStoredUser());
      }
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('auth:logout', handleForcedLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: Boolean(token) }}>
      {children}
    </AuthContext.Provider>
  );
};
