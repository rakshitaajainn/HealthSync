import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute() {
  const { token, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div style={styles.loading}>Checking your session...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

const styles = {
  loading: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '1rem',
    color: '#555',
  },
};

export default ProtectedRoute;
