import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../services/errorUtils';
import StateNotice from '../components/StateNotice';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthSession } = useContext(AuthContext);

  const validate = () => {
    const { name, email, password } = formData;
    const nextErrors = {};

    if (!name) nextErrors.name = 'Name is required.';
    if (!email) nextErrors.email = 'Email is required.';
    if (!password) nextErrors.password = 'Password is required.';

    if (name && name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters long.';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailPattern.test(email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (password && password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long.';
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
      const response = await authAPI.signup(formData);
      const { token, user } = response.data;
      setAuthSession(user, token);
      navigate('/personal-details', { replace: true, state: { from: location.state?.from } });
    } catch (err) {
      setError(getErrorMessage(err, 'Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💊</div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join HealthSync AI for smart medical insights</p>
        </div>

        {error && <StateNotice variant="error" message={error} />}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className={`form-input ${fieldErrors.name ? 'error' : ''}`}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
          </div>

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
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-1">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" state={location.state} className="font-bold text-success">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
