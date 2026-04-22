import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="navbar-logo-icon">💊</div>
        HealthSync <span style={{ color: 'var(--accent-primary)' }}>AI</span>
      </Link>

      <div className="navbar-links">
        {token ? (
          <>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            >
              🏠 <span>Home</span>
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            >
              📄 <span>Reports</span>
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            >
              ⬆️ <span>Upload</span>
            </NavLink>
            <NavLink
              to="/predict"
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            >
              🔮 <span>Predict</span>
            </NavLink>
            <NavLink
              to="/emergency"
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            >
              🚨 <span>Emergency</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            >
              👤 <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
            </NavLink>
            <button
              id="navbar-logout-btn"
              onClick={handleLogout}
              className="navbar-btn navbar-btn-logout"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              Login
            </NavLink>
            <Link to="/signup" className="navbar-btn navbar-btn-primary">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
