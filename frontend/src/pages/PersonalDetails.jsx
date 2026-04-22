import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../services/errorUtils';
import StateNotice from '../components/StateNotice';

function PersonalDetails() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    age: '',
    bloodGroup: '',
    allergies: '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      if (response.data?.user) {
        login(response.data.user, localStorage.getItem('token'));
      }
      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const redirectPath = location.state?.from?.pathname || '/';
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📋</div>
          <h2 className="auth-title">Personal Details</h2>
          <p className="auth-subtitle">Tell us a bit more about yourself to personalize your experience</p>
        </div>

        {error && <StateNotice variant="error" message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              type="number"
              name="age"
              className="form-input"
              placeholder="e.g. 25"
              value={formData.age}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <input
              type="text"
              name="bloodGroup"
              className="form-input"
              placeholder="e.g. O+, AB-"
              value={formData.bloodGroup}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Allergies</label>
            <input
              type="text"
              name="allergies"
              className="form-input"
              placeholder="e.g. Peanuts, Penicillin"
              value={formData.allergies}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-1">
            {loading ? 'Saving details...' : 'Save & Continue'}
          </button>
        </form>

        <div className="auth-footer">
          <button onClick={handleSkip} className="btn-link">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonalDetails;

