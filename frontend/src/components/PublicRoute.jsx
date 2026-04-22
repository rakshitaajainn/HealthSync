import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function PublicRoute() {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={styles.loading}>Checking your session...</div>;
  }

  if (token) {
    return <Navigate to="/" replace />;
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

export default PublicRoute;
