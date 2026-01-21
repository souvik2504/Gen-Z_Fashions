import React, { createContext, useContext, useReducer, useEffect } from 'react';
import API from '../api.js';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('token'),
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user data
      fetchUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await API.get('/api/auth/me');
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.data, token: state.token }
      });
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return { success: true,
        message: 'Login successful',
        welcomeCoupon: response.data.welcomeCoupon
      };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await API.post('/api/auth/register', { name, email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    delete API.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
