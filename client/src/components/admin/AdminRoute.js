import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/* Wrap any route element that should be admin-only */
const AdminRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return null;                 // or a skeleton
  if (!isAuthenticated || user?.role !== 'admin') {
    // push non-admins to home page
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoute;
