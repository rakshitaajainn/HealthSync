import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../services/errorUtils';
import StateNotice from '../components/StateNotice';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthSession } = useContext(AuthContext);

  const validate = () => {
    const { email, password } = formData;
    const nextErrors = {};

    if (!email) nextErrors.email = 'Email is required.';
    if (!password) nextErrors.password = 'Password is required.';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailPattern.test(email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 ? null : 'Please fix the fields above.';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      setAuthSession(user, token);
      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💊</div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your HealthSync dashboard</p>
        </div>

        {error && <StateNotice variant="error" message={error} />}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className={`form-input ${fieldErrors.email ? 'error' : ''}`}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-input ${fieldErrors.password ? 'error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-1">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup" state={location.state} className="font-bold text-success">Create account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
